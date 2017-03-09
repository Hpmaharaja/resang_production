import React from 'react';

class Image extends React.Component {
  render() {
    // Was the message sent by the current user. If so, add a css class
    const fromMe = this.props.fromMe ? 'from-me' : '';
    // console.log(this.props);

    return (
      <div className={`message ${fromMe}`}>
        <div className='username'>
          { this.props.username }
        </div>
        <div className='image-body'>
          <img className='image-spec' src={this.props.imgURL} />
        </div>
      </div>
    );
  }
}

Image.defaultProps = {
  imageURL: '',
  username: '',
  fromMe: false
};

export default Image;
