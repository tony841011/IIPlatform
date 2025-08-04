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
  Modal,
  Progress,
  Empty,
  Result,
  Skeleton,
  Transfer,
  Tree,
  Cascader,
  Rate,
  InputNumber,
  Mentions,
  AutoComplete,
  TreeSelect,
  Image,
  PageHeader,
  Breadcrumb,
  Dropdown,
  Menu,
  Affix,
  Anchor,
  BackTop,
  ConfigProvider,
  LocaleProvider,
  theme,
  App,
  FloatButton,
  Watermark,
  Tour,
  QRCode,
  Collapse
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
  BarChartOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  ScheduleOutlined,
  NotificationOutlined,
  SoundOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  FileMarkdownOutlined,
  FileCodeOutlined,
  FileProtectOutlined,
  FileSearchOutlined,
  FileSyncOutlined,
  FileExclamationOutlined,
  FileDoneOutlined,
  FileAddOutlined,
  FileRemoveOutlined,
  FileJpgOutlined,
  FilePngOutlined,
  FileGifOutlined,
  FileBmpOutlined,
  FileTiffOutlined,
  FileSvgOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  HeartOutlined,
  TrophyOutlined,
  StarOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  PictureOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CodeOutlined,
  BugOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  PieChartOutlined,
  HeatMapOutlined,
  PartitionOutlined,
  MonitorOutlined,
  ControlOutlined,
  RocketOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  CloudServerOutlined,
  CompassOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  BranchesOutlined,
  NodeIndexOutlined,
  ApartmentOutlined,
  GatewayOutlined,
  CloudOutlined,
  SyncOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const NotificationPreferences = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [groupForm] = Form.useForm();
  const [testForm] = Form.useForm();
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [editGroupModalVisible, setEditGroupModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [sortField, setSortField] = useState('sent_at');
  const [sortOrder, setSortOrder] = useState('descend');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

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
    quiet_hours_start: dayjs('22:00', 'HH:mm'),
    quiet_hours_end: dayjs('08:00', 'HH:mm'),
    timezone: 'Asia/Taipei',
    language: 'zh-TW',
    digest_enabled: true,
    digest_frequency: 'daily',
    digest_time: dayjs('09:00', 'HH:mm'),
    sound_enabled: true,
    vibration_enabled: true,
    priority_filter: 'all',
    auto_archive: true,
    archive_days: 30
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
      teams: true,
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
      name: '技術團隊',
      description: '負責系統維護和故障處理',
      members: 8,
      created_at: '2024-01-10 09:00:00',
      notification_types: ['critical_alerts', 'warning_alerts', 'system_updates'],
      channels: ['email', 'teams', 'push'],
      is_active: true
    },
    {
      id: 2,
      name: '管理層',
      description: '接收重要決策和系統狀態報告',
      members: 5,
      created_at: '2024-01-12 14:30:00',
      notification_types: ['critical_alerts', 'system_updates'],
      channels: ['email', 'teams'],
      is_active: true
    },
    {
      id: 3,
      name: '操作員',
      description: '日常設備監控和操作',
      members: 12,
      created_at: '2024-01-15 10:15:00',
      notification_types: ['warning_alerts', 'device_status'],
      channels: ['push', 'email'],
      is_active: true
    }
  ]);

  // 通知歷史
  const [notificationHistory, setNotificationHistory] = useState([
    {
      id: 1,
      type: 'critical_alerts',
      title: '設備故障警報',
      message: '設備 A-001 發生嚴重故障，需要立即處理',
      channel: 'email',
      status: 'sent',
      sent_at: '2024-01-15 15:30:00',
      read_at: '2024-01-15 15:35:00',
      recipient: 'tech-team@company.com',
      priority: 'high'
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
      recipient: 'operator1@company.com',
      priority: 'medium'
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
      recipient: 'tech-team@company.com',
      priority: 'low'
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

  // 處理保存個人偏好
  const handleSavePreferences = async (values) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 轉換 dayjs 對象為字符串
      const processedValues = {
        ...values,
        quiet_hours_start: values.quiet_hours_start ? values.quiet_hours_start.format('HH:mm') : '22:00',
        quiet_hours_end: values.quiet_hours_end ? values.quiet_hours_end.format('HH:mm') : '08:00',
        digest_time: values.digest_time ? values.digest_time.format('HH:mm') : '09:00'
      };
      
      setPersonalPreferences({ ...personalPreferences, ...processedValues });
      message.success('通知偏好設定已儲存');
    } catch (error) {
      message.error('儲存失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理創建通知群組
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
        channels: values.channels || [],
        is_active: true
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

  // 處理編輯通知群組
  const handleEditGroup = async (values) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedGroups = notificationGroups.map(group =>
        group.id === selectedGroup.id ? { ...group, ...values } : group
      );
      
      setNotificationGroups(updatedGroups);
      message.success('通知群組更新成功');
      setEditGroupModalVisible(false);
      setSelectedGroup(null);
      groupForm.resetFields();
    } catch (error) {
      message.error('更新失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理刪除通知群組
  const handleDeleteGroup = async (groupId) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedGroups = notificationGroups.filter(group => group.id !== groupId);
      setNotificationGroups(updatedGroups);
      message.success('通知群組刪除成功');
    } catch (error) {
      message.error('刪除失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理發送測試通知
  const handleTestNotification = async (values) => {
    try {
      setLoading(true);
      // 模擬發送測試通知
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 新增到通知歷史
      const newNotification = {
        id: notificationHistory.length + 1,
        type: values.test_type,
        title: '測試通知',
        message: values.test_message,
        channel: values.test_channel,
        status: 'sent',
        sent_at: new Date().toLocaleString(),
        read_at: null,
        recipient: 'test@company.com',
        priority: 'low'
      };
      
      setNotificationHistory([newNotification, ...notificationHistory]);
      message.success('測試通知已發送');
      setTestModalVisible(false);
      testForm.resetFields();
    } catch (error) {
      message.error('發送失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理批量操作
  const handleBatchOperation = async (operation, selectedIds) => {
    try {
      setLoading(true);
      // 模擬批量操作
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (operation === 'delete') {
        const updatedHistory = notificationHistory.filter(
          notification => !selectedIds.includes(notification.id)
        );
        setNotificationHistory(updatedHistory);
        message.success(`成功刪除 ${selectedIds.length} 條通知記錄`);
      } else if (operation === 'mark_read') {
        const updatedHistory = notificationHistory.map(notification =>
          selectedIds.includes(notification.id) 
            ? { ...notification, read_at: new Date().toLocaleString() }
            : notification
        );
        setNotificationHistory(updatedHistory);
        message.success(`成功標記 ${selectedIds.length} 條通知為已讀`);
      }
    } catch (error) {
      message.error('操作失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理匯出通知歷史
  const handleExportHistory = () => {
    const data = notificationHistory.map(notification => ({
      通知類型: notification.type,
      標題: notification.title,
      訊息: notification.message,
      管道: notification.channel,
      狀態: notification.status,
      發送時間: notification.sent_at,
      閱讀時間: notification.read_at,
      收件人: notification.recipient,
      優先級: notification.priority
    }));

    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "notification_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('通知歷史匯出成功');
  };

  // 處理匯入通知設定
  const handleImportSettings = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.personalPreferences) {
          // 轉換時間字符串為 dayjs 對象
          const processedPreferences = {
            ...data.personalPreferences,
            quiet_hours_start: dayjs(data.personalPreferences.quiet_hours_start, 'HH:mm'),
            quiet_hours_end: dayjs(data.personalPreferences.quiet_hours_end, 'HH:mm'),
            digest_time: dayjs(data.personalPreferences.digest_time, 'HH:mm')
          };
          setPersonalPreferences(processedPreferences);
        }
        if (data.notificationTypes) {
          setNotificationTypes(data.notificationTypes);
        }
        message.success('通知設定匯入成功');
      } catch (error) {
        message.error('匯入失敗：檔案格式錯誤');
      }
    };
    reader.readAsText(file);
  };

  // 處理匯出通知設定
  const handleExportSettings = () => {
    const settings = {
      personalPreferences: {
        ...personalPreferences,
        quiet_hours_start: personalPreferences.quiet_hours_start.format('HH:mm'),
        quiet_hours_end: personalPreferences.quiet_hours_end.format('HH:mm'),
        digest_time: personalPreferences.digest_time.format('HH:mm')
      },
      notificationTypes,
      notificationGroups
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'notification_settings.json';
    link.click();
    URL.revokeObjectURL(url);
    message.success('通知設定匯出成功');
  };

  // 處理通知類型設定更新
  const handleNotificationTypeUpdate = (type, channel, enabled) => {
    const updatedTypes = {
      ...notificationTypes,
      [type]: {
        ...notificationTypes[type],
        [channel]: enabled
      }
    };
    setNotificationTypes(updatedTypes);
    message.success(`${type} 的 ${channel} 通知已${enabled ? '啟用' : '停用'}`);
  };

  // 處理群組狀態切換
  const handleGroupStatusToggle = (groupId, enabled) => {
    const updatedGroups = notificationGroups.map(group =>
      group.id === groupId ? { ...group, is_active: enabled } : group
    );
    setNotificationGroups(updatedGroups);
    message.success(`群組狀態已${enabled ? '啟用' : '停用'}`);
  };

  // 處理通知歷史過濾和排序
  const filteredHistory = notificationHistory.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
    const matchesChannel = filterChannel === 'all' || notification.channel === filterChannel;
    return matchesSearch && matchesStatus && matchesChannel;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (sortOrder === 'ascend') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // 表格列定義
  const historyColumns = [
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
        return <Tag color={type === 'critical_alerts' ? 'red' : type === 'warning_alerts' ? 'orange' : 'blue'}>
          {typeNames[type]}
        </Tag>;
      }
    },
    {
      title: '標題',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <Space direction="vertical">
          <Text strong>{title}</Text>
          <Text type="secondary">{record.message}</Text>
        </Space>
      )
    },
    {
      title: '管道',
      dataIndex: 'channel',
      key: 'channel',
      render: (channel) => (
        <Tag color="green">{channel}</Tag>
      )
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Space>
          <Badge 
            status={status === 'sent' ? 'success' : 'processing'} 
            text={status === 'sent' ? '已發送' : '發送中'} 
          />
          {record.read_at && <Tag color="blue">已讀</Tag>}
        </Space>
      )
    },
    {
      title: '發送時間',
      dataIndex: 'sent_at',
      key: 'sent_at',
      sorter: true
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedNotification(record);
              setHistoryDrawerVisible(true);
            }}
          >
            詳情
          </Button>
          <Popconfirm
            title="確定要刪除此通知記錄嗎？"
            onConfirm={() => {
              const updatedHistory = notificationHistory.filter(n => n.id !== record.id);
              setNotificationHistory(updatedHistory);
              message.success('通知記錄已刪除');
            }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              刪除
            </Button>
          </Popconfirm>
        </Space>
      )
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
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleGroupStatusToggle(record.id, checked)}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedGroup(record);
              groupForm.setFieldsValue(record);
              setEditGroupModalVisible(true);
            }}
          >
            編輯
          </Button>
          <Popconfirm
            title="確定要刪除此群組嗎？"
            onConfirm={() => handleDeleteGroup(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              刪除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 統計卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="總發送數"
              value={notificationStats.total_sent}
              prefix={<SendOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已讀數"
              value={notificationStats.total_read}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="閱讀率"
              value={notificationStats.read_rate}
              suffix="%"
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均回應時間"
              value={notificationStats.avg_response_time}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="personal">
        {/* 個人偏好設定 */}
        <TabPane tab="個人偏好" key="personal">
          <Card title="個人通知偏好設定">
            <Form
              layout="vertical"
              initialValues={personalPreferences}
              onFinish={handleSavePreferences}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Title level={5}>通知管道</Title>
                  <Form.Item name="email_notifications" label="Email 通知">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="sms_notifications" label="簡訊通知">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="push_notifications" label="推播通知">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="teams_notifications" label="Teams 通知">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="wechat_notifications" label="微信通知">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="slack_notifications" label="Slack 通知">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Title level={5}>通知設定</Title>
                  <Form.Item name="notification_frequency" label="通知頻率">
                    <Select>
                      <Option value="immediate">即時</Option>
                      <Option value="digest">彙整</Option>
                      <Option value="daily">每日</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="quiet_hours_enabled" label="勿擾模式">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="quiet_hours_start" label="勿擾開始時間">
                    <TimePicker format="HH:mm" />
                  </Form.Item>
                  <Form.Item name="quiet_hours_end" label="勿擾結束時間">
                    <TimePicker format="HH:mm" />
                  </Form.Item>
                  <Form.Item name="timezone" label="時區">
                    <Select>
                      <Option value="Asia/Taipei">台北 (UTC+8)</Option>
                      <Option value="Asia/Tokyo">東京 (UTC+9)</Option>
                      <Option value="America/New_York">紐約 (UTC-5)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    儲存設定
                  </Button>
                  <Button onClick={() => form.resetFields()}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        {/* 通知類型設定 */}
        <TabPane tab="通知類型" key="types">
          <Card title="通知類型偏好設定">
            <Table
              columns={[
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
                  render: (enabled, record) => (
                    <Switch 
                      checked={enabled} 
                      size="small"
                      onChange={(checked) => handleNotificationTypeUpdate(record.type, 'email', checked)}
                    />
                  )
                },
                {
                  title: '簡訊',
                  dataIndex: 'sms',
                  key: 'sms',
                  render: (enabled, record) => (
                    <Switch 
                      checked={enabled} 
                      size="small"
                      onChange={(checked) => handleNotificationTypeUpdate(record.type, 'sms', checked)}
                    />
                  )
                },
                {
                  title: '推播',
                  dataIndex: 'push',
                  key: 'push',
                  render: (enabled, record) => (
                    <Switch 
                      checked={enabled} 
                      size="small"
                      onChange={(checked) => handleNotificationTypeUpdate(record.type, 'push', checked)}
                    />
                  )
                },
                {
                  title: 'Teams',
                  dataIndex: 'teams',
                  key: 'teams',
                  render: (enabled, record) => (
                    <Switch 
                      checked={enabled} 
                      size="small"
                      onChange={(checked) => handleNotificationTypeUpdate(record.type, 'teams', checked)}
                    />
                  )
                },
                {
                  title: '微信',
                  dataIndex: 'wechat',
                  key: 'wechat',
                  render: (enabled, record) => (
                    <Switch 
                      checked={enabled} 
                      size="small"
                      onChange={(checked) => handleNotificationTypeUpdate(record.type, 'wechat', checked)}
                    />
                  )
                },
                {
                  title: 'Slack',
                  dataIndex: 'slack',
                  key: 'slack',
                  render: (enabled, record) => (
                    <Switch 
                      checked={enabled} 
                      size="small"
                      onChange={(checked) => handleNotificationTypeUpdate(record.type, 'slack', checked)}
                    />
                  )
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
              ]}
              dataSource={Object.entries(notificationTypes).map(([type, config]) => ({
                type,
                ...config
              }))}
              pagination={false}
              size="small"
            />
          </Card>
        </TabPane>

        {/* 通知群組 */}
        <TabPane tab="通知群組" key="groups">
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
              columns={groupColumns}
              dataSource={notificationGroups}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </TabPane>

        {/* 通知歷史 */}
        <TabPane tab="通知歷史" key="history">
          <Card 
            title="通知歷史記錄"
            extra={
              <Space>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={handleExportHistory}
                >
                  匯出歷史
                </Button>
                <Button 
                  icon={<SendOutlined />}
                  onClick={() => setTestModalVisible(true)}
                >
                  發送測試
                </Button>
              </Space>
            }
          >
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Input.Search
                  placeholder="搜索通知"
                  onSearch={setSearchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col span={4}>
                <Select
                  placeholder="狀態過濾"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: '100%' }}
                >
                  <Option value="all">全部狀態</Option>
                  <Option value="sent">已發送</Option>
                  <Option value="pending">發送中</Option>
                </Select>
              </Col>
              <Col span={4}>
                <Select
                  placeholder="管道過濾"
                  value={filterChannel}
                  onChange={setFilterChannel}
                  style={{ width: '100%' }}
                >
                  <Option value="all">全部管道</Option>
                  <Option value="email">Email</Option>
                  <Option value="push">推播</Option>
                  <Option value="teams">Teams</Option>
                  <Option value="sms">簡訊</Option>
                </Select>
              </Col>
              <Col span={8}>
                <Space>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setSearchText('');
                      setFilterStatus('all');
                      setFilterChannel('all');
                    }}
                  >
                    重置過濾
                  </Button>
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={handleExportHistory}
                  >
                    匯出
                  </Button>
                </Space>
              </Col>
            </Row>
            <Table
              columns={historyColumns}
              dataSource={sortedHistory}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
              }}
              onChange={(pagination, filters, sorter) => {
                setPagination(pagination);
                setSortField(sorter.field);
                setSortOrder(sorter.order);
              }}
            />
          </Card>
        </TabPane>

        {/* 設定管理 */}
        <TabPane tab="設定管理" key="settings">
          <Card title="通知設定管理">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="匯出/匯入設定" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button 
                      icon={<DownloadOutlined />}
                      onClick={handleExportSettings}
                      block
                    >
                      匯出通知設定
                    </Button>
                    <Button 
                      icon={<UploadOutlined />}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.json';
                        input.onchange = (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleImportSettings(file);
                          }
                        };
                        input.click();
                      }}
                      block
                    >
                      匯入通知設定
                    </Button>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="統計資訊" size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Email 發送率">
                      {notificationStats.channel_stats.email.rate}%
                    </Descriptions.Item>
                    <Descriptions.Item label="推播發送率">
                      {notificationStats.channel_stats.push.rate}%
                    </Descriptions.Item>
                    <Descriptions.Item label="Teams 發送率">
                      {notificationStats.channel_stats.teams.rate}%
                    </Descriptions.Item>
                    <Descriptions.Item label="簡訊發送率">
                      {notificationStats.channel_stats.sms.rate}%
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

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
          layout="vertical"
          onFinish={handleCreateGroup}
        >
          <Form.Item
            name="name"
            label="群組名稱"
            rules={[{ required: true, message: '請輸入群組名稱' }]}
          >
            <Input placeholder="請輸入群組名稱" />
          </Form.Item>
          <Form.Item
            name="description"
            label="群組描述"
            rules={[{ required: true, message: '請輸入群組描述' }]}
          >
            <TextArea rows={3} placeholder="請輸入群組描述" />
          </Form.Item>
          <Form.Item
            name="notification_types"
            label="通知類型"
            rules={[{ required: true, message: '請選擇通知類型' }]}
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
            name="channels"
            label="通知管道"
            rules={[{ required: true, message: '請選擇通知管道' }]}
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

      {/* 編輯群組模態框 */}
      <Modal
        title="編輯通知群組"
        open={editGroupModalVisible}
        onCancel={() => setEditGroupModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={groupForm}
          layout="vertical"
          onFinish={handleEditGroup}
        >
          <Form.Item
            name="name"
            label="群組名稱"
            rules={[{ required: true, message: '請輸入群組名稱' }]}
          >
            <Input placeholder="請輸入群組名稱" />
          </Form.Item>
          <Form.Item
            name="description"
            label="群組描述"
            rules={[{ required: true, message: '請輸入群組描述' }]}
          >
            <TextArea rows={3} placeholder="請輸入群組描述" />
          </Form.Item>
          <Form.Item
            name="notification_types"
            label="通知類型"
            rules={[{ required: true, message: '請選擇通知類型' }]}
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
            name="channels"
            label="通知管道"
            rules={[{ required: true, message: '請選擇通知管道' }]}
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
                更新群組
              </Button>
              <Button onClick={() => setEditGroupModalVisible(false)}>
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
        <Form
          form={testForm}
          layout="vertical"
          onFinish={handleTestNotification}
        >
          <Form.Item
            name="test_type"
            label="通知類型"
            rules={[{ required: true, message: '請選擇通知類型' }]}
          >
            <Select placeholder="請選擇通知類型">
              <Option value="critical_alerts">緊急警報</Option>
              <Option value="warning_alerts">警告警報</Option>
              <Option value="info_alerts">資訊通知</Option>
              <Option value="system_updates">系統更新</Option>
              <Option value="device_status">設備狀態</Option>
              <Option value="ai_analysis">AI 分析</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="test_channel"
            label="通知管道"
            rules={[{ required: true, message: '請選擇通知管道' }]}
          >
            <Select placeholder="請選擇通知管道">
              <Option value="email">Email</Option>
              <Option value="push">推播</Option>
              <Option value="teams">Teams</Option>
              <Option value="sms">簡訊</Option>
              <Option value="wechat">微信</Option>
              <Option value="slack">Slack</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="test_message"
            label="測試訊息"
            rules={[{ required: true, message: '請輸入測試訊息' }]}
          >
            <TextArea rows={3} placeholder="請輸入測試訊息" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                發送測試
              </Button>
              <Button onClick={() => setTestModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 通知歷史抽屜 */}
      <Drawer
        title="通知詳情"
        placement="right"
        onClose={() => setHistoryDrawerVisible(false)}
        open={historyDrawerVisible}
        width={500}
      >
        {selectedNotification ? (
          <Descriptions title={selectedNotification.title} bordered>
            <Descriptions.Item label="類型">{selectedNotification.type}</Descriptions.Item>
            <Descriptions.Item label="管道">{selectedNotification.channel}</Descriptions.Item>
            <Descriptions.Item label="狀態">{selectedNotification.status}</Descriptions.Item>
            <Descriptions.Item label="優先級">{selectedNotification.priority}</Descriptions.Item>
            <Descriptions.Item label="發送時間">{dayjs(selectedNotification.sent_at).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            <Descriptions.Item label="閱讀時間">{selectedNotification.read_at ? dayjs(selectedNotification.read_at).format('YYYY-MM-DD HH:mm:ss') : '未讀'}</Descriptions.Item>
            <Descriptions.Item label="收件人">{selectedNotification.recipient}</Descriptions.Item>
            <Descriptions.Item label="訊息">{selectedNotification.message}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty description="請選擇一條通知查看詳情" />
        )}
      </Drawer>
    </div>
  );
};

export default NotificationPreferences;
 