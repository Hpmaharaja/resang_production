require('../styles/App.css');
require('../styles/Login.css');

import React from 'react';
import ChatApp from './ChatApp';
import Dashboard from './Dashboard';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: '' };

    // Bind 'this' to event handlers. React ES6 does not do this by default
    this.usernameChangeHandler = this.usernameChangeHandler.bind(this);
    this.usernameSubmitHandler = this.usernameSubmitHandler.bind(this);
    this.dashboardSubmitHandler = this.dashboardSubmitHandler.bind(this);
  }

  usernameChangeHandler(event) {
    this.setState({ username: event.target.value });
  }

  usernameSubmitHandler(event) {
    event.preventDefault();
    this.setState({ chatsubmitted: true, dashboardsubmitted: false, username: this.state.username });
  }

  dashboardSubmitHandler(event) {
    event.preventDefault();
    this.setState({ dashboardsubmitted: true, chatsubmitted: false, username: this.state.username });
  }

  render() {
    if (this.state.chatsubmitted) {
      // Form was submitted, now show the main App
      return (
        <ChatApp username={this.state.username} />
      );
    } else if (this.state.dashboardsubmitted) {
      // Dashboard Selected, now show the dashboard App
      return (
        <Dashboard username={this.state.username} />
      );
    }

    // Initial page load, show a simple login form
    return (
      <div>
        <form onSubmit={this.usernameSubmitHandler} className="username-container">
          <h1>RESANG GROUPCHAT APPLICATION</h1>
          <div>
            <input
              type="text"
              onChange={this.usernameChangeHandler}
              placeholder="Enter a username..."
              required />
          </div>
          <input type="submit" value="Submit" />
        </form>
        <form onSubmit={this.dashboardSubmitHandler} className="username-container">
          <h1>RESANG DASHBOARD</h1>
          <input type="submit" value="Dashboard" />
        </form>
      </div>
    );
  }
}
App.defaultProps = {
};

export default App;
