import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Typography,
  Divider,
  Badge,
  Tooltip,
  Popconfirm,
  message,
  Spin,
  Timeline,
  Descriptions,
  Collapse,
  List,
  Avatar,
  Rate,
  Gauge
} from 'antd';
import {
  DesktopOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  ThermometerOutlined,
  MemoryOutlined,
  PoweroffOutlined,
  FanOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  CloudServerOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  BulbOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const GPUMonitoring = () => {
  const [gpuDevices, setGpuDevices] = useState([]);
  const [selectedGPU, setSelectedGPU] = useState(null);
  const [gpuMonitoring, setGpuMonitoring] = useState([]);
  const [gpuAlerts, setGpuAlerts] = useState([]);
  const [gpuResourceAllocations, setGpuResourceAllocations] = useState([]);
  const [gpuPerformanceConfig, setGpuPerformanceConfig] = useState(null);
  const [gpuResourceUsage, setGpuResourceUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [allocationModalVisible, setAllocationModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [configForm] = Form.useForm();
  const [allocationForm] = Form.useForm();

  useEffect(() => {
    loadGPUDevices();
  }, []);

  useEffect(() => {
    if (selectedGPU) {
      loadGPUMonitoring();
      loadGPUAlerts();
      loadGPUResourceAllocations();
      loadGPUPerformanceConfig();
      loadGPUResourceUsage();
    }
  }, [selectedGPU]);

  const loadGPUDevices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/gpu/devices/');
      setGpuDevices(response.data);
    } catch (error) {
      message.error('載入 GPU 設備失敗');
    }
  };

  const loadGPUMonitoring = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/gpu/monitoring/?gpu_device_id=${selectedGPU}&limit=50`);
      setGpuMonitoring(response.data);
    } catch (error) {
      message.error('載入 GPU 監測數據失敗');
    }
  };

  const loadGPUAlerts = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/gpu/alerts/?gpu_device_id=${selectedGPU}&limit=50`);
      setGpuAlerts(response.data);
    } catch (error) {
      message.error('載入 GPU 警報失敗');
    }
  };

  const loadGPUResourceAllocations = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/gpu/allocations/?gpu_device_id=${selectedGPU}`);
      setGpuResourceAllocations(response.data);
    } catch (error) {
      message.error('載入 GPU 資源分配失敗');
    }
  };

  const loadGPUPerformanceConfig = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/gpu/performance-config/${selectedGPU}`);
      setGpuPerformanceConfig(response.data);
    } catch (error) {
      // 如果沒有配置，不顯示錯誤
    }
  };

  const loadGPUResourceUsage = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/gpu/resource-usage/${selectedGPU}`);
      setGpuResourceUsage(response.data);
    } catch (error) {
      message.error('載入 GPU 資源使用統計失敗');
    }
  };

  const createGPUDevice = async (values) => {
    try {
      await axios.post('http://localhost:8000/gpu/devices/', values);
      message.success('GPU 設備創建成功');
      setModalVisible(false);
      form.resetFields();
      loadGPUDevices();
    } catch (error) {
      message.error('創建 GPU 設備失敗');
    }
  };

  const simulateMonitoring = async () => {
    try {
      await axios.post(`http://localhost:8000/gpu/simulate-monitoring/${selectedGPU}`);
      message.success('模擬監測數據已生成');
      loadGPUMonitoring();
      loadGPUAlerts();
      loadGPUResourceUsage();
    } catch (error) {
      message.error('生成模擬數據失敗');
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await axios.patch(`http://localhost:8000/gpu/alerts/${alertId}/acknowledge`);
      message.success('警報已確認');
      loadGPUAlerts();
    } catch (error) {
      message.error('確認警報失敗');
    }
  };

  const getUtilizationColor = (value) => {
    if (value < 50) return '#52c41a';
    if (value < 80) return '#faad14';
    return '#ff4d4f';
  };

  const getTemperatureColor = (temp) => {
    if (temp < 60) return '#52c41a';
    if (temp < 75) return '#faad14';
    return '#ff4d4f';
  };

  const gpuMonitoringColumns = [
    {
      title: '時間',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: 'GPU 使用率',
      dataIndex: 'gpu_utilization',
      key: 'gpu_utilization',
      render: (value) => (
        <Progress 
          percent={value} 
          size="small" 
          strokeColor={getUtilizationColor(value)}
          format={() => `${value.toFixed(1)}%`}
        />
      ),
    },
    {
      title: '記憶體使用率',
      dataIndex: 'memory_utilization',
      key: 'memory_utilization',
      render: (value) => (
        <Progress 
          percent={value} 
          size="small" 
          strokeColor={getUtilizationColor(value)}
          format={() => `${value.toFixed(1)}%`}
        />
      ),
    },
    {
      title: '溫度',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (temp) => (
        <Tag color={getTemperatureColor(temp)}>
          <ThermometerOutlined /> {temp.toFixed(1)}°C
        </Tag>
      ),
    },
    {
      title: '功耗',
      dataIndex: 'power_consumption',
      key: 'power_consumption',
      render: (power) => (
        <Tag color="blue">
          <PoweroffOutlined /> {power.toFixed(1)}W
        </Tag>
      ),
    },
    {
      title: '風扇轉速',
      dataIndex: 'fan_speed',
      key: 'fan_speed',
      render: (speed) => (
        <Tag color="green">
          <FanOutlined /> {speed.toFixed(1)}%
        </Tag>
      ),
    },
  ];

  const gpuAlertColumns = [
    {
      title: '時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '警報類型',
      dataIndex: 'alert_type',
      key: 'alert_type',
      render: (type) => {
        const colors = {
          temperature: 'red',
          memory: 'orange',
          utilization: 'yellow',
          power: 'purple'
        };
        return <Tag color={colors[type]}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: '等級',
      dataIndex: 'alert_level',
      key: 'alert_level',
      render: (level) => {
        const colors = {
          warning: 'orange',
          critical: 'red'
        };
        return <Tag color={colors[level]}>{level.toUpperCase()}</Tag>;
      },
    },
    {
      title: '訊息',
      dataIndex: 'alert_message',
      key: 'alert_message',
    },
    {
      title: '狀態',
      dataIndex: 'is_acknowledged',
      key: 'is_acknowledged',
      render: (acknowledged) => (
        <Badge 
          status={acknowledged ? 'success' : 'processing'} 
          text={acknowledged ? '已確認' : '未確認'} 
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        !record.is_acknowledged && (
          <Button 
            size="small" 
            type="primary"
            onClick={() => acknowledgeAlert(record.id)}
          >
            確認
          </Button>
        )
      ),
    },
  ];

  const gpuResourceAllocationColumns = [
    {
      title: '開始時間',
      dataIndex: 'started_at',
      key: 'started_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: 'AI 模型',
      dataIndex: 'ai_model_id',
      key: 'ai_model_id',
      render: (modelId) => `模型 ${modelId}`,
    },
    {
      title: '分配記憶體',
      dataIndex: 'allocated_memory',
      key: 'allocated_memory',
      render: (memory) => `${memory} MB`,
    },
    {
      title: '優先級',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colors = {
          high: 'red',
          medium: 'orange',
          low: 'green'
        };
        return <Tag color={colors[priority]}>{priority.toUpperCase()}</Tag>;
      },
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          running: 'green',
          idle: 'orange',
          stopped: 'red'
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <DesktopOutlined />
                <span>GPU 效能監測系統</span>
              </Space>
            }
            extra={
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={() => {
                    loadGPUDevices();
                    if (selectedGPU) {
                      loadGPUMonitoring();
                      loadGPUAlerts();
                      loadGPUResourceAllocations();
                      loadGPUResourceUsage();
                    }
                  }}
                >
                  重新整理
                </Button>
                <Button 
                  type="primary" 
                  icon={<SettingOutlined />}
                  onClick={() => setModalVisible(true)}
                >
                  新增 GPU
                </Button>
              </Space>
            }
          >
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Statistic
                  title="GPU 設備數"
                  value={gpuDevices.length}
                  prefix={<DesktopOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="活躍 GPU"
                  value={gpuDevices.filter(g => g.is_active).length}
                  prefix={<ThunderboltOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="未確認警報"
                  value={gpuAlerts.filter(a => !a.is_acknowledged).length}
                  prefix={<WarningOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="資源分配"
                  value={gpuResourceAllocations.filter(a => a.status === 'running').length}
                  prefix={<CloudServerOutlined />}
                />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Select
                  placeholder="選擇 GPU 設備"
                  style={{ width: '100%' }}
                  onChange={setSelectedGPU}
                  value={selectedGPU}
                >
                  {gpuDevices.map(gpu => (
                    <Option key={gpu.id} value={gpu.id}>
                      {gpu.name} ({gpu.manufacturer})
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={12}>
                <Space>
                  <Button 
                    icon={<PlayCircleOutlined />}
                    onClick={simulateMonitoring}
                    disabled={!selectedGPU}
                  >
                    模擬監測
                  </Button>
                  <Button 
                    icon={<SettingOutlined />}
                    onClick={() => setConfigModalVisible(true)}
                    disabled={!selectedGPU}
                  >
                    效能設定
                  </Button>
                  <Button 
                    icon={<RocketOutlined />}
                    onClick={() => setAllocationModalVisible(true)}
                    disabled={!selectedGPU}
                  >
                    資源分配
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {selectedGPU && gpuResourceUsage && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="GPU 資源使用情況">
              <Row gutter={16}>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="總記憶體"
                      value={gpuResourceUsage.total_memory}
                      suffix="MB"
                      prefix={<MemoryOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="已使用記憶體"
                      value={gpuResourceUsage.used_memory}
                      suffix="MB"
                      valueStyle={{ color: getUtilizationColor(gpuResourceUsage.memory_utilization) }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="可用記憶體"
                      value={gpuResourceUsage.free_memory}
                      suffix="MB"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="AI 可用性"
                      value={gpuResourceUsage.available_for_ai ? '可用' : '不可用'}
                      valueStyle={{ color: gpuResourceUsage.available_for_ai ? '#52c41a' : '#ff4d4f' }}
                      prefix={<RocketOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              <Divider />

              <Row gutter={16}>
                <Col span={8}>
                  <Card title="GPU 使用率" size="small">
                    <Progress 
                      type="circle" 
                      percent={gpuResourceUsage.gpu_utilization} 
                      strokeColor={getUtilizationColor(gpuResourceUsage.gpu_utilization)}
                      format={() => `${gpuResourceUsage.gpu_utilization.toFixed(1)}%`}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="記憶體使用率" size="small">
                    <Progress 
                      type="circle" 
                      percent={gpuResourceUsage.memory_utilization} 
                      strokeColor={getUtilizationColor(gpuResourceUsage.memory_utilization)}
                      format={() => `${gpuResourceUsage.memory_utilization.toFixed(1)}%`}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="溫度" size="small">
                    <div style={{ textAlign: 'center' }}>
                      <Text style={{ fontSize: '24px', color: getTemperatureColor(gpuResourceUsage.temperature) }}>
                        {gpuResourceUsage.temperature.toFixed(1)}°C
                      </Text>
                    </div>
                  </Card>
                </Col>
              </Row>

              {gpuResourceUsage.recommended_models.length > 0 && (
                <>
                  <Divider />
                  <Card titl 