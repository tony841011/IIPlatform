import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Statistic, Alert } from 'antd';
import { DeviceOutlined, AlertOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import axios from 'axios';

const Dashboard = () => {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    totalAlerts: 0,
    criticalAlerts: 0
  });
  const chartRef = useRef(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    loadData();
    connectWebSocket();
  }, []);

  const loadData = async () => {
    try {
      const [devicesRes, alertsRes] = await Promise.all([
        axios.get('http://localhost:8000/devices/'),
        axios.get('http://localhost:8000/alerts/')
      ]);
      
      setDevices(devicesRes.data);
      setAlerts(alertsRes.data);
      
      setStats({
        totalDevices: devicesRes.data.length,
        activeDevices: devicesRes.data.filter(d => d.value !== undefined).length,
        totalAlerts: alertsRes.data.length,
        criticalAlerts: alertsRes.data.filter(a => a.value > 80).length
      });
    } catch (error) {
      console.error('載入資料失敗:', error);
    }
  };

  const connectWebSocket = () => {
    const websocket = new WebSocket('ws://localhost:8000/ws/data');
    
    websocket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'alert') {
        setAlerts(prev => [msg, ...prev]);
        setStats(prev => ({
          ...prev,
          totalAlerts: prev.totalAlerts + 1,
          criticalAlerts: msg.value > 80 ? prev.criticalAlerts + 1 : prev.criticalAlerts
        }));
      } else {
        setDevices(prev => {
          const updated = prev.map(d => 
            d.id === msg.device_id ? { ...d, value: msg.value, timestamp: msg.timestamp } : d
          );
          return updated;
        });
      }
    };

    setWs(websocket);
  };

  useEffect(() => {
    if (devices.length > 0 && chartRef.current) {
      const chart = echarts.init(chartRef.current);
      const option = {
        title: { text: '設備即時狀態', left: 'center' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['設備數值'], top: 30 },
        xAxis: { 
          type: 'category', 
          data: devices.map(d => d.name),
          axisLabel: { rotate: 45 }
        },
        yAxis: { type: 'value' },
        series: [{
          name: '設備數值',
          data: devices.map(d => d.value || Math.random() * 100),
          type: 'bar',
          itemStyle: {
            color: function(params) {
              const value = devices[params.dataIndex]?.value || 0;
              return value > 80 ? '#ff4d4f' : value > 60 ? '#faad14' : '#52c41a';
            }
          }
        }]
      };
      chart.setOption(option);
    }
  }, [devices]);

  return (
    <div>
      <h2>系統概覽</h2>
      
      {/* 統計卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="總設備數"
              value={stats.totalDevices}
              prefix={<DeviceOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活躍設備"
              value={stats.activeDevices}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="總告警數"
              value={stats.totalAlerts}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="嚴重告警"
              value={stats.criticalAlerts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 即時圖表 */}
      <Card title="設備即時狀態" className="chart-container">
        <div ref={chartRef} style={{ height: 400 }} />
      </Card>

      {/* 最新告警 */}
      {alerts.length > 0 && (
        <Card title="最新告警" style={{ marginTop: 16 }}>
          {alerts.slice(0, 5).map((alert, index) => (
            <Alert
              key={index}
              message={`設備 ${alert.device_id} - ${alert.message}`}
              description={`數值: ${alert.value} | 時間: ${alert.timestamp}`}
              type={alert.value > 80 ? "error" : "warning"}
              showIcon
              style={{ marginBottom: 8 }}
            />
          ))}
        </Card>
      )}
    </div>
  );
};

export default Dashboard; 