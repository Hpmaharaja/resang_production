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
    this.state = { messages: [{username: 'RESANG', message: 'Welcome to RESANG! Your messages will show up on this side!', fromMe: true, msgOrimg: 'msg', timestamp: "2000-03-14T01:19:31.095Z"}],
    posts: [{ userName: 'Heran', message: 'helloworld!' },{ userName: 'Bob', message: 'That is too clique!' }],
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

  getInitialState (){
    return{
      final_sortedStack:[]
    }
  }

  componentDidMount() {
    // GET MESSAGES
    console.log('GET MESSAGES');
    const posts = this.state.posts;
    axios.get('http://localhost:5000/messages')
      .then(res => {
        res.data.map((obj) => posts.push(obj));
        this.setState({ posts });
        this.state.posts.map(function(mes) {
          const messageObject = {
            username: mes.userName,
            message: mes.message,
            msgOrimg: 'msg',
            timestamp: mes.timestamp
          };
          if (mes.userName === this.props.username) {
            messageObject.fromMe = true;
          } else {
            messageObject.fromMe = false;
          }
          // console.log('MESSAGE OBJECT:', messageObject);
          const messages = this.state.messages;
          messages.push(messageObject);
          this.setState({ messages });
        }, this);
    });

    // GET IMAGE URLS
    console.log('GET IMAGES');
    const temp_images = this.state.temp_images;
    axios.get('http://localhost:5000/images_db')
      .then(res => {
        res.data.map((obj) => temp_images.push(obj));
        this.setState({ temp_images });
        this.state.temp_images.map(function(imgobj) {
          const imageObject = {
            username: imgobj.userName,
            imageURL: imgobj.pathTofile,
            msgOrimg: 'img',
            timestamp: imgobj.timestamp
          };
          if (imgobj.userName === this.props.username) {
            imageObject.fromMe = true;
          } else {
            imageObject.fromMe = false;
          }
          // console.log('IMAGE OBJECT:', imageObject);
          // Unification
          const messages = this.state.messages;
          messages.push(imageObject);
          this.setState({ messages });
        }, this);
    });

    setTimeout(function() {
      // Sorting the messages and the images
      var messages = this.state.messages;
      messages.sort( function( a, b )
      {
        var index = 4;
        var direction = 1;
        // Sort by the 2nd value in each array
        if ( a.timestamp == b.timestamp ) return 0;
        return a.timestamp < b.timestamp ? -direction : direction;
      });
      // this.setState({ messages });
      this.setState({ final_sortedStack: messages });
      console.log('Messages:', this.state.final_sortedStack);
    }.bind(this), 1000);
  }

  sendHandler(message) {
    console.log('sendHandler');
    const messageObject = {
      username: this.props.username,
      message
    };

    // Emit the message to the server
    this.socket.emit('client:message', messageObject);

    messageObject.fromMe = true;
    messageObject.msgOrimg = 'msg';
    this.addMessage(messageObject);
  }

  imgHandler(image) {
    console.log('imgHandler');
    if (image.url) {
      const imageObject = {
        username: this.props.username,
        imageURL: image.url,
        msgOrimg: 'img',
        timestamp: image.timestamp
      };

      // Emit the image to the server
      this.socket.emit('client:image', imageObject);
      imageObject.fromMe = true;

      console.log('IMAGE OBJECT: ', imageObject);
      this.addImage(imageObject);
    }
  }

  addMessage(message) {
    // Append the message to the component state
    console.log('addMessage');
    const messages = this.state.messages;
    messages.push(message);
    this.setState({ messages });
  }

  addImage(imageObject) {
    console.log('addImage');
    const messages = this.state.messages;
    messages.push(imageObject);
    this.setState({ messages });
  }

  render() {
    // console.log(this.state.messages);
    return (
      <div className="container">
        <h3>RESANG Chat App</h3>
        <Messages messages={this.state.final_sortedStack}
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
