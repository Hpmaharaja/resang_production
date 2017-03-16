import React from 'react';
import Dropzone from 'react-dropzone';
import request from 'superagent';
import config from '../config';


class DropzoneDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { url: '', fileName: '', timestamp: '', localPath: '', uploaded: false };
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
    let upload = request.post(config.images)
                        .field('userName', this.props.username)
                        .field('fileName', filename)
                        .field('file', files[0]);

    upload.end((err, response) => {
      if (err) {
        console.log('UPLOAD ERROR: ' + err);
          // let upload2 = request.post(config.images)
          //                     .field('userName', this.props.username)
          //                     .field('fileName', this.state.fileName)
          //                     .field('file', files[0]);
          // upload2.end((err2, response2) => {
          //   if (err2) {
          //     console.error('UPLOAD ERROR 2: ' + err2);
          //     this.props.onDrop({ url: this.state.url, timestamp: this.state.timestamp, localPath: this.state.localPath, uploaded: false });
          //   } else {
          //       console.log('Second Response:',response2);
          //       this.setState({
          //         url: config.images + '/?image=' + filename
          //       });
          //       this.setState({
          //         timestamp: response2.timestamp
          //       });
          //       this.setState({
          //         localPath: '/root/Developer/resang_production/uploads/' + filename
          //       });
          //       this.setState({
          //         uploaded: true
          //       });
          //       console.log(this.state);
          //       this.props.onDrop({ url: this.state.url, timestamp: this.state.timestamp, localPath: this.state.localPath, uploaded: true });
          //   }
          // });
      } 
          console.log('FIRST SUCCESS UPLOAD!');
          this.setState({
            url: config.images + '/?image=' + filename
          });
          console.log('Response:', response);
          this.setState({
            timestamp: response
          });
          this.setState({
            localPath: '/root/Developer/resang_production/uploads/' + filename
          });
          this.setState({
            uploaded: true
          });
          console.log(this.state);
          this.props.onDrop({ url: this.state.url, timestamp: this.state.timestamp, localPath: this.state.localPath, uploaded: true });
        
    });
    //this.handleImageUpload(files[0]);
  }

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
