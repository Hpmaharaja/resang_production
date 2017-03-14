import React from 'react';

import Message from './Message';
import Image from './Image';

class Messages extends React.Component {
  componentDidUpdate() {
    // There is a new message in the state, scroll to bottom of list
    const objDiv = document.getElementById('messageList');
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  // componentWillReceiveProps(nextProps) {
  //   // You don't have to do this check first, but it can help prevent an unneeded render
  //   if (nextProps.startTime !== this.state.startTime) {
  //     this.setState({ startTime: nextProps.startTime });
  //   }
  // }

  render() {
    // Loop through all the messages in the state and create a Message component
    const messages = this.props.messages.map((message, i) => {
      if (message.msgOrimg == 'img') {
        return (
            <Image
              key={i}
              username={message.username}
              imgURL={message.imageURL}
              fromMe={message.fromMe} />
          );
      } else {
        return (
          <Message
            key={i}
            username={message.username}
            message={message.message}
            fromMe={message.fromMe} />
        );
      }
      });

      // const images = this.props.images.map((imageURL, i) => {
      //   return (
      //     <Image
      //       key={i}
      //       username={imageURL.username}
      //       imgURL={imageURL.imageURL}
      //       fromMe={imageURL.fromMe} />
      //   );
      // });

    return (
      <div className='messages' id='messageList'>
        { messages }
      </div>
    );
  }
}

Messages.defaultProps = {
  messages: [],
  images: []
};

export default Messages;
