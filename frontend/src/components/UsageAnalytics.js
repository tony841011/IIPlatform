import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  DatePicker,
  Select,
  Space,
  Typography,
  Progress,
  List,
  Avatar,
  Tag,
  Tooltip,
  Modal,
  Form,
  Input,
  message
} from 'antd';
import {
  UserOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  FilterOutlined,
  CalendarOutlined,
  TrophyOutlined,
  FireOutlined,
  StarOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  CrownOutlined,
  TeamOutlined,
  GlobalOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined,
  LaptopOutlined,
  MonitorOutlined,
  CloudOutlined,
  DatabaseOutlined,
  ApiOutlined,
  SettingOutlined,
  BellOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  CameraOutlined,
  PictureOutlined,
  SoundOutlined,
  NotificationOutlined,
  MessageOutlined,
  MailOutlined,
  PhoneOutlined,
  TagOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const UsageAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // 模擬數據
  const mockData = {
    totalUsers: 1250,
    activeUsers: 892,
    newUsers: 45,
    totalSessions: 3456,
    avgSessionDuration: 25.5,
    pageViews: 12345,
    bounceRate: 32.5,
    conversionRate: 8.7
  };

  const topFeatures = [
    { name: '設備管理', usage: 85, icon: <DesktopOutlined />, color: '#1890ff' },
    { name: '數據分析', usage: 72, icon: <BarChartOutlined />, color: '#52c41a' },
    { name: '告警系統', usage: 68, icon: <BellOutlined />, color: '#faad14' },
    { name: '用戶管理', usage: 65, icon: <UserOutlined />, color: '#f5222d' },
    { name: '系統設定', usage: 58, icon: <SettingOutlined />, color: '#722ed1' }
  ];

  const userActivity = [
    { time: '00:00', users: 45 },
    { time: '04:00', users: 23 },
    { time: '08:00', users: 156 },
    { time: '12:00', users: 234 },
    { time: '16:00', users: 198 },
    { time: '20:00', users: 167 },
    { time: '24:00', users: 89 }
  ];

  const deviceUsage = [
    { device: '桌面電腦', percentage: 65, users: 812 },
    { device: '手機', percentage: 25, users: 312 },
    { device: '平板', percentage: 8, users: 100 },
    { device: '其他', percentage: 2, users: 26 }
  ];

  const handleExport = () => {
    message.success('數據匯出成功！');
  };

  const handleFilter = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('篩選完成！');
    }, 1000);
  };

  const columns = [
    {
      title: '功能模組',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <span style={{ color: record.color }}>{record.icon}</span>
          {text}
        </Space>
      )
    },
    {
      title: '使用率',
      dataIndex: 'usage',
      key: 'usage',
      render: (value) => (
        <Progress percent={value} size="small" />
      )
    },
    {
      title: '活躍用戶',
      dataIndex: 'activeUsers',
      key: 'activeUsers',
      render: (value) => `${value || Math.floor(value * mockData.totalUsers / 100)}`
    }
  ];

  return (
    <div>
      <Title level={2}>使用者行為分析</Title>
      
      {/* 統計卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="總用戶數"
              value={mockData.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活躍用戶"
              value={mockData.activeUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="新增用戶"
              value={mockData.newUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="總會話數"
              value={mockData.totalSessions}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 篩選和操作 */}
      <Card style={{ marginBottom: 24 }}>
        <Space>
          <Text strong>時間範圍：</Text>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder={['開始日期', '結束日期']}
          />
          <Text strong>篩選類型：</Text>
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部' },
              { value: 'daily', label: '日活躍' },
              { value: 'weekly', label: '週活躍' },
              { value: 'monthly', label: '月活躍' }
            ]}
          />
          <Button type="primary" onClick={handleFilter} loading={loading}>
            篩選
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            匯出數據
          </Button>
        </Space>
      </Card>

      {/* 功能使用排行 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="功能使用排行" extra={<Button type="link">查看詳情</Button>}>
            <Table
              columns={columns}
              dataSource={topFeatures}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="設備使用分佈" extra={<Button type="link">查看詳情</Button>}>
            <List
              dataSource={deviceUsage}
              renderItem={(item) => (
                <List.Item>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <Avatar icon={<DesktopOutlined />} />
                      <Text>{item.device}</Text>
                    </Space>
                    <Space>
                      <Text>{item.users} 用戶</Text>
                      <Tag color="blue">{item.percentage}%</Tag>
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 詳細統計 */}
      <Row gutter={16}>
        <Col span={8}>
          <Card title="平均會話時長">
            <Statistic
              value={mockData.avgSessionDuration}
              suffix="分鐘"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="頁面瀏覽量">
            <Statistic
              value={mockData.pageViews}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="轉換率">
            <Statistic
              value={mockData.conversionRate}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UsageAnalytics; 