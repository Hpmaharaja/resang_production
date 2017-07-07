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
    cluster_id: 1,
    __v:2,
    images:['http://www.castnc.org/photos/ski/skiing.jpg',
            'https://c2.staticflickr.com/9/8817/28973449265_07e3aa5d2e_b.jpg',
            'https://c2.staticflickr.com/9/8356/28897120681_3b2c0f43e0_b.jpg',
            'https://c6.staticflickr.com/9/8890/28897154101_a8f55be225_b.jpg',
          ],
    keywords: ['Outdoors, Nature']},

  {
    cluster_id: 2,
    _v:2,
    images:['https://c6.staticflickr.com/9/8342/28897193381_800db6419e_b.jpg',
            'http://r.ddmcdn.com/w_830/s_f/o_1/cx_98/cy_0/cw_640/ch_360/APL/uploads/2015/07/cecil-AP463227356214-1000x400.jpg',
            'http://yourshot.nationalgeographic.com/u/fQYSUbVfts-T7pS2VP2wnKyN8wxywmXtY0-FwsgxoQUUu64xTHoh4QtE4gfZ1c2E7eHDcd_DPzchhzA96lON/',
            'http://weknownyourdreamz.com/images/animals/animals-04.jpg'

    ],
    keywords: ['Animals']
  }
],
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
      <section>
        <div className = ".section">

            <img src={imageURL.imageURL} onLoad={this.handleImageLoaded.bind(this)}
            onError={this.handleImageErrored.bind(this)} />

      </div>
      </section>
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
        <h3>Your Memories</h3>
        <div id="outer-container" style={{height: '100%'}}>
          <LeftSidebar />
        </div>
       <div className= ".imgdisplay">

          </div>
        <div>
          { cluster_group }
          <div className='.section' >
          <div className= '.imgdisplay'>
           {/*}<h3>Memory{ this.props.cluster_id }</h3>*/}
           {/*{ images }*/}
           </div>
          </div>
        </div>
        </div>

      //</div>
    );
  }

}

Dashboard.defaultProps = {
  username: 'Anonymous'
};

export default Dashboard;
