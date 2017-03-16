import React from 'react';
import BurgerMenu from 'react-burger-menu';
import Dashboard from './Dashboard';
import config from '../config';

import { List, ListItem, ListItemContent } from 'react-mdl';

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';



var MenuWrap = React.createClass({

    getInitialState() {
        return {hidden : false};
    },

    toggle() {
        this.setState({hidden: !this.state.hidden});
    },

    render() {

        let style;

        if (this.state.hidden) {
            style = {display: 'none'};
        }

        return (
            <div style={style} className={this.props.side}>
                {this.props.children}
            </div>
        );
    }
});

export default class LeftSidebar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentMenu: 'push',
            side: 'left',
            hidden: true,
            username: ''
        };
        this.redirectSubmitHandler = this.redirectSubmitHandler.bind(this);
        this.dashboardSubmitHandler = this.dashboardSubmitHandler.bind(this);
        this.usernameSubmitHandler = this.usernameSubmitHandler.bind(this);


        }

    redirectSubmitHandler(event) {
          event.preventDefault();
          window.location.href = 'http://localhost:8000';
    };

    dashboardSubmitHandler(event) {
      event.preventDefault();
      this.setState({ dashboardsubmitted: true, chatsubmitted: false, username: this.state.username });
    }

    usernameSubmitHandler(event) {
      event.preventDefault();
      this.setState({ chatsubmitted: true, dashboardsubmitted: false, username: this.state.username });
    }

    render() {
        const Menu = BurgerMenu[this.state.currentMenu];
        var styles = {
            bmBurgerButton: {
                position: 'fixed',

                width: '36px',
                height: '30px',
                left: '10px',
                top: '18px'
            },
            bmBurgerBars: {
                background: '#373a47'
            },
            bmCrossButton: {
                height: '24px',
                width: '24px'
            },
            bmCross: {
                background: '#bdc3c7'
            },
            bmMenu: {
                background: '#373a47',
                padding: '2.5em 1.5em 0',
                fontSize: '1.15em',
                //width: '500px',
            },
            bmMorphShape: {
                fill: '#373a47'
            },
            bmItemList: {
                color: '#b8b7ad',
                padding: '0.8em'
            },
            bmOverlay: {
                background: 'rgba(0, 0, 0, 0.3)'
            }
        };

        if (this.state.chatsubmitted) {
          // Form was submitted, now show the main App
            window.location.href = config.frontend_home;

        } else if (this.state.dashboardsubmitted) {
          // Dashboard Selected, now show the dashboard App
          return (
            <Dashboard username={this.state.username} />
          );
        }

        //<form onSubmit={this.dashboardSubmitHandler} className="ListItemContent">
        //  <input type="submit" value="Dashboard" />
        //</form>
        return (
            <MenuWrap wait={20}>
                <Menu
                    styles={styles}
                    noOverlay id={this.state.currentMenu}
                    pageWrapId={'page-wrap'}
                    outerContainerId={'outer-container'}
                >
                    <List>
                            <form onSubmit={this.redirectSubmitHandler} className="ListItemContent">
                              <input type="submit" value="Login" />
                            </form>

                            <form onSubmit={this.dashboardSubmitHandler} className="ListItemContent">
                              <input type="submit" value="Dashboard" />
                            </form>
                    </List>
                </Menu>
            </MenuWrap>
        );
    }
};
