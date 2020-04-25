import React, { Component } from 'react';
import { Row, Col, Tooltip, Button } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import NumberFormat from 'react-number-format';
import './ProductQuantityStatistic.style.scss';
import { Line } from 'react-chartjs-2';
import moment from 'moment';

export default class ProductQuantityStatistic extends Component {
  render() {
    const {
      soldQuantityTotal,
      newProductTotal,
      availableQuantityTotal,
      soldQuantityStatisticData
    } = this.props;

    const chartOptions = {
      legend: { display: false },
      scales: {
        xAxes: [{
          ticks: {
            display: false //this will remove only the label
          },
          gridLines: {
            display: false
          }
        }],
        yAxes: [{
          ticks: {
            display: false //this will remove only the label
          },
          gridLines: {
            display: false
          }
        }]
      }
    };
    const soldQuantityStatisticChartData = {
      labels: soldQuantityStatisticData.map(item => moment(item.date).format('DD/MM')),
      datasets: [
        {
          label: 'SL',
          fill: false,
          lineTension: 0.2,
          backgroundColor: 'orange',
          borderColor: 'orange',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'orange',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'orange',
          pointHoverBorderWidth: 2,
          pointRadius: 0,
          pointHitRadius: 10,
          data: soldQuantityStatisticData.map(item => item.quantity)
        }
      ]
    }

    return (
      <div className="product-quantity-statistic">
        <Row style={{ width: '100%' }} gutter={20}>
          <Col span={8}>
            <div className="product-quantity-statistic__item --sold">
              <Tooltip title="Xem lịch sử bán hàng" placement="top">
                <Button
                  shape="circle"
                  icon={<HistoryOutlined />}
                  className="product-quantity-statistic__item__btn"
                />
              </Tooltip>
              <div className="product-quantity-statistic__item__metric">
                <NumberFormat
                  value={soldQuantityTotal}
                  displayType="text"
                  thousandSeparator={true}
                  className="product-quantity-statistic__item__metric__quantity"
                />
                <span className="product-quantity-statistic__item__metric__label">Sản phẩm đã bán</span>
              </div>

              <div className="product-quantity-statistic__item__chart">
                <Line
                  data={soldQuantityStatisticChartData}
                  options={chartOptions}
                  height={180}
                />
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="product-quantity-statistic__item --new">
              <Tooltip title="Xem các sản phẩm mới" placement="top">
                <Button
                  shape="circle"
                  icon={<HistoryOutlined />}
                  className="product-quantity-statistic__item__btn"
                />
              </Tooltip>
              <div className="product-quantity-statistic__item__metric">
                <NumberFormat
                  value={newProductTotal}
                  displayType="text"
                  thousandSeparator={true}
                  prefix={newProductTotal > 0 ? '+' : ''}
                  className="product-quantity-statistic__item__metric__quantity"
                />
                <span className="product-quantity-statistic__item__metric__label">Sản phẩm mới</span>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="product-quantity-statistic__item --available">
              <div className="product-quantity-statistic__item__metric">
                <NumberFormat
                  value={availableQuantityTotal}
                  displayType="text"
                  thousandSeparator={true}
                  className="product-quantity-statistic__item__metric__quantity"
                />
                <span className="product-quantity-statistic__item__metric__label">Sản phẩm tồn kho</span>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}