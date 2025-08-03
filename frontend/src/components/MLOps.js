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
  RobotOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  SettingOutlined,
  HistoryOutlined,
  BarChartOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
  ApiOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Step } = Steps;

const MLOps = () => {
  const [loading, setLoading] = useState(false);
  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [trainingModalVisible, setTrainingModalVisible] = useState(false);
  const [deploymentModalVisible, setDeploymentModalVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelForm] = Form.useForm();
  const [trainingForm] = Form.useForm();
  const [deploymentForm] = Form.useForm();

  // 模型數據
  const [models, setModels] = useState([
    {
      id: 1,
      name: '設備故障預測模型',
      version: 'v2.1.0',
      status: 'deployed',
      accuracy: 94.2,
      f1_score: 0.923,
      precision: 0.918,
      recall: 0.928,
      training_status: 'completed',
      last_trained: '2024-01-15 14:30:00',
      next_training: '2024-01-22 14:30:00',
      dataset_size: '125,000',
      training_time: '2小時15分鐘',
      model_size: '45.2 MB',
      framework: 'TensorFlow',
      algorithm: 'LSTM',
      deployment_environment: 'production',
      auto_retrain: true,
      retrain_interval: '7天',
      performance_threshold: 0.85
    },
    {
      id: 2,
      name: '品質檢測模型',
      version: 'v1.8.5',
      status: 'training',
      accuracy: 96.8,
      f1_score: 0.945,
      precision: 0.952,
      recall: 0.938,
      training_status: 'in_progress',
      last_trained: '2024-01-14 09:15:00',
      next_training: '2024-01-21 09:15:00',
      dataset_size: '89,000',
      training_time: '1小時45分鐘',
      model_size: '32.1 MB',
      framework: 'PyTorch',
      algorithm: 'CNN',
      deployment_environment: 'staging',
      auto_retrain: true,
      retrain_interval: '5天',
      performance_threshold: 0.90
    },
    {
      id: 3,
      name: '能源消耗預測模型',
      version: 'v1.5.2',
      status: 'archived',
      accuracy: 91.5,
      f1_score: 0.887,
      precision: 0.892,
      recall: 0.883,
      training_status: 'failed',
      last_trained: '2024-01-10 16:20:00',
      next_training: '2024-01-17 16:20:00',
      dataset_size: '67,000',
      training_time: '3小時30分鐘',
      model_size: '28.7 MB',
      framework: 'Scikit-learn',
      algorithm: 'Random Forest',
      deployment_environment: 'development',
      auto_retrain: false,
      retrain_interval: '14天',
      performance_threshold: 0.80
    }
  ]);

  // 訓練任務數據
  const [trainingJobs, setTrainingJobs] = useState([
    {
      id: 1,
      model_name: '設備故障預測模型',
      status: 'completed',
      start_time: '2024-01-15 12:00:00',
      end_time: '2024-01-15 14:15:00',
      duration: '2小時15分鐘',
      accuracy: 94.2,
      f1_score: 0.923,
      dataset_size: '125,000',
      gpu_usage: '85%',
      memory_usage: '12.5 GB',
      logs: '訓練完成，模型效能提升 2.3%'
    },
    {
      id: 2,
      model_name: '品質檢測模型',
      status: 'in_progress',
      start_time: '2024-01-15 09:00:00',
      end_time: null,
      duration: '1小時30分鐘',
      accuracy: null,
      f1_score: null,
      dataset_size: '89,000',
      gpu_usage: '92%',
      memory_usage: '15.2 GB',
      logs: '正在訓練第 45 個 epoch...'
    }
  ]);

  // 部署環境數據
  const [deployments, setDeployments] = useState([
    {
      id: 1,
      model_name: '設備故障預測模型',
      environment: 'production',
      version: 'v2.1.0',
      status: 'active',
      deployment_time: '2024-01-15 15:00:00',
      requests_per_minute: 245,
      average_response_time: '120ms',
      error_rate: '0.2%',
      cpu_usage: '35%',
      memory_usage: '2.1 GB',
      endpoint: '/api/v1/predict/fault'
    },
    {
      id: 2,
      model_name: '品質檢測模型',
      environment: 'staging',
      version: 'v1.8.5',
      status: 'testing',
      deployment_time: '2024-01-14 18:30:00',
      requests_per_minute: 89,
      average_response_time: '180ms',
      error_rate: '1.5%',
      cpu_usage: '28%',
      memory_usage: '1.8 GB',
      endpoint: '/api/v1/predict/quality'
    }
  ]);

  const handleCreateModel = async (values) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newModel = {
        id: models.length + 1,
        ...values,
        version: 'v1.0.0',
        status: 'draft',
        accuracy: 0,
        f1_score: 0,
        precision: 0,
        recall: 0,
        training_status: 'not_started',
        last_trained: null,
        next_training: null,
        dataset_size: '0',
        training_time: '0分鐘',
        model_size: '0 MB'
      };
      
      setModels([newModel, ...models]);
      message.success('模型創建成功');
      setModelModalVisible(false);
      modelForm.resetFields();
    } catch (error) {
      message.error('創建失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTraining = async (values) => {
    try {
      setLoading(true);
      // 模擬訓練開始
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newJob = {
        id: trainingJobs.length + 1,
        model_name: values.model_name,
        status: 'in_progress',
        start_time: new Date().toLocaleString(),
        end_time: null,
        duration: '0分鐘',
        accuracy: null,
        f1_score: null,
        dataset_size: values.dataset_size,
        gpu_usage: '0%',
        memory_usage: '0 GB',
        logs: '開始訓練...'
      };
      
      setTrainingJobs([newJob, ...trainingJobs]);
      message.success('訓練任務已啟動');
      setTrainingModalVisible(false);
      trainingForm.resetFields();
    } catch (error) {
      message.error('啟動訓練失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleDeployModel = async (values) => {
    try {
      setLoading(true);
      // 模擬部署
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDeployment = {
        id: deployments.length + 1,
        model_name: values.model_name,
        environment: values.environment,
        version: values.version,
        status: 'active',
        deployment_time: new Date().toLocaleString(),
        requests_per_minute: 0,
        average_response_time: '0ms',
        error_rate: '0%',
        cpu_usage: '0%',
        memory_usage: '0 GB',
        endpoint: `/api/v1/predict/${values.model_name.toLowerCase().replace(/\s+/g, '-')}`
      };
      
      setDeployments([newDeployment, ...deployments]);
      message.success('模型部署成功');
      setDeploymentModalVisible(false);
      deploymentForm.resetFields();
    } catch (error) {
      message.error('部署失敗');
    } finally {
      setLoading(false);
    }
  };

  const modelColumns = [
    {
      title: '模型名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical">
          <Text strong>{text}</Text>
          <Text type="secondary">v{record.version}</Text>
        </Space>
      )
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'deployed' ? 'green' : 
          status === 'training' ? 'orange' : 
          status === 'archived' ? 'red' : 'blue'
        }>
          {status === 'deployed' ? '已部署' : 
           status === 'training' ? '訓練中' : 
           status === 'archived' ? '已封存' : '草稿'}
        </Tag>
      )
    },
    {
      title: '效能指標',
      key: 'performance',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text>準確率: {record.accuracy}%</Text>
          <Text>F1 分數: {record.f1_score}</Text>
          <Text>精確率: {record.precision}</Text>
          <Text>召回率: {record.recall}</Text>
        </Space>
      )
    },
    {
      title: '訓練狀態',
      dataIndex: 'training_status',
      key: 'training_status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' : 
          status === 'in_progress' ? 'orange' : 
          status === 'failed' ? 'red' : 'default'
        }>
          {status === 'completed' ? '已完成' : 
           status === 'in_progress' ? '進行中' : 
           status === 'failed' ? '失敗' : '未開始'}
        </Tag>
      )
    },
    {
      title: '自動重訓',
      dataIndex: 'auto_retrain',
      key: 'auto_retrain',
      render: (auto) => (
        <Switch 
          checked={auto} 
          disabled 
          size="small"
        />
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<PlayCircleOutlined />}
            onClick={() => setTrainingModalVisible(true)}
          >
            訓練
          </Button>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => setSelectedModel(record)}
          >
            詳情
          </Button>
          <Button 
            size="small" 
            icon={<EditOutlined />}
          >
            編輯
          </Button>
        </Space>
      )
    }
  ];

  const trainingColumns = [
    {
      title: '模型名稱',
      dataIndex: 'model_name',
      key: 'model_name'
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' : 
          status === 'in_progress' ? 'orange' : 
          status === 'failed' ? 'red' : 'default'
        }>
          {status === 'completed' ? '已完成' : 
           status === 'in_progress' ? '進行中' : 
           status === 'failed' ? '失敗' : '等待中'}
        </Tag>
      )
    },
    {
      title: '開始時間',
      dataIndex: 'start_time',
      key: 'start_time'
    },
    {
      title: '持續時間',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: 'GPU 使用率',
      dataIndex: 'gpu_usage',
      key: 'gpu_usage',
      render: (usage) => (
        <Progress 
          percent={parseInt(usage)} 
          size="small" 
          status={parseInt(usage) > 90 ? 'exception' : 'normal'}
        />
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'in_progress' && (
            <Button 
              danger 
              size="small" 
              icon={<StopOutlined />}
            >
              停止
            </Button>
          )}
          <Button 
            size="small" 
            icon={<EyeOutlined />}
          >
            日誌
          </Button>
        </Space>
      )
    }
  ];

  const deploymentColumns = [
    {
      title: '模型名稱',
      dataIndex: 'model_name',
      key: 'model_name'
    },
    {
      title: '環境',
      dataIndex: 'environment',
      key: 'environment',
      render: (env) => (
        <Tag color={
          env === 'production' ? 'red' : 
          env === 'staging' ? 'orange' : 'blue'
        }>
          {env}
        </Tag>
      )
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version'
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'active' ? 'green' : 
          status === 'testing' ? 'orange' : 'red'
        }>
          {status === 'active' ? '運行中' : 
           status === 'testing' ? '測試中' : '停止'}
        </Tag>
      )
    },
    {
      title: '請求/分鐘',
      dataIndex: 'requests_per_minute',
      key: 'requests_per_minute'
    },
    {
      title: '平均回應時間',
      dataIndex: 'average_response_time',
      key: 'average_response_time'
    },
    {
      title: '錯誤率',
      dataIndex: 'error_rate',
      key: 'error_rate',
      render: (rate) => (
        <Text type={parseFloat(rate) > 5 ? 'danger' : 'secondary'}>
          {rate}
        </Text>
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
          >
            監控
          </Button>
          <Button 
            size="small" 
            icon={<SettingOutlined />}
          >
            設定
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <RobotOutlined /> MLOps - AI 模型訓練管理
      </Title>

      <Row gutter={[16, 16]}>
        {/* 模型概覽 */}
        <Col span={24}>
          <Card 
            title="模型概覽"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setModelModalVisible(true)}
              >
                新增模型
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="總模型數"
                  value={models.length}
                  prefix={<RobotOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="已部署"
                  value={models.filter(m => m.status === 'deployed').length}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="訓練中"
                  value={models.filter(m => m.status === 'training').length}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<FireOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="平均準確率"
                  value={models.reduce((acc, m) => acc + m.accuracy, 0) / models.length}
                  suffix="%"
                  precision={1}
                  prefix={<TrophyOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 模型列表 */}
        <Col span={24}>
          <Card title="模型管理">
            <Table
              dataSource={models}
              columns={modelColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>

        {/* 訓練任務 */}
        <Col span={12}>
          <Card 
            title="訓練任務"
            extra={
              <Button 
                type="primary" 
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => setTrainingModalVisible(true)}
              >
                開始訓練
              </Button>
            }
          >
            <Table
              dataSource={trainingJobs}
              columns={trainingColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>

        {/* 部署管理 */}
        <Col span={12}>
          <Card 
            title="部署管理"
            extra={
              <Button 
                type="primary" 
                size="small"
                icon={<CloudUploadOutlined />}
                onClick={() => setDeploymentModalVisible(true)}
              >
                部署模型
              </Button>
            }
          >
            <Table
              dataSource={deployments}
              columns={deploymentColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 新增模型模態框 */}
      <Modal
        title="新增模型"
        open={modelModalVisible}
        onCancel={() => setModelModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={modelForm}
          onFinish={handleCreateModel}
          layout="vertical"
        >
          <Form.Item
            label="模型名稱"
            name="name"
            rules={[{ required: true, message: '請輸入模型名稱' }]}
          >
            <Input placeholder="請輸入模型名稱" />
          </Form.Item>

          <Form.Item
            label="框架"
            name="framework"
            rules={[{ required: true, message: '請選擇框架' }]}
          >
            <Select placeholder="請選擇框架">
              <Option value="TensorFlow">TensorFlow</Option>
              <Option value="PyTorch">PyTorch</Option>
              <Option value="Scikit-learn">Scikit-learn</Option>
              <Option value="XGBoost">XGBoost</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="演算法"
            name="algorithm"
            rules={[{ required: true, message: '請選擇演算法' }]}
          >
            <Select placeholder="請選擇演算法">
              <Option value="LSTM">LSTM</Option>
              <Option value="CNN">CNN</Option>
              <Option value="Random Forest">Random Forest</Option>
              <Option value="SVM">SVM</Option>
              <Option value="XGBoost">XGBoost</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="部署環境"
            name="deployment_environment"
            rules={[{ required: true, message: '請選擇部署環境' }]}
          >
            <Select placeholder="請選擇部署環境">
              <Option value="development">開發環境</Option>
              <Option value="staging">測試環境</Option>
              <Option value="production">生產環境</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="自動重訓"
            name="auto_retrain"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="重訓間隔"
            name="retrain_interval"
          >
            <Select placeholder="請選擇重訓間隔">
              <Option value="1天">1天</Option>
              <Option value="3天">3天</Option>
              <Option value="7天">7天</Option>
              <Option value="14天">14天</Option>
              <Option value="30天">30天</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="效能閾值"
            name="performance_threshold"
          >
            <Slider
              min={0}
              max={1}
              step={0.01}
              defaultValue={0.85}
              marks={{
                0: '0',
                0.5: '0.5',
                1: '1'
              }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
              >
                創建模型
              </Button>
              <Button onClick={() => setModelModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 開始訓練模態框 */}
      <Modal
        title="開始訓練"
        open={trainingModalVisible}
        onCancel={() => setTrainingModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={trainingForm}
          onFinish={handleStartTraining}
          layout="vertical"
        >
          <Form.Item
            label="選擇模型"
            name="model_name"
            rules={[{ required: true, message: '請選擇模型' }]}
          >
            <Select placeholder="請選擇要訓練的模型">
              {models.map(model => (
                <Option key={model.id} value={model.name}>
                  {model.name} (v{model.version})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="數據集大小"
            name="dataset_size"
            rules={[{ required: true, message: '請輸入數據集大小' }]}
          >
            <Input placeholder="例如：100,000" />
          </Form.Item>

          <Form.Item
            label="訓練參數"
            name="training_params"
          >
            <TextArea 
              rows={4} 
              placeholder="請輸入訓練參數 (JSON 格式)"
              defaultValue='{"epochs": 100, "batch_size": 32, "learning_rate": 0.001}'
            />
          </Form.Item>

          <Form.Item
            label="GPU 資源"
            name="gpu_resources"
          >
            <Select placeholder="請選擇 GPU 資源">
              <Option value="1">1 GPU</Option>
              <Option value="2">2 GPU</Option>
              <Option value="4">4 GPU</Option>
              <Option value="8">8 GPU</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<PlayCircleOutlined />}
              >
                開始訓練
              </Button>
              <Button onClick={() => setTrainingModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 部署模型模態框 */}
      <Modal
        title="部署模型"
        open={deploymentModalVisible}
        onCancel={() => setDeploymentModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={deploymentForm}
          onFinish={handleDeployModel}
          layout="vertical"
        >
          <Form.Item
            label="選擇模型"
            name="model_name"
            rules={[{ required: true, message: '請選擇模型' }]}
          >
            <Select placeholder="請選擇要部署的模型">
              {models.map(model => (
                <Option key={model.id} value={model.name}>
                  {model.name} (v{model.version})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="部署環境"
            name="environment"
            rules={[{ required: true, message: '請選擇部署環境' }]}
          >
            <Select placeholder="請選擇部署環境">
              <Option value="development">開發環境</Option>
              <Option value="staging">測試環境</Option>
              <Option value="production">生產環境</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="版本"
            name="version"
            rules={[{ required: true, message: '請輸入版本號' }]}
          >
            <Input placeholder="例如：v1.0.0" />
          </Form.Item>

          <Form.Item
            label="資源配置"
            name="resources"
          >
            <Select placeholder="請選擇資源配置">
              <Option value="small">小型 (1 CPU, 2GB RAM)</Option>
              <Option value="medium">中型 (2 CPU, 4GB RAM)</Option>
              <Option value="large">大型 (4 CPU, 8GB RAM)</Option>
              <Option value="xlarge">超大型 (8 CPU, 16GB RAM)</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<CloudUploadOutlined />}
              >
                部署模型
              </Button>
              <Button onClick={() => setDeploymentModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 模型詳情抽屜 */}
      <Drawer
        title="模型詳情"
        placement="right"
        width={600}
        open={selectedModel !== null}
        onClose={() => setSelectedModel(null)}
      >
        {selectedModel && (
          <div>
            <Descriptions title="基本資訊" column={1}>
              <Descriptions.Item label="模型名稱">{selectedModel.name}</Descriptions.Item>
              <Descriptions.Item label="版本">{selectedModel.version}</Descriptions.Item>
              <Descriptions.Item label="框架">{selectedModel.framework}</Descriptions.Item>
              <Descriptions.Item label="演算法">{selectedModel.algorithm}</Descriptions.Item>
              <Descriptions.Item label="模型大小">{selectedModel.model_size}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="效能指標" column={1}>
              <Descriptions.Item label="準確率">{selectedModel.accuracy}%</Descriptions.Item>
              <Descriptions.Item label="F1 分數">{selectedModel.f1_score}</Descriptions.Item>
              <Descriptions.Item label="精確率">{selectedModel.precision}</Descriptions.Item>
              <Descriptions.Item label="召回率">{selectedModel.recall}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="訓練資訊" column={1}>
              <Descriptions.Item label="最後訓練時間">{selectedModel.last_trained}</Descriptions.Item>
              <Descriptions.Item label="下次訓練時間">{selectedModel.next_training}</Descriptions.Item>
              <Descriptions.Item label="數據集大小">{selectedModel.dataset_size}</Descriptions.Item>
              <Descriptions.Item label="訓練時間">{selectedModel.training_time}</Descriptions.Item>
              <Descriptions.Item label="自動重訓">
                <Switch checked={selectedModel.auto_retrain} disabled />
              </Descriptions.Item>
              <Descriptions.Item label="重訓間隔">{selectedModel.retrain_interval}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MLOps; 