import React from 'react';
import Lightbox from 'react-images';

require('../styles/ChatApp.css'); 

class Cluster extends React.Component {
  constructor(props) {
    super(props);
    this.state = { imageStatus: 'loading' };
  }

  handleImageLoaded() {
    this.setState({ imageStatus: 'loaded' });
  }

  handleImageErrored() {
    this.setState({ imageStatus: 'failed to load' });
  }

  render() {
    // console.log(this.props);
    const images = this.props.images.map((imageURL, i) => {
      return (
        <span className='cluster-images'>
          <img //className='image-for-grid'
          src={imageURL} onLoad={this.handleImageLoaded.bind(this)}
          onError={this.handleImageErrored.bind(this)} />
          </span>
      );
    });


    const keywords = this.props.keywords.map((keyword, i, arr) => {

      return (
          <span key={i}>
              { keyword }
             </span>
      );
    });

  //  const imageSet = [{images}, {keywords}];

    return (
  //    <Lightbox
  //  images={imageSet}
  //  isOpen={this.state.lightboxIsOpen}
  //  onClickPrev={this.gotoPrevious}
  //  onClickNext={this.gotoNext}
  //  onClose={this.closeLightbox}
  // />


    //<div //className='cluster-container'
    //  >

    //   <h1>Cluster ID: { this.props.cluster_id }</h1>

      //  <div //className='cluster-keyword'
      //  >
      //    { keywords }
      //  </div>
        <div className='.section' >
        <div className= '.imgdisplay'>
         <h4>Cluster { this.props.cluster_id }: {keywords }</h4>
         { images }
         </div>
        </div>
    //  </div>
    );
  }
}

Cluster.defaultProps = {
  imageURL: '',
  username: ''
};

export default Cluster;
