import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Form,
  Switch,
  Select,
  Input,
  Button,
  Space,
  message,
  Spin,
  Alert,
  Divider,
  List,
  Avatar,
  Tag,
  Tooltip,
  Timeline,
  Descriptions,
  Steps,
  Badge,
  Popconfirm,
  Drawer,
  Tabs,
  Upload,
  DatePicker,
  Slider,
  Statistic,
  Checkbox,
  Radio,
  TimePicker,
  Table,
  Modal
} from 'antd';
import {
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  MailOutlined,
  MobileOutlined,
  DesktopOutlined,
  WechatOutlined,
  SkypeOutlined,
  SlackOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  SendOutlined,
  StopOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const NotificationPreferences = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [groupForm] = Form.useForm();
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);

  // 個人通知偏好
  const [personalPreferences, setPersonalPreferences] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    teams_notifications: true,
    wechat_notifications: false,
    slack_notifications: false,
    notification_frequency: 'immediate',
    quiet_hours_enabled: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    timezone: 'Asia/Taipei',
    language: 'zh-TW',
    digest_enabled: true,
    digest_frequency: 'daily',
    digest_time: '09:00'
  });

  // 通知類型偏好
  const [notificationTypes, setNotificationTypes] = useState({
    critical_alerts: {
      email: true,
      sms: true,
      push: true,
      teams: true,
      wechat: false,
      slack: false,
      frequency: 'immediate'
    },
    warning_alerts: {
      email: true,
      sms: false,
      push: true,
      teams: true,
      wechat: false,
      slack: false,
      frequency: 'immediate'
    },
    info_alerts: {
      email: false,
      sms: false,
      push: true,
      teams: false,
      wechat: false,
      slack: false,
      frequency: 'digest'
    },
    system_updates: {
      email: true,
      sms: false,
      push: false,
      teams: false,
      wechat: false,
      slack: false,
      frequency: 'daily'
    },
    device_status: {
      email: false,
      sms: false,
      push: true,
      teams: false,
      wechat: false,
      slack: false,
      frequency: 'digest'
    },
    ai_analysis: {
      email: true,
      sms: false,
      push: true,
      teams: true,
      wechat: false,
      slack: false,
      frequency: 'immediate'
    }
  });

  // 通知群組
  const [notificationGroups, setNotificationGroups] = useState([
    {
      id: 1,
      name: '管理團隊',
      description: '高階管理人員通知群組',
      members: 5,
      created_at: '2024-01-10 10:00:00',
      notification_types: ['critical_alerts', 'system_updates'],
      channels: ['email', 'teams']
    },
    {
      id: 2,
      name: '技術團隊',
      description: '技術支援與維護人員',
      members: 8,
      created_at: '2024-01-12 14:30:00',
      notification_types: ['critical_alerts', 'warning_alerts', 'device_status'],
      channels: ['email', 'push', 'teams']
    },
    {
      id: 3,
      name: '操作團隊',
      description: '日常操作與監控人員',
      members: 12,
      created_at: '2024-01-15 09:15:00',
      notification_types: ['warning_alerts', 'info_alerts', 'device_status'],
      channels: ['push', 'email']
    }
  ]);

  // 通知歷史
  const [notificationHistory, setNotificationHistory] = useState([
    {
      id: 1,
      type: 'critical_alerts',
      title: '設備故障警報',
      message: '生產線設備 A-001 發生嚴重故障',
      channel: 'email',
      status: 'sent',
      sent_at: '2024-01-15 14:30:00',
      read_at: '2024-01-15 14:35:00',
      recipient: 'admin@company.com'
    },
    {
      id: 2,
      type: 'warning_alerts',
      title: '效能警告',
      message: '設備 B-002 效能低於正常值',
      channel: 'push',
      status: 'sent',
      sent_at: '2024-01-15 13:45:00',
      read_at: '2024-01-15 13:50:00',
      recipient: 'operator1@company.com'
    },
    {
      id: 3,
      type: 'ai_analysis',
      title: 'AI 分析完成',
      message: '設備故障預測模型分析完成',
      channel: 'teams',
      status: 'sent',
      sent_at: '2024-01-15 12:00:00',
      read_at: null,
      recipient: 'tech-team@company.com'
    }
  ]);

  // 通知統計
  const [notificationStats, setNotificationStats] = useState({
    total_sent: 1250,
    total_read: 1180,
    read_rate: 94.4,
    delivery_rate: 98.2,
    avg_response_time: '2.5分鐘',
    channel_stats: {
      email: { sent: 450, read: 420, rate: 93.3 },
      push: { sent: 380, read: 365, rate: 96.1 },
      teams: { sent: 320, read: 295, rate: 92.2 },
      sms: { sent: 100, read: 100, rate: 100.0 }
    }
  });

  const handleSavePreferences = async (values) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPersonalPreferences({ ...personalPreferences, ...values });
      message.success('通知偏好設定已儲存');
    } catch (error) {
      message.error('儲存失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (values) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newGroup = {
        id: notificationGroups.length + 1,
        ...values,
        members: 0,
        created_at: new Date().toLocaleString(),
        notification_types: values.notification_types || [],
        channels: values.channels || []
      };
      
      setNotificationGroups([newGroup, ...notificationGroups]);
      message.success('通知群組創建成功');
      setGroupModalVisible(false);
      groupForm.resetFields();
    } catch (error) {
      message.error('創建失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async (values) => {
    try {
      setLoading(true);
      // 模擬發送測試通知
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success('測試通知已發送');
      setTestModalVisible(false);
    } catch (error) {
      message.error('發送失敗');
    } finally {
      setLoading(false);
    }
  };

  const notificationTypeColumns = [
    {
      title: '通知類型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeNames = {
          critical_alerts: '緊急警報',
          warning_alerts: '警告警報',
          info_alerts: '資訊通知',
          system_updates: '系統更新',
          device_status: '設備狀態',
          ai_analysis: 'AI 分析'
        };
        return <Text strong>{typeNames[type]}</Text>;
      }
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (enabled) => <Switch checked={enabled} size="small" />
    },
    {
      title: '簡訊',
      dataIndex: 'sms',
      key: 'sms',
      render: (enabled) => <Switch checked={enabled} size="small" />
    },
    {
      title: '推播',
      dataIndex: 'push',
      key: 'push',
      render: (enabled) => <Switch checked={enabled} size="small" />
    },
    {
      title: 'Teams',
      dataIndex: 'teams',
      key: 'teams',
      render: (enabled) => <Switch checked={enabled} size="small" />
    },
    {
      title: '微信',
      dataIndex: 'wechat',
      key: 'wechat',
      render: (enabled) => <Switch checked={enabled} size="small" />
    },
    {
      title: 'Slack',
      dataIndex: 'slack',
      key: 'slack',
      render: (enabled) => <Switch checked={enabled} size="small" />
    },
    {
      title: '頻率',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (frequency) => {
        const frequencyNames = {
          immediate: '即時',
          digest: '彙整',
          daily: '每日'
        };
        return <Tag color="blue">{frequencyNames[frequency]}</Tag>;
      }
    }
  ];

  const groupColumns = [
    {
      title: '群組名稱',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space direction="vertical">
          <Text strong>{name}</Text>
          <Text type="secondary">{record.description}</Text>
        </Space>
      )
    },
    {
      title: '成員數',
      dataIndex: 'members',
      key: 'members',
      render: (members) => (
        <Badge count={members} style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: '通知類型',
      dataIndex: 'notification_types',
      key: 'notification_types',
      render: (types) => (
        <Space>
          {types.map(type => (
            <Tag key={type} color="blue">{type}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '通知管道',
      dataIndex: 'channels',
      key: 'channels',
      render: (channels) => (
        <Space>
          {channels.map(channel => (
            <Tag key={channel} color="green">{channel}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '建立時間',
      dataIndex: 'created_at',
      key: 'created_at'
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>編輯</Button>
          <Button size="small" icon={<EyeOutlined />}>查看</Button>
          <Button size="small" danger icon={<DeleteOutlined />}>刪除</Button>
        </Space>
      )
    }
  ];

  const historyColumns = [
    {
      title: '通知類型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeColors = {
          critical_alerts: 'red',
          warning_alerts: 'orange',
          info_alerts: 'blue',
          system_updates: 'green',
          device_status: 'purple',
          ai_analysis: 'cyan'
        };
        return <Tag color={typeColors[type]}>{type}</Tag>;
      }
    },
    {
      title: '標題',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '管道',
      dataIndex: 'channel',
      key: 'channel',
      render: (channel) => (
        <Tag color="blue">{channel}</Tag>
      )
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'sent' ? 'green' : 'orange'}>
          {status === 'sent' ? '已發送' : '發送中'}
        </Tag>
      )
    },
    {
      title: '發送時間',
      dataIndex: 'sent_at',
      key: 'sent_at'
    },
    {
      title: '閱讀時間',
      dataIndex: 'read_at',
      key: 'read_at',
      render: (readAt) => readAt || '-'
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <BellOutlined /> 通知偏好與個人化管理
      </Title>

      <Row gutter={[16, 16]}>
        {/* 通知統計 */}
        <Col span={24}>
          <Card title="通知統計概覽">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="總發送數"
                  value={notificationStats.total_sent}
                  prefix={<SendOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="閱讀率"
                  value={notificationStats.read_rate}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="平均回應時間"
                  value={notificationStats.avg_response_time}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="投遞率"
                  value={notificationStats.delivery_rate}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 個人偏好設定 */}
        <Col span={12}>
          <Card title="個人通知偏好">
            <Form
              form={form}
              onFinish={handleSavePreferences}
              layout="vertical"
            >
              <Form.Item label="通知管道">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item name="email_notifications" valuePropName="checked">
                    <Switch checkedChildren="啟用" unCheckedChildren="停用" />
                  </Form.Item>
                  <Text>Email 通知</Text>
                  
                  <Form.Item name="sms_notifications" valuePropName="checked">
                    <Switch checkedChildren="啟用" unCheckedChildren="停用" />
                  </Form.Item>
                  <Text>簡訊通知</Text>
                  
                  <Form.Item name="push_notifications" valuePropName="checked">
                    <Switch checkedChildren="啟用" unCheckedChildren="停用" />
                  </Form.Item>
                  <Text>推播通知</Text>
                  
                  <Form.Item name="teams_notifications" valuePropName="checked">
                    <Switch checkedChildren="啟用" unCheckedChildren="停用" />
                  </Form.Item>
                  <Text>Teams 通知</Text>
                </Space>
              </Form.Item>

              <Form.Item label="通知頻率">
                <Select defaultValue="immediate">
                  <Option value="immediate">即時</Option>
                  <Option value="digest">彙整</Option>
                  <Option value="daily">每日</Option>
                </Select>
              </Form.Item>

              <Form.Item label="勿擾時間">
                <Space>
                  <TimePicker format="HH:mm" placeholder="開始時間" />
                  <TimePicker format="HH:mm" placeholder="結束時間" />
                  <Switch checkedChildren="啟用" unCheckedChildren="停用" />
                </Space>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  儲存設定
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 通知類型設定 */}
        <Col span={12}>
          <Card title="通知類型設定">
            <Table
              dataSource={Object.entries(notificationTypes).map(([key, value]) => ({
                type: key,
                ...value
              }))}
              columns={notificationTypeColumns}
              rowKey="type"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>

        {/* 通知群組 */}
        <Col span={24}>
          <Card 
            title="通知群組管理"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setGroupModalVisible(true)}
              >
                新增群組
              </Button>
            }
          >
            <Table
              dataSource={notificationGroups}
              columns={groupColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>

        {/* 通知歷史 */}
        <Col span={24}>
          <Card title="通知歷史">
            <Table
              dataSource={notificationHistory}
              columns={historyColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 新增群組模態框 */}
      <Modal
        title="新增通知群組"
        open={groupModalVisible}
        onCancel={() => setGroupModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={groupForm}
          onFinish={handleCreateGroup}
          layout="vertical"
        >
          <Form.Item
            label="群組名稱"
            name="name"
            rules={[{ required: true, message: '請輸入群組名稱' }]}
          >
            <Input placeholder="請輸入群組名稱" />
          </Form.Item>

          <Form.Item
            label="群組描述"
            name="description"
            rules={[{ required: true, message: '請輸入群組描述' }]}
          >
            <TextArea rows={3} placeholder="請輸入群組描述" />
          </Form.Item>

          <Form.Item
            label="通知類型"
            name="notification_types"
          >
            <Checkbox.Group>
              <Row>
                <Col span={12}>
                  <Checkbox value="critical_alerts">緊急警報</Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox value="warning_alerts">警告警報</Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox value="info_alerts">資訊通知</Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox value="system_updates">系統更新</Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox value="device_status">設備狀態</Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox value="ai_analysis">AI 分析</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item
            label="通知管道"
            name="channels"
          >
            <Checkbox.Group>
              <Row>
                <Col span={12}>
                  <Checkbox value="email">Email</Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox value="sms">簡訊</Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox value="push">推播</Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox value="teams">Teams</Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox value="wechat">微信</Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox value="slack">Slack</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
              >
                創建群組
              </Button>
              <Button onClick={() => setGroupModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 測試通知模態框 */}
      <Modal
        title="發送測試通知"
        open={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form layout="vertical">
          <Form.Item
            label="通知類型"
            name="test_type"
            rules={[{ required: true, message: '請選擇通知類型' }]}
          >
            <Select placeholder="請選擇通知類型">
              <Option value="critical_alerts">緊急警報</Option>
              <Option value="warning_alerts">警告警報</Option>
              <Option value="info_alerts">資訊通知</Option>
              <Option value="system_updates">系統更新</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="通知管道"
            name="test_channel"
            rules={[{ required: true, message: '請選擇通知管道' }]}
          >
            <Select placeholder="請選擇通知管道">
              <Option value="email">Email</Option>
              <Option value="push">推播</Option>
              <Option value="teams">Teams</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="測試訊息"
            name="test_message"
            rules={[{ required: true, message: '請輸入測試訊息' }]}
          >
            <TextArea rows={3} placeholder="請輸入測試訊息" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                onClick={handleTestNotification}
              >
                發送測試
              </Button>
              <Button onClick={() => setTestModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotificationPreferences; 