require('../styles/ChatApp.css');

import React from 'react';
import io from 'socket.io-client';
import config from '../config';
import axios from 'axios';

import Messages from './Messages';
import ChatInput from './ChatInput';
import DropzoneDemo from './DropzoneDemo';

class ChatApp extends React.Component {
  socket = {};
  constructor(props) {
    super(props);
    this.state = { messages: [{username: 'RESANG', message: 'Welcome to RESANG! Your messages will show up on this side!', fromMe: true}],
    posts: [{ userName: 'Heran', message: 'helloworld!' },{ userName: 'Bob', message: 'That is too clique!' }],
    images: [{ username: 'Heran', imageURL: 'http://localhost:5000/images/?image=heran_1438892674000_IMG_6517.JPG.jpg'}],
    temp_images: [{ userName: 'Heran', pathTofile: 'http://localhost:5000/images/?image=heran_1438892674000_IMG_6517.JPG.jpg'}]};
    this.sendHandler = this.sendHandler.bind(this);
    this.imgHandler = this.imgHandler.bind(this);

    // Connect to the server
    this.socket = io(config.api, { query: `username=${props.username}` }).connect();

    // Listen for messages from the server
    this.socket.on('server:message', message => {
      this.addMessage(message);
    });
  }

  componentDidMount() {
    // GET MESSAGES
    const posts = this.state.posts;
    axios.get('http://localhost:5000/messages')
      .then(res => {
        // console.log(res);
        res.data.map((obj) => posts.push(obj));
        this.setState({ posts });
        // /console.log(this.state.posts);
        this.state.posts.map(function(mes) {
          // console.log(i);
          // console.log(mes);
          const messageObject = {
            username: mes.userName,
            message: mes.message
          };
          if (mes.userName === this.props.username) {
            messageObject.fromMe = true;
          } else {
            messageObject.fromMe = false;
          }
          // console.log(messageObject);
          const messages = this.state.messages;
          messages.push(messageObject);
          this.setState({ messages });
          //this.addMessage(messageObject);
        }, this);
    });

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
  }

  sendHandler(message) {
    const messageObject = {
      username: this.props.username,
      message
    };

    // Emit the message to the server
    this.socket.emit('client:message', messageObject);

    messageObject.fromMe = true;
    this.addMessage(messageObject);
  }

  imgHandler(image) {
    console.log('Image Handler');
    if (image) {
      const imageObject = {
        username: this.props.username,
        imageURL: image
      };

      console.log(imageObject);
      imageObject.fromMe = true;
      this.addImage(imageObject);
    }
  }

  addMessage(message) {
    // Append the message to the component state
    //console.log('add Message');
    const messages = this.state.messages;
    messages.push(message);
    this.setState({ messages });
  }

  addImage(imageObject) {
    console.log('Add Image');
    const images = this.state.images;
    images.push(imageObject);
    this.setState({ images });
  }

  render() {
    return (
      <div className="container">
        <h3>RESANG Chat App</h3>
        <Messages messages={this.state.messages}
                  images={this.state.images}
         />
         <div className="bottom_input">
          <ChatInput onSend={this.sendHandler} />
          <DropzoneDemo onDrop={this.imgHandler} username={this.props.username}/>
         </div>
      </div>
    );
  }

}
ChatApp.defaultProps = {
  username: 'Anonymous'
};

export default ChatApp;
