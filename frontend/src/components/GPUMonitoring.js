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
  Gauge,
  Select
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
  FireOutlined,
  HddOutlined,
  PoweroffOutlined,
  CloudOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  CloudServerOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  BulbOutlined,
  PlusOutlined
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
      const response = await axios.get(`http://localhost:8000/gpu/monitoring/${selectedGPU.id}/`);
      setGpuMonitoring(response.data);
    } catch (error) {
      message.error('載入 GPU 監控數據失敗');
    }
  };

  const loadGPUAlerts = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/gpu/alerts/${selectedGPU.id}/`);
      setGpuAlerts(response.data);
    } catch (error) {
      message.error('載入 GPU 告警失敗');
    }
  };

  const loadGPUResourceAllocations = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/gpu/allocations/${selectedGPU.id}/`);
      setGpuResourceAllocations(response.data);
    } catch (error) {
      message.error('載入 GPU 資源分配失敗');
    }
  };

  const loadGPUPerformanceConfig = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/gpu/config/${selectedGPU.id}/`);
      setGpuPerformanceConfig(response.data);
    } catch (error) {
      message.error('載入 GPU 性能配置失敗');
    }
  };

  const loadGPUResourceUsage = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/gpu/usage/${selectedGPU.id}/`);
      setGpuResourceUsage(response.data);
    } catch (error) {
      message.error('載入 GPU 資源使用情況失敗');
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
    setLoading(true);
    try {
      await axios.post(`http://localhost:8000/gpu/simulate/${selectedGPU.id}/`);
      message.success('模擬監控數據生成成功');
      loadGPUMonitoring();
    } catch (error) {
      message.error('模擬監控數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await axios.put(`http://localhost:8000/gpu/alerts/${alertId}/acknowledge/`);
      message.success('告警已確認');
      loadGPUAlerts();
    } catch (error) {
      message.error('確認告警失敗');
    }
  };

  const getUtilizationColor = (value) => {
    if (value < 50) return '#52c41a';
    if (value < 80) return '#faad14';
    return '#ff4d4f';
  };

  const getTemperatureColor = (temp) => {
    if (temp < 60) return '#52c41a';
    if (temp < 80) return '#faad14';
    return '#ff4d4f';
  };

  const gpuColumns = [
    {
      title: '設備名稱',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '型號',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'online' ? 'green' : 'red'}>
          {status === 'online' ? '在線' : '離線'}
        </Tag>
      ),
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
        />
      ),
    },
    {
      title: '溫度',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (value) => (
        <Text style={{ color: getTemperatureColor(value) }}>
          {value.toFixed(1)}°C
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => setSelectedGPU(record)}
          >
            查看詳情
          </Button>
        </Space>
      ),
    },
  ];

  const alertColumns = [
    {
      title: '時間',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'warning' ? 'orange' : 'red'}>
          {type === 'warning' ? '警告' : '錯誤'}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'acknowledged' ? 'green' : 'orange'}>
          {status === 'acknowledged' ? '已確認' : '未確認'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status !== 'acknowledged' && (
            <Button 
              size="small"
              onClick={() => acknowledgeAlert(record.id)}
            >
              確認
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>GPU 監控與 AI 異常偵測</Title>
      
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="GPU 設備列表" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                新增 GPU 設備
              </Button>
            }
          >
            <Table 
              columns={gpuColumns} 
              dataSource={gpuDevices}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>

      {selectedGPU && (
        <>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Card 
                title={`${selectedGPU.name} - 詳細監控`}
                extra={
                  <Space>
                    <Button 
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        loadGPUMonitoring();
                        loadGPUAlerts();
                        loadGPUResourceUsage();
                      }}
                    >
                      刷新
                    </Button>
                    <Button 
                      icon={<PlayCircleOutlined />}
                      onClick={simulateMonitoring}
                      loading={loading}
                    >
                      模擬監控
                    </Button>
                    <Button 
                      icon={<SettingOutlined />}
                      onClick={() => setConfigModalVisible(true)}
                    >
                      性能配置
                    </Button>
                    <Button 
                      icon={<RocketOutlined />}
                      onClick={() => setAllocationModalVisible(true)}
                      disabled={!selectedGPU}
                    >
                      資源分配
                    </Button>
                  </Space>
                }
              >
                <Row gutter={16}>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="GPU 使用率"
                        value={selectedGPU.gpu_utilization}
                        suffix="%"
                        prefix={<DesktopOutlined />}
                        valueStyle={{ color: getUtilizationColor(selectedGPU.gpu_utilization) }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="記憶體使用率"
                        value={selectedGPU.memory_utilization}
                        suffix="%"
                        prefix={<HddOutlined />}
                        valueStyle={{ color: getUtilizationColor(selectedGPU.memory_utilization) }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="溫度"
                        value={selectedGPU.temperature}
                        suffix="°C"
                        prefix={<FireOutlined />}
                        valueStyle={{ color: getTemperatureColor(selectedGPU.temperature) }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="風扇轉速"
                        value={selectedGPU.fan_speed}
                        suffix="RPM"
                        prefix={<CloudOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {gpuResourceUsage && (
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
                        prefix={<HddOutlined />}
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

                  {gpuResourceUsage.recommended_models && gpuResourceUsage.recommended_models.length > 0 && (
                    <>
                      <Divider />
                      <Card title="推薦模型">
                        <List
                          dataSource={gpuResourceUsage.recommended_models}
                          renderItem={(model) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<Avatar icon={<RocketOutlined />} />}
                                title={model.name}
                                description={`記憶體需求: ${model.memory_requirement}MB, 性能評分: ${model.performance_score}/10`}
                              />
                              <Tag color="blue">{model.type}</Tag>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </>
                  )}
                </Card>
              </Col>
            </Row>
          )}

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Card title="GPU 告警">
                <Table 
                  columns={alertColumns} 
                  dataSource={gpuAlerts}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="資源分配">
                <Table 
                  columns={[
                    {
                      title: '應用名稱',
                      dataIndex: 'application_name',
                      key: 'application_name',
                    },
                    {
                      title: '分配記憶體',
                      dataIndex: 'allocated_memory',
                      key: 'allocated_memory',
                      render: (value) => `${value}MB`,
                    },
                    {
                      title: '狀態',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => (
                        <Tag color={status === 'running' ? 'green' : 'orange'}>
                          {status === 'running' ? '運行中' : '已停止'}
                        </Tag>
                      ),
                    },
                  ]} 
                  dataSource={gpuResourceAllocations}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* 新增 GPU 設備模態框 */}
      <Modal
        title="新增 GPU 設備"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={createGPUDevice} layout="vertical">
          <Form.Item
            name="name"
            label="設備名稱"
            rules={[{ required: true, message: '請輸入設備名稱！' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="model"
            label="GPU 型號"
            rules={[{ required: true, message: '請輸入 GPU 型號！' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="memory"
            label="記憶體大小 (MB)"
            rules={[{ required: true, message: '請輸入記憶體大小！' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              創建
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 性能配置模態框 */}
      <Modal
        title="GPU 性能配置"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={null}
      >
        <Form form={configForm} layout="vertical">
          <Form.Item
            name="power_limit"
            label="功率限制 (W)"
          >
            <InputNumber min={1} max={500} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="temperature_limit"
            label="溫度限制 (°C)"
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="auto_fan_control"
            label="自動風扇控制"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" block>
              保存配置
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 資源分配模態框 */}
      <Modal
        title="GPU 資源分配"
        open={allocationModalVisible}
        onCancel={() => setAllocationModalVisible(false)}
        footer={null}
      >
        <Form form={allocationForm} layout="vertical">
          <Form.Item
            name="application_name"
            label="應用名稱"
            rules={[{ required: true, message: '請輸入應用名稱！' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="memory_allocation"
            label="記憶體分配 (MB)"
            rules={[{ required: true, message: '請輸入記憶體分配！' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="priority"
            label="優先級"
          >
            <Select>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" block>
              分配資源
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GPUMonitoring; 