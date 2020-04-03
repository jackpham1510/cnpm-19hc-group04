import React, { Component } from 'react';
import './CheckoutPanel.style.scss';
import { Menu, Modal } from 'antd';
import {
  QuestionCircleOutlined,
  HistoryOutlined,
  QrcodeOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import MoneyCounting from '../MoneyCounting/MoneyCounting';

const navbarMenuItems = [
  {
    key: '1',
    title: 'Tính tiền cho khách',
    icon: QrcodeOutlined
  },
  {
    key: '2',
    title: 'Yêu cầu nhập hàng',
    icon: QuestionCircleOutlined
  },
  {
    key: '3',
    title: 'Lịch sử giao dịch',
    icon: HistoryOutlined
  }
];

const { confirm } = Modal;

export default class CheckoutPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      selectedMenuItem: { ...navbarMenuItems[0] },
      onWorking: false
    }
  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  handleSelectMenuItem(e) {
    const { key } = e;

    if (key === this.state.selectedMenuItem.key)
      return;

    if (!this.state.onWorking) {
      this.setState({ selectedMenuItem: navbarMenuItems.find(item => item.key === key) });
      return;
    }

    const that = this;
    confirm({
      title: `Đang thao tác, bạn có muốn rời khỏi?`,
      icon: <ExclamationCircleOutlined />,
      content: '',
      okText: 'Đồng ý',
      okType: 'danger',
      cancelText: 'Không, cảm ơn',
      onOk() {
        that.setState({
          selectedMenuItem: navbarMenuItems.find(item => item.key === key),
          onWorking: false
        });
      }
    });
  }

  setOnWorking(onWorking) {
    this.setState({ onWorking });
  }

  render() {
    const { selectedMenuItem } = this.state;
    return (
      <div className="checkout-panel">
        <div className="checkout-panel__main-board">
          <div className="checkout-panel__main-board__navbar">
            <Menu
              defaultSelectedKeys={['1']}
              mode="inline"
              theme="dark"
              inlineCollapsed={true}
              onClick={e => this.handleSelectMenuItem(e)}
            >
              {navbarMenuItems.map(item => (
                <Menu.Item key={item.key}
                  className={`checkout-panel__main-board__navbar__item animated bounceIn ${selectedMenuItem.key === item.key ?
                    'checkout-panel__main-board__navbar__item--selected' : ''}`}
                >
                  <item.icon className="checkout-panel__main-board__navbar__item__icon" />
                  <span>{item.title}</span>
                </Menu.Item>
              ))}
            </Menu>
          </div>
          <div className="checkout-panel__main-board__content">
            {selectedMenuItem.key === '1' ? (
              <MoneyCounting
                setOnWorking={onWorking => this.setOnWorking(onWorking)}
              />
            ) : <></>}
          </div>
        </div>
      </div>
    )
  }
}