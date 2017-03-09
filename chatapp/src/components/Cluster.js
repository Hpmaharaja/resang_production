import React from 'react';

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
          <img className='image-for-grid' src={imageURL} onLoad={this.handleImageLoaded.bind(this)}
          onError={this.handleImageErrored.bind(this)} /> 
      );
    });

    const keywords = this.props.keywords.map((keyword, i) => {
      return (
          <div>
              { keyword }
          </div>
      );
    });

    return (
      <div className='cluster-container'>
        <h1>Cluster ID: { this.props.cluster_id }</h1>
        <div className='cluster-keyword'>
          { keywords }
        </div>
        <div className='cluster-images'>
          { images }
        </div>
      </div>
    );
  }
}

Cluster.defaultProps = {
  imageURL: '',
  username: ''
};

export default Cluster;
