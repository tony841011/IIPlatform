import React from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Button, Space } from 'antd';
import { 
  DesktopOutlined, 
  AlertOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // 模擬數據
  const deviceData = [
    { key: '1', name: '溫度感測器-01', status: 'online', category: '感測器', lastUpdate: '2024-01-15 14:30:00' },
    { key: '2', name: '壓力計-02', status: 'offline', category: '感測器', lastUpdate: '2024-01-15 13:45:00' },
    { key: '3', name: '流量計-03', status: 'online', category: '感測器', lastUpdate: '2024-01-15 14:25:00' },
    { key: '4', name: '控制閥-01', status: 'online', category: '控制器', lastUpdate: '2024-01-15 14:28:00' },
  ];

  const alertData = [
    { key: '1', device: '溫度感測器-01', type: '高溫警報', severity: 'high', time: '2024-01-15 14:25:00', status: 'active' },
    { key: '2', device: '壓力計-02', type: '連線中斷', severity: 'medium', time: '2024-01-15 13:45:00', status: 'resolved' },
    { key: '3', device: '流量計-03', type: '異常讀數', severity: 'low', time: '2024-01-15 14:20:00', status: 'active' },
  ];

  const deviceColumns = [
    { title: '設備名稱', dataIndex: 'name', key: 'name' },
    { 
      title: '狀態', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'online' ? 'green' : 'red'}>
          {status === 'online' ? '在線' : '離線'}
        </Tag>
      )
    },
    { title: '類別', dataIndex: 'category', key: 'category' },
    { title: '最後更新', dataIndex: 'lastUpdate', key: 'lastUpdate' },
  ];

  const alertColumns = [
    { title: '設備', dataIndex: 'device', key: 'device' },
    { title: '警報類型', dataIndex: 'type', key: 'type' },
    { 
      title: '嚴重程度', 
      dataIndex: 'severity', 
      key: 'severity',
      render: (severity) => {
        const colors = { high: 'red', medium: 'orange', low: 'yellow' };
        const labels = { high: '高', medium: '中', low: '低' };
        return <Tag color={colors[severity]}>{labels[severity]}</Tag>;
      }
    },
    { title: '時間', dataIndex: 'time', key: 'time' },
    { 
      title: '狀態', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'red' : 'green'}>
          {status === 'active' ? '活動中' : '已解決'}
        </Tag>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>總覽儀表板</h2>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/custom-dashboard')}
          >
            自定義儀表板
          </Button>
          <Button 
            icon={<BarChartOutlined />}
            onClick={() => navigate('/custom-dashboard')}
          >
            圖表管理
          </Button>
        </Space>
      </div>
      
      {/* 統計卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="總設備數"
              value={112}
              prefix={<DesktopOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在線設備"
              value={98}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活動警報"
              value={5}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="系統健康度"
              value={87.5}
              prefix={<ExclamationCircleOutlined />}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 進度條 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card title="CPU 使用率">
            <Progress type="circle" percent={65} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="記憶體使用率">
            <Progress type="circle" percent={78} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="儲存空間">
            <Progress type="circle" percent={45} />
          </Card>
        </Col>
      </Row>

      {/* 表格 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="設備狀態" extra={<a href="#">查看全部</a>}>
            <Table 
              columns={deviceColumns} 
              dataSource={deviceData} 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最新警報" extra={<a href="#">查看全部</a>}>
            <Table 
              columns={alertColumns} 
              dataSource={alertData} 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 