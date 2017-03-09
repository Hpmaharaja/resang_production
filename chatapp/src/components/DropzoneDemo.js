import React from 'react';
import Dropzone from 'react-dropzone';
import request from 'superagent';


class DropzoneDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { url: '', fileName: '' };
    //this.handleImageUpload = this.handleImageUpload.bind(this);
  }

  onDrop (files) {
    console.log('Received files: ', files);
    const filename = this.props.username + '_' + files[0].lastModified + '_' + files[0].name;
    this.setState({
      fileName: filename
    })
    this.setState({
      uploadedFile: files[0]
    });
    // console.log(this.props);
    // console.log(this.state);
    let upload = request.post('http://localhost:5000/images')
                        .field('userName', this.props.username)
                        .field('fileName', this.state.fileName)
                        .field('file', files[0]);

    upload.end((err, response) => {
      if (err) {
        console.error(err);
      }

      this.setState({
        url: 'http://localhost:5000/images/?image=' + this.state.fileName
      });
      console.log(response);
    });
    this.props.onDrop(this.state.url);
    //this.handleImageUpload(files[0]);
  }

  // handleImageUpload(file) {
  //   console.log(this.props);
  //   console.log(this.state);
  //   let upload = request.post('http://localhost:5000/images')
  //                       .field('userName', this.props.username)
  //                       .field('fileName', this.state.fileName)
  //                       .field('file', file);
  //
  //   upload.end((err, response) => {
  //     if (err) {
  //       console.error(err);
  //     }
  //
  //     // if (response.body.secure_url !== '') {
  //     //   this.setState({
  //     //     uploadedFileCloudinaryUrl: response.body.secure_url
  //     //   });
  //     // }
  //     this.setState({
  //       url: response.pathTofile
  //     });
  //     console.log(response);
  //   });
  // }

  // IMAGE RENDERING PREVIEW ON DROP
  // <div>
  //   {this.state.url === '' ? null :
  //   <div>
  //     <p>{this.state.url}</p>
  //     <img src={this.state.url} />
  //   </div>}
  // </div>

  render () {
    return (
        <div className="upload-input">
          <div>
            <Dropzone
              multiple={false}
              accept="image/*"
              onDrop={this.onDrop.bind(this)}>
              <div><b>CLICK OR DRAG IMAGE!</b></div>
            </Dropzone>
          </div>
      </div>
    );
  }
}

export default DropzoneDemo;
