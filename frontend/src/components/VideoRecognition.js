import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Tabs,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
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
  Steps,
  Upload,
  Collapse,
  List,
  Avatar,
  Progress,
  Alert,
  Drawer,
  Tree,
  Transfer,
  DatePicker,
  TimePicker,
  Image
} from 'antd';
import {
  VideoCameraOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SettingOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  CameraOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  CarOutlined,
  BugOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const VideoRecognition = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [models, setModels] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [results, setResults] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [streamStatus, setStreamStatus] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 使用模擬數據，因為後端可能還沒有完全設置
      setDevices([
        {
          id: 1,
          name: '生產線監控攝影機',
          device_type: 'ip_camera',
          stream_url: 'rtsp://192.168.1.100:554/stream1',
          stream_type: 'rtsp',
          resolution: '1920x1080',
          frame_rate: 30,
          bitrate: 4000,
          location: '生產線A',
          status: 'online'
        },
        {
          id: 2,
          name: '品質檢測攝影機',
          device_type: 'ip_camera',
          stream_url: 'rtsp://192.168.1.101:554/stream1',
          stream_type: 'rtsp',
          resolution: '1920x1080',
          frame_rate: 25,
          bitrate: 3000,
          location: '檢測站B',
          status: 'online'
        },
        {
          id: 3,
          name: '安全監控攝影機',
          device_type: 'ip_camera',
          stream_url: 'rtsp://192.168.1.102:554/stream1',
          stream_type: 'rtsp',
          resolution: '1280x720',
          frame_rate: 20,
          bitrate: 2000,
          location: '安全區域',
          status: 'offline'
        }
      ]);
      
      setModels([
        {
          id: 1,
          name: 'YOLO 物件偵測模型',
          model_type: 'object_detection',
          framework: 'yolo',
          classes: ['person', 'car', 'defect', 'product'],
          confidence_threshold: 0.7,
          is_active: true
        },
        {
          id: 2,
          name: '品質缺陷檢測模型',
          model_type: 'quality_inspection',
          framework: 'tensorflow',
          classes: ['scratch', 'crack', 'discoloration', 'misalignment'],
          confidence_threshold: 0.8,
          is_active: true
        }
      ]);
      
      setTasks([
        {
          id: 1,
          name: '生產線監控任務',
          device_id: 1,
          model_id: 1,
          task_type: 'real_time',
          status: 'running',
          config: { fps: 30, roi: [100, 100, 800, 600] }
        },
        {
          id: 2,
          name: '品質檢測任務',
          device_id: 2,
          model_id: 2,
          task_type: 'real_time',
          status: 'running',
          config: { fps: 25, roi: [200, 200, 700, 500] }
        },
        {
          id: 3,
          name: '安全監控任務',
          device_id: 3,
          model_id: 1,
          task_type: 'real_time',
          status: 'stopped',
          config: { fps: 20, roi: [0, 0, 1280, 720] }
        }
      ]);
      
      setAlerts([
        {
          id: 1,
          alert_type: 'quality_defect',
          alert_level: 'high',
          alert_message: '檢測到產品缺陷：刮痕',
          detected_objects: ['scratch'],
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          alert_type: 'safety_violation',
          alert_level: 'critical',
          alert_message: '檢測到未授權人員進入',
          detected_objects: ['person'],
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          alert_type: 'quality_defect',
          alert_level: 'medium',
          alert_message: '檢測到產品變色',
          detected_objects: ['discoloration'],
          created_at: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('獲取數據失敗:', error);
      message.error('獲取數據失敗');
    }
    setLoading(false);
  };

  const handleCreateDevice = () => {
    setSelectedItem(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEditDevice = (device) => {
    setSelectedItem(device);
    setModalVisible(true);
    form.setFieldsValue(device);
  };

  const handleDeleteDevice = async (deviceId) => {
    try {
      message.success('設備已刪除');
      fetchData();
    } catch (error) {
      message.error('刪除失敗');
    }
  };

  const handleSaveDevice = async (values) => {
    try {
      message.success(selectedItem ? '設備已更新' : '設備已創建');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('保存失敗');
    }
  };

  const handleStartTask = async (taskId) => {
    try {
      message.success('任務已啟動');
      fetchData();
    } catch (error) {
      message.error('啟動失敗');
    }
  };

  const handleStopTask = async (taskId) => {
    try {
      message.success('任務已停止');
      fetchData();
    } catch (error) {
      message.error('停止失敗');
    }
  };

  const deviceColumns = [
    { title: '設備名稱', dataIndex: 'name', key: 'name' },
    { title: '類型', dataIndex: 'device_type', key: 'device_type', render: (type) => (
      <Tag color={type === 'ip_camera' ? 'blue' : 'green'}>{type}</Tag>
    ) },
    { title: '位置', dataIndex: 'location', key: 'location' },
    { title: '解析度', dataIndex: 'resolution', key: 'resolution' },
    { title: '幀率', dataIndex: 'frame_rate', key: 'frame_rate', render: (fps) => `${fps} fps` },
    { title: '狀態', dataIndex: 'status', key: 'status', render: (status) => (
      <Badge status={status === 'online' ? 'success' : 'error'} text={status} />
    ) },
    { title: '操作', key: 'action', render: (_, record) => (
      <Space>
        <Button icon={<EyeOutlined />} onClick={() => handleViewStream(record)}>查看串流</Button>
        <Button icon={<SettingOutlined />} onClick={() => handleEditDevice(record)}>編輯</Button>
        <Button icon={<StopOutlined />} danger onClick={() => handleDeleteDevice(record.id)}>刪除</Button>
      </Space>
    ) }
  ];

  const taskColumns = [
    { title: '任務名稱', dataIndex: 'name', key: 'name' },
    { title: '設備', dataIndex: 'device_id', key: 'device_id', render: (deviceId) => {
      const device = devices.find(d => d.id === deviceId);
      return device ? device.name : `設備 ${deviceId}`;
    } },
    { title: '模型', dataIndex: 'model_id', key: 'model_id', render: (modelId) => {
      const model = models.find(m => m.id === modelId);
      return model ? model.name : `模型 ${modelId}`;
    } },
    { title: '類型', dataIndex: 'task_type', key: 'task_type', render: (type) => (
      <Tag color={type === 'real_time' ? 'green' : 'blue'}>{type}</Tag>
    ) },
    { title: '狀態', dataIndex: 'status', key: 'status', render: (status) => (
      <Badge status={status === 'running' ? 'processing' : 'default'} text={status} />
    ) },
    { title: '操作', key: 'action', render: (_, record) => (
      <Space>
        {record.status === 'running' ? (
          <Button icon={<PauseCircleOutlined />} onClick={() => handleStopTask(record.id)}>停止</Button>
        ) : (
          <Button icon={<PlayCircleOutlined />} onClick={() => handleStartTask(record.id)}>啟動</Button>
        )}
        <Button icon={<EyeOutlined />} onClick={() => handleViewResults(record)}>查看結果</Button>
      </Space>
    ) }
  ];

  const alertColumns = [
    { title: '警報類型', dataIndex: 'alert_type', key: 'alert_type', render: (type) => (
      <Tag color={
        type === 'quality_defect' ? 'red' :
        type === 'safety_violation' ? 'orange' :
        'blue'
      }>{type}</Tag>
    ) },
    { title: '等級', dataIndex: 'alert_level', key: 'alert_level', render: (level) => (
      <Badge status={
        level === 'critical' ? 'error' :
        level === 'high' ? 'warning' :
        'default'
      } text={level} />
    ) },
    { title: '訊息', dataIndex: 'alert_message', key: 'alert_message' },
    { title: '偵測物件', dataIndex: 'detected_objects', key: 'detected_objects', render: (objects) => (
      <Space>
        {objects.map(obj => (
          <Tag key={obj} color="blue">{obj}</Tag>
        ))}
      </Space>
    ) },
    { title: '時間', dataIndex: 'created_at', key: 'created_at', render: (time) => new Date(time).toLocaleString() },
    { title: '操作', key: 'action', render: (_, record) => (
      <Space>
        <Button icon={<EyeOutlined />} onClick={() => handleViewAlert(record)}>查看詳情</Button>
        <Button icon={<CheckCircleOutlined />} onClick={() => handleAcknowledgeAlert(record.id)}>確認</Button>
      </Space>
    ) }
  ];

  const handleViewStream = (device) => {
    message.info(`查看設備 ${device.name} 的串流`);
  };

  const handleViewResults = (task) => {
    message.info(`查看任務 ${task.name} 的結果`);
  };

  const handleViewAlert = (alert) => {
    message.info(`查看警報詳情：${alert.alert_message}`);
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      message.success('警報已確認');
      fetchData();
    } catch (error) {
      message.error('確認失敗');
    }
  };

  const tabItems = [
    {
      key: 'overview',
      label: '總覽',
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="活躍設備"
                  value={devices.filter(d => d.status === 'online').length}
                  prefix={<VideoCameraOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="運行任務"
                  value={tasks.filter(t => t.status === 'running').length}
                  prefix={<PlayCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="今日警報"
                  value={alerts.length}
                  prefix={<AlertOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="處理幀數"
                  value={12345}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Card title="即時串流狀態" extra={<Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>}>
                <List
                  dataSource={devices}
                  renderItem={device => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<VideoCameraOutlined style={{ fontSize: 24, color: device.status === 'online' ? '#52c41a' : '#ff4d4f' }} />}
                        title={device.name}
                        description={`${device.location} - ${device.resolution} @ ${device.frame_rate}fps`}
                      />
                      <div>
                        <Badge status={device.status === 'online' ? 'success' : 'error'} text={device.status} />
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="最近警報" extra={<Button icon={<EyeOutlined />}>查看全部</Button>}>
                <List
                  dataSource={alerts.slice(0, 5)}
                  renderItem={alert => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<AlertOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />}
                        title={alert.alert_message}
                        description={new Date(alert.created_at).toLocaleString()}
                      />
                      <div>
                        <Badge status={
                          alert.alert_level === 'critical' ? 'error' :
                          alert.alert_level === 'high' ? 'warning' :
                          'default'
                        } text={alert.alert_level} />
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'devices',
      label: '設備管理',
      children: (
        <Card title="影像設備" extra={<Button icon={<UploadOutlined />} onClick={handleCreateDevice}>新增設備</Button>}>
          <Table 
            dataSource={devices} 
            columns={deviceColumns} 
            rowKey="id"
            loading={loading}
          />
        </Card>
      )
    },
    {
      key: 'tasks',
      label: '辨識任務',
      children: (
        <Card title="影像辨識任務" extra={<Button icon={<UploadOutlined />}>新增任務</Button>}>
          <Table 
            dataSource={tasks} 
            columns={taskColumns} 
            rowKey="id"
            loading={loading}
          />
        </Card>
      )
    },
    {
      key: 'alerts',
      label: '警報中心',
      children: (
        <Card title="影像辨識警報" extra={<Button icon={<EyeOutlined />}>查看全部</Button>}>
          <Table 
            dataSource={alerts} 
            columns={alertColumns} 
            rowKey="id"
            loading={loading}
          />
        </Card>
      )
    },
    {
      key: 'analytics',
      label: '分析統計',
      children: (
        <div>
          <Row gutter={16}>
            <Col span={12}>
              <Card title="偵測統計">
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text type="secondary">圖表區域 - 偵測統計</Text>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="警報趨勢">
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text type="secondary">圖表區域 - 警報趨勢</Text>
                </div>
              </Card>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Card title="性能監控">
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text type="secondary">圖表區域 - 性能監控</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <VideoCameraOutlined /> 串流影像辨識
      </Title>
      <Paragraph>
        管理影像設備、配置辨識模型、監控即時串流和處理警報。
      </Paragraph>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* 設備編輯模態框 */}
      <Modal
        title={selectedItem ? "編輯設備" : "新增設備"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveDevice}
        >
          <Form.Item
            name="name"
            label="設備名稱"
            rules={[{ required: true }]}
          >
            <Input placeholder="請輸入設備名稱" />
          </Form.Item>

          <Form.Item
            name="device_type"
            label="設備類型"
            rules={[{ required: true }]}
          >
            <Select placeholder="請選擇設備類型">
              <Option value="ip_camera">IP 攝影機</Option>
              <Option value="usb_camera">USB 攝影機</Option>
              <Option value="rtsp_stream">RTSP 串流</Option>
              <Option value="file">檔案</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="stream_url"
            label="串流 URL"
            rules={[{ required: true }]}
          >
            <Input placeholder="請輸入串流 URL" />
          </Form.Item>

          <Form.Item
            name="stream_type"
            label="串流類型"
            rules={[{ required: true }]}
          >
            <Select placeholder="請選擇串流類型">
              <Option value="rtsp">RTSP</Option>
              <Option value="rtmp">RTMP</Option>
              <Option value="http">HTTP</Option>
              <Option value="file">檔案</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="resolution"
                label="解析度"
              >
                <Select placeholder="請選擇解析度">
                  <Option value="1920x1080">1920x1080</Option>
                  <Option value="1280x720">1280x720</Option>
                  <Option value="640x480">640x480</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="frame_rate"
                label="幀率"
              >
                <InputNumber min={1} max={60} placeholder="fps" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="位置"
          >
            <Input placeholder="請輸入設備位置" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="請輸入設備描述" />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="啟用設備"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VideoRecognition; 