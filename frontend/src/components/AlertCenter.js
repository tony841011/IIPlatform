import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Statistic, Row, Col } from 'antd';
import { AlertOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const AlertCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    resolved: 0
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/alerts/');
      setAlerts(response.data);
      
      const critical = response.data.filter(a => a.value > 80).length;
      const warning = response.data.filter(a => a.value <= 80 && a.value > 60).length;
      
      setStats({
        total: response.data.length,
        critical,
        warning,
        resolved: 0
      });
    } catch (error) {
      console.error('載入告警失敗:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '設備ID',
      dataIndex: 'device_id',
      key: 'device_id',
      width: 100,
    },
    {
      title: '數值',
      dataIndex: 'value',
      key: 'value',
      render: (value) => {
        const color = value > 80 ? 'red' : value > 60 ? 'orange' : 'green';
        return <Tag color={color}>{value}</Tag>;
      },
    },
    {
      title: '告警訊息',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '時間',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
    {
      title: '狀態',
      key: 'status',
      render: (_, record) => {
        const color = record.value > 80 ? 'red' : record.value > 60 ? 'orange' : 'green';
        const text = record.value > 80 ? '嚴重' : record.value > 60 ? '警告' : '正常';
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <div>
      <h2>告警中心</h2>
      
      {/* 統計卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="總告警數"
              value={stats.total}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="嚴重告警"
              value={stats.critical}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="警告"
              value={stats.warning}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已解決"
              value={stats.resolved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 告警列表 */}
      <Card title="告警列表">
        <Table 
          columns={columns} 
          dataSource={alerts}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default AlertCenter; 