import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Spin,
  Alert,
  Progress,
  Tag,
  Tooltip,
  Timeline,
  Descriptions,
  Divider,
  List,
  Avatar,
  Steps,
  Badge,
  Popconfirm,
  Drawer,
  Tabs,
  Upload,
  DatePicker,
  Switch,
  Slider,
  Statistic
} from 'antd';
import {
  GatewayOutlined,
  CloudOutlined,
  DesktopOutlined,
  ApiOutlined,
  SettingOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  TeamOutlined,
  DatabaseOutlined,
  WifiOutlined,
  DisconnectOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Step } = Steps;
const { TabPane } = Tabs;

const EdgeGateway = () => {
  const [loading, setLoading] = useState(false);
  const [gatewayModalVisible, setGatewayModalVisible] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [gatewayForm] = Form.useForm();
  const [syncForm] = Form.useForm();

  // 邊緣閘道數據
  const [gateways, setGateways] = useState([
    {
      id: 1,
      name: 'Edge Gateway A-001',
      location: '台北市信義區',
      status: 'online',
      ip_address: '192.168.1.100',
      mac_address: '00:11:22:33:44:55',
      firmware_version: 'v2.1.5',
      last_heartbeat: '2024-01-15 14:30:00',
      connected_devices: 15,
      cpu_usage: 45,
      memory_usage: 62,
      storage_usage: 78,
      network_status: 'connected',
      sync_status: 'synced',
      ai_models: ['fault_detection', 'quality_check'],
      cache_size: '2.5 GB',
      offline_duration: '0分鐘'
    },
    {
      id: 2,
      name: 'Edge Gateway B-002',
      location: '新北市板橋區',
      status: 'warning',
      ip_address: '192.168.1.101',
      mac_address: '00:11:22:33:44:56',
      firmware_version: 'v2.1.3',
      last_heartbeat: '2024-01-15 14:25:00',
      connected_devices: 8,
      cpu_usage: 78,
      memory_usage: 85,
      storage_usage: 92,
      network_status: 'connected',
      sync_status: 'syncing',
      ai_models: ['energy_optimization'],
      cache_size: '1.8 GB',
      offline_duration: '0分鐘'
    },
    {
      id: 3,
      name: 'Edge Gateway C-003',
      location: '桃園市龜山區',
      status: 'offline',
      ip_address: '192.168.1.102',
      mac_address: '00:11:22:33:44:57',
      firmware_version: 'v2.0.8',
      last_heartbeat: '2024-01-15 12:15:00',
      connected_devices: 0,
      cpu_usage: 0,
      memory_usage: 0,
      storage_usage: 0,
      network_status: 'disconnected',
      sync_status: 'failed',
      ai_models: [],
      cache_size: '0 GB',
      offline_duration: '2小時15分鐘'
    }
  ]);

  // 同步策略
  const [syncStrategies, setSyncStrategies] = useState([
    {
      id: 1,
      name: '即時同步',
      description: '數據即時上傳到雲端',
      type: 'realtime',
      interval: '0秒',
      priority: 'high',
      is_active: true,
      success_rate: 98.5,
      last_sync: '2024-01-15 14:30:00'
    },
    {
      id: 2,
      name: '批次同步',
      description: '每小時批次上傳數據',
      type: 'batch',
      interval: '1小時',
      priority: 'medium',
      is_active: true,
      success_rate: 99.2,
      last_sync: '2024-01-15 14:00:00'
    },
    {
      id: 3,
      name: '斷線補償',
      description: '網路恢復後補償上傳',
      type: 'compensation',
      interval: '自動',
      priority: 'low',
      is_active: true,
      success_rate: 95.8,
      last_sync: '2024-01-15 13:45:00'
    }
  ]);

  // 邊緣 AI 模型
  const [edgeModels, setEdgeModels] = useState([
    {
      id: 1,
      name: '設備故障檢測',
      version: 'v1.2.0',
      size: '45.2 MB',
      accuracy: 94.5,
      inference_time: '120ms',
      gateway_id: 1,
      status: 'active',
      last_updated: '2024-01-15 10:00:00',
      usage_count: 1250
    },
    {
      id: 2,
      name: '品質檢測',
      version: 'v1.1.5',
      size: '32.8 MB',
      accuracy: 96.8,
      inference_time: '85ms',
      gateway_id: 1,
      status: 'active',
      last_updated: '2024-01-14 15:30:00',
      usage_count: 890
    },
    {
      id: 3,
      name: '能源優化',
      version: 'v1.0.8',
      size: '28.5 MB',
      accuracy: 91.2,
      inference_time: '150ms',
      gateway_id: 2,
      status: 'active',
      last_updated: '2024-01-13 09:15:00',
      usage_count: 567
    }
  ]);

  // 閘道統計
  const [gatewayStats, setGatewayStats] = useState({
    total_gateways: 3,
    online_gateways: 2,
    offline_gateways: 1,
    total_devices: 23,
    total_models: 3,
    avg_cpu_usage: 41,
    avg_memory_usage: 49,
    total_cache_size: '4.3 GB'
  });

  const handleAddGateway = async (values) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newGateway = {
        id: gateways.length + 1,
        ...values,
        status: 'offline',
        connected_devices: 0,
        cpu_usage: 0,
        memory_usage: 0,
        storage_usage: 0,
        network_status: 'disconnected',
        sync_status: 'failed',
        ai_models: [],
        cache_size: '0 GB',
        offline_duration: '0分鐘',
        last_heartbeat: null
      };
      
      setGateways([newGateway, ...gateways]);
      message.success('邊緣閘道新增成功');
      setGatewayModalVisible(false);
      gatewayForm.resetFields();
    } catch (error) {
      message.error('新增失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncStrategy = async (values) => {
    try {
      setLoading(true);
      // 模擬同步策略設定
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      message.success('同步策略設定成功');
      setSyncModalVisible(false);
      syncForm.resetFields();
    } catch (error) {
      message.error('設定失敗');
    } finally {
      setLoading(false);
    }
  };

  const gatewayColumns = [
    {
      title: '閘道名稱',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space direction="vertical">
          <Text strong>{name}</Text>
          <Text type="secondary">{record.location}</Text>
        </Space>
      )
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'online' ? 'green' : 
          status === 'warning' ? 'orange' : 'red'
        }>
          {status === 'online' ? '線上' : 
           status === 'warning' ? '警告' : '離線'}
        </Tag>
      )
    },
    {
      title: 'IP 地址',
      dataIndex: 'ip_address',
      key: 'ip_address'
    },
    {
      title: '連接設備',
      dataIndex: 'connected_devices',
      key: 'connected_devices',
      render: (devices) => <Badge count={devices} style={{ backgroundColor: '#52c41a' }} />
    },
    {
      title: 'CPU 使用率',
      dataIndex: 'cpu_usage',
      key: 'cpu_usage',
      render: (usage) => (
        <Progress 
          percent={usage} 
          size="small" 
          status={usage > 80 ? 'exception' : 'normal'}
        />
      )
    },
    {
      title: '記憶體使用率',
      dataIndex: 'memory_usage',
      key: 'memory_usage',
      render: (usage) => (
        <Progress 
          percent={usage} 
          size="small" 
          status={usage > 85 ? 'exception' : 'normal'}
        />
      )
    },
    {
      title: '同步狀態',
      dataIndex: 'sync_status',
      key: 'sync_status',
      render: (status) => (
        <Tag color={
          status === 'synced' ? 'green' : 
          status === 'syncing' ? 'orange' : 'red'
        }>
          {status === 'synced' ? '已同步' : 
           status === 'syncing' ? '同步中' : '同步失敗'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => setSelectedGateway(record)}
          >
            詳情
          </Button>
          <Button 
            size="small" 
            icon={<EditOutlined />}
          >
            編輯
          </Button>
          <Button 
            size="small" 
            icon={<ReloadOutlined />}
          >
            重啟
          </Button>
        </Space>
      )
    }
  ];

  const modelColumns = [
    {
      title: '模型名稱',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version'
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size'
    },
    {
      title: '準確率',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy) => `${accuracy}%`
    },
    {
      title: '推論時間',
      dataIndex: 'inference_time',
      key: 'inference_time'
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '啟用' : '停用'}
        </Tag>
      )
    },
    {
      title: '使用次數',
      dataIndex: 'usage_count',
      key: 'usage_count'
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>詳情</Button>
          <Button size="small" icon={<EditOutlined />}>更新</Button>
        </Space>
      )
    }
  ];

  const strategyColumns = [
    {
      title: '策略名稱',
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
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeNames = {
          realtime: '即時',
          batch: '批次',
          compensation: '補償'
        };
        return <Tag color="blue">{typeNames[type]}</Tag>;
      }
    },
    {
      title: '間隔',
      dataIndex: 'interval',
      key: 'interval'
    },
    {
      title: '優先級',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={
          priority === 'high' ? 'red' : 
          priority === 'medium' ? 'orange' : 'green'
        }>
          {priority === 'high' ? '高' : 
           priority === 'medium' ? '中' : '低'}
        </Tag>
      )
    },
    {
      title: '成功率',
      dataIndex: 'success_rate',
      key: 'success_rate',
      render: (rate) => `${rate}%`
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => <Switch checked={active} size="small" />
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>編輯</Button>
          <Button size="small" icon={<SettingOutlined />}>設定</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <GatewayOutlined /> 邊緣閘道管理
      </Title>

      <Row gutter={[16, 16]}>
        {/* 閘道統計 */}
        <Col span={24}>
          <Card title="閘道統計概覽">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="總閘道數"
                  value={gatewayStats.total_gateways}
                  prefix={<GatewayOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="線上閘道"
                  value={gatewayStats.online_gateways}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="連接設備"
                  value={gatewayStats.total_devices}
                  prefix={<DesktopOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="AI 模型"
                  value={gatewayStats.total_models}
                  prefix={<TrophyOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 邊緣閘道列表 */}
        <Col span={24}>
          <Card 
            title="邊緣閘道"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setGatewayModalVisible(true)}
              >
                新增閘道
              </Button>
            }
          >
            <Table
              dataSource={gateways}
              columns={gatewayColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>

        {/* AI 模型與同步策略 */}
        <Col span={12}>
          <Card title="邊緣 AI 模型">
            <Table
              dataSource={edgeModels}
              columns={modelColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card 
            title="同步策略"
            extra={
              <Button 
                type="primary" 
                size="small"
                icon={<SettingOutlined />}
                onClick={() => setSyncModalVisible(true)}
              >
                設定策略
              </Button>
            }
          >
            <Table
              dataSource={syncStrategies}
              columns={strategyColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 新增閘道模態框 */}
      <Modal
        title="新增邊緣閘道"
        open={gatewayModalVisible}
        onCancel={() => setGatewayModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={gatewayForm}
          onFinish={handleAddGateway}
          layout="vertical"
        >
          <Form.Item
            label="閘道名稱"
            name="name"
            rules={[{ required: true, message: '請輸入閘道名稱' }]}
          >
            <Input placeholder="請輸入閘道名稱" />
          </Form.Item>

          <Form.Item
            label="位置"
            name="location"
            rules={[{ required: true, message: '請輸入位置' }]}
          >
            <Input placeholder="請輸入位置" />
          </Form.Item>

          <Form.Item
            label="IP 地址"
            name="ip_address"
            rules={[{ required: true, message: '請輸入 IP 地址' }]}
          >
            <Input placeholder="例如：192.168.1.100" />
          </Form.Item>

          <Form.Item
            label="MAC 地址"
            name="mac_address"
            rules={[{ required: true, message: '請輸入 MAC 地址' }]}
          >
            <Input placeholder="例如：00:11:22:33:44:55" />
          </Form.Item>

          <Form.Item
            label="韌體版本"
            name="firmware_version"
            rules={[{ required: true, message: '請輸入韌體版本' }]}
          >
            <Input placeholder="例如：v2.1.0" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
              >
                新增閘道
              </Button>
              <Button onClick={() => setGatewayModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 同步策略設定模態框 */}
      <Modal
        title="同步策略設定"
        open={syncModalVisible}
        onCancel={() => setSyncModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={syncForm}
          onFinish={handleSyncStrategy}
          layout="vertical"
        >
          <Form.Item
            label="同步類型"
            name="sync_type"
            rules={[{ required: true, message: '請選擇同步類型' }]}
          >
            <Select placeholder="請選擇同步類型">
              <Option value="realtime">即時同步</Option>
              <Option value="batch">批次同步</Option>
              <Option value="compensation">斷線補償</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="同步間隔"
            name="sync_interval"
            rules={[{ required: true, message: '請設定同步間隔' }]}
          >
            <Select placeholder="請選擇同步間隔">
              <Option value="0">即時</Option>
              <Option value="300">5分鐘</Option>
              <Option value="1800">30分鐘</Option>
              <Option value="3600">1小時</Option>
              <Option value="86400">1天</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="優先級"
            name="priority"
            rules={[{ required: true, message: '請選擇優先級' }]}
          >
            <Select placeholder="請選擇優先級">
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="啟用策略"
            name="is_active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
              >
                設定策略
              </Button>
              <Button onClick={() => setSyncModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 閘道詳情抽屜 */}
      <Drawer
        title="閘道詳情"
        placement="right"
        width={600}
        open={selectedGateway !== null}
        onClose={() => setSelectedGateway(null)}
      >
        {selectedGateway && (
          <div>
            <Descriptions title="基本資訊" column={1}>
              <Descriptions.Item label="閘道名稱">{selectedGateway.name}</Descriptions.Item>
              <Descriptions.Item label="位置">{selectedGateway.location}</Descriptions.Item>
              <Descriptions.Item label="IP 地址">{selectedGateway.ip_address}</Descriptions.Item>
              <Descriptions.Item label="MAC 地址">{selectedGateway.mac_address}</Descriptions.Item>
              <Descriptions.Item label="韌體版本">{selectedGateway.firmware_version}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="狀態資訊" column={1}>
              <Descriptions.Item label="連接狀態">
                <Tag color={selectedGateway.status === 'online' ? 'green' : 'red'}>
                  {selectedGateway.status === 'online' ? '線上' : '離線'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="網路狀態">
                <Tag color={selectedGateway.network_status === 'connected' ? 'green' : 'red'}>
                  {selectedGateway.network_status === 'connected' ? '已連接' : '未連接'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="同步狀態">
                <Tag color={
                  selectedGateway.sync_status === 'synced' ? 'green' : 
                  selectedGateway.sync_status === 'syncing' ? 'orange' : 'red'
                }>
                  {selectedGateway.sync_status === 'synced' ? '已同步' : 
                   selectedGateway.sync_status === 'syncing' ? '同步中' : '同步失敗'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="最後心跳">{selectedGateway.last_heartbeat}</Descriptions.Item>
              <Descriptions.Item label="離線時間">{selectedGateway.offline_duration}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="資源使用" column={1}>
              <Descriptions.Item label="CPU 使用率">
                <Progress percent={selectedGateway.cpu_usage} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="記憶體使用率">
                <Progress percent={selectedGateway.memory_usage} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="儲存使用率">
                <Progress percent={selectedGateway.storage_usage} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="快取大小">{selectedGateway.cache_size}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="連接設備" column={1}>
              <Descriptions.Item label="設備數量">
                <Badge count={selectedGateway.connected_devices} style={{ backgroundColor: '#52c41a' }} />
              </Descriptions.Item>
              <Descriptions.Item label="AI 模型">
                {selectedGateway.ai_models.map(model => (
                  <Tag key={model} color="blue">{model}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default EdgeGateway; 