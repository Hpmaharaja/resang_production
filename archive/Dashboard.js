require('../styles/ChatApp.css');

import React from 'react';
import axios from 'axios';
import LeftSidebar from './menu';

import Cluster from './Cluster';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = { images: [{ username: 'Heran', imageURL: 'http://localhost:5000/images/?image=heran_1438892674000_IMG_6517.JPG.jpg'}],
    temp_images: [{ userName: 'Heran', pathTofile: 'http://localhost:5000/images/?image=heran_1438892674000_IMG_6517.JPG.jpg'}],
    clusters: [{ _id: 20,
    cluster_id: 0,
    __v:2,
    images:['http://www.castnc.org/photos/ski/skiing.jpg'],
    keywords: ['Skiing','Exercise']}],
    imageStatus: 'loading' };

    this.redirectSubmitHandler = this.redirectSubmitHandler.bind(this);
  }

  handleImageLoaded() {
    this.setState({ imageStatus: 'loaded' });
  }

  handleImageErrored() {
    this.setState({ imageStatus: 'failed to load' });
  }

  redirectSubmitHandler(event) {
    event.preventDefault();
    window.location.href = 'http://localhost:8000';
  }

  componentDidMount() {
    // GET IMAGE URLS
    const temp_images = this.state.temp_images;
    axios.get('http://localhost:5000/images_db')
      .then(res => {
        // console.log(res);
        res.data.map((obj) => temp_images.push(obj));
        this.setState({ temp_images });
        console.log(this.state.temp_images);
        this.state.temp_images.map(function(imgobj) {
          // console.log(i);
          // console.log(mes);
          const imageObject = {
            username: imgobj.userName,
            imageURL: imgobj.pathTofile
          };
          if (imgobj.userName === this.props.username) {
            imageObject.fromMe = true;
          } else {
            imageObject.fromMe = false;
          }
          console.log(imageObject);
          const images = this.state.images;
          images.push(imageObject);
          this.setState({ images });
        }, this);
    });

    // GET IMAGES CLUSTERS
    const clusters = this.state.clusters;
    axios.get('http://localhost:5000/clusters_db')
      .then(res => {
        // console.log(res);
        res.data.map(function(cluster) {
          console.log(cluster);
          clusters.push(cluster);
          this.setState({ clusters });
        }, this);
    });
  }

  showLeft() {
    this.refs.left.show();
  }

  render() {
    const images = this.state.images.map((imageURL, i) => {
      return (
      <div>
        <figure>
            <img className='image-for-grid' src={imageURL.imageURL} onLoad={this.handleImageLoaded.bind(this)}
            onError={this.handleImageErrored.bind(this)} />
            <figcaption>
              <p>Keyword:</p>
            </figcaption>
        </figure>
      </div>
      );
    });

    const cluster_group = this.state.clusters.map((cluster, i) => {
      // console.log(cluster);
      return (
        <div>
      <Cluster images={ cluster.images } keywords={ cluster.keywords } cluster_id={cluster.cluster_id} />
        </div>
      );
      });



    return (

     <div className="container">
       <h3>RESANG Memories Dashboard</h3>
       <div id="outer-container" style={{height: '100%'}}>
         <LeftSidebar />
         <div id="page-wrap">
           <p></p>
         </div>
       </div>
       <div className='image-grid'>
         { images }
       </div>



       <div>
         { cluster_group }
       </div>
     </div>
   );
 }

}


Dashboard.defaultProps = {
  username: 'Anonymous'
};

export default Dashboard;
