import React, { Component } from 'react';
import { Row, Col, Avatar, Dropdown, Menu } from 'antd';
import { LogoutOutlined, CaretDownFilled } from '@ant-design/icons';
import { withCookies } from 'react-cookie';
import { withRouter } from 'react-router-dom';
import { COOKIE_NAMES } from '../../../constants/cookie-name.constant';
import { connect } from 'react-redux';
import * as actions from '../../../redux/actions';
import './Toolbar.style.scss';

class Toolbar extends Component {

  handleSelectMenuItem = (e) => {
    const code = e.split('***');
    const key = code[0];
    const path = code[1];

    if (key === 'LOGOUT') {
      this.logout();
      return;
    }

    this.props.history.push(path);
  }

  logout = () => {
    const { cookies } = this.props;
    cookies.remove(COOKIE_NAMES.token, { path: '/' });
    cookies.remove(COOKIE_NAMES.user, { path: '/' });
    this.props.history.push('/login');
  }

  render() {
    const { user, avatarMenuItems } = this.props;
    const { currentPageTitle, currentPageIcon } = this.props.app;
    const CurrentPage = { Icon: currentPageIcon };

    return (
      <Row className="toolbar" justify="start" align="middle">
        <Col className="__page-title" span={18}>
          <Row align="center">
            <Col span={1}><div className="__page-title__icon"><CurrentPage.Icon /></div></Col>
            <Col span={23}><span className="__page-title__text">{currentPageTitle}</span></Col>
          </Row>
        </Col>
        <Col span={6}>
          <Row className="__account" justify="center" align="middle">
            <Col span={13}>
              More user features here...
            </Col>
            <Col span={11}>
              <Dropdown overlay={
                <Menu onClick={e => this.handleSelectMenuItem(e.key)}>
                  {(avatarMenuItems || []).map((item) => (
                    <Menu.Item key={item.key + '***' + item.path}
                      onClick={() => {
                        this.props.setCurrentPageTitle(item.title, item.icon);
                        this.props.setSidebarSelectedIndex(item.sidebarIndex);
                      }}>
                      <item.icon />
                      {item.title}
                    </Menu.Item>
                  ))}
                  <Menu.Item key="LOGOUT">
                    <LogoutOutlined />
                    Đăng xuất
                  </Menu.Item>
                </Menu>
              } className="__account__avatar-menu">
                <Row align="middle">
                  <Col span={7}><Avatar size="default" src={user.avatar} /></Col>
                  <Col span={17}>
                    <Row>
                      <Col span={16}><span>{user.fullname || ''}</span></Col>
                      <Col span={8}><CaretDownFilled /></Col>
                    </Row>
                  </Col>
                </Row>
              </Dropdown>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}

const mapStateToProps = state => ({
  app: state.app
});

export default connect(mapStateToProps, actions)(withCookies(withRouter(Toolbar)));
