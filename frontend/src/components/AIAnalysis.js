import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Alert,
  Progress,
  Select,
  Button,
  Space,
  Tabs,
  Table,
  Tag,
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
  Steps,
  Upload,
  Collapse,
  List,
  Avatar,
  Rate
} from 'antd';
import {
  RobotOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  BarChartOutlined,
  LineChartOutlined,
  ExperimentOutlined,
  DeploymentUnitOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  DatabaseOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  SafetyCertificateOutlined,
  MonitorOutlined,
  CloudServerOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Step } = Steps;
const { Panel } = Collapse;

const AIAnalysis = () => {
  const [devices, setDevices] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  
  // 新增狀態
  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [trainingModalVisible, setTrainingModalVisible] = useState(false);
  const [deploymentModalVisible, setDeploymentModalVisible] = useState(false);
  const [preprocessingModalVisible, setPreprocessingModalVisible] = useState(false);
  const [explainabilityModalVisible, setExplainabilityModalVisible] = useState(false);
  const [anomalyDetections, setAnomalyDetections] = useState([]);
  const [anomalyAlerts, setAnomalyAlerts] = useState([]);
  const [modelTrainings, setModelTrainings] = useState([]);
  const [modelOperations, setModelOperations] = useState([]);
  const [modelVersions, setModelVersions] = useState([]);
  const [dataPreprocessing, setDataPreprocessing] = useState([]);
  const [modelExplainability, setModelExplainability] = useState(null);
  const [form] = Form.useForm();
  const [trainingForm] = Form.useForm();
  const [deploymentForm] = Form.useForm();
  const [preprocessingForm] = Form.useForm();
  const [explainabilityForm] = Form.useForm();

  useEffect(() => {
    loadDevices();
    loadModels();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      loadAIResult();
      loadAnomalyDetections();
      loadAnomalyAlerts();
    }
  }, [selectedDevice]);

  useEffect(() => {
    if (selectedModel) {
      loadModelTrainings();
      loadModelOperations();
      loadModelVersions();
      loadDataPreprocessing();
    }
  }, [selectedModel]);

  const loadDevices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/devices/');
      setDevices(response.data);
    } catch (error) {
      message.error('載入設備失敗');
    }
  };

  const loadModels = async () => {
    try {
      const response = await axios.get('http://localhost:8000/ai/models/');
      setModels(response.data);
    } catch (error) {
      message.error('載入 AI 模型失敗');
    }
  };

  const loadAIResult = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/ai/analysis/', {
        device_id: selectedDevice,
        include_explanation: true
      });
      setAiResult(response.data);
    } catch (error) {
      message.error('載入 AI 分析失敗');
    } finally {
      setLoading(false);
    }
  };

  const loadAnomalyDetections = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/ai/detection/?device_id=${selectedDevice}&limit=50`);
      setAnomalyDetections(response.data);
    } catch (error) {
      message.error('載入異常偵測記錄失敗');
    }
  };

  const loadAnomalyAlerts = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/ai/alerts/?device_id=${selectedDevice}&limit=50`);
      setAnomalyAlerts(response.data);
    } catch (error) {
      message.error('載入異常告警失敗');
    }
  };

  const loadModelTrainings = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/ai/training/?model_id=${selectedModel}`);
      setModelTrainings(response.data);
    } catch (error) {
      message.error('載入模型訓練記錄失敗');
    }
  };

  const loadModelOperations = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/ai/operations/?model_id=${selectedModel}`);
      setModelOperations(response.data);
    } catch (error) {
      message.error('載入模型營運記錄失敗');
    }
  };

  const loadModelVersions = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/ai/versions/${selectedModel}`);
      setModelVersions(response.data);
    } catch (error) {
      message.error('載入模型版本失敗');
    }
  };

  const loadDataPreprocessing = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/ai/preprocessing/${selectedModel}`);
      setDataPreprocessing(response.data);
    } catch (error) {
      message.error('載入資料預處理配置失敗');
    }
  };

  const getAnomalyLevel = (score) => {
    if (score < 30) return { level: 'normal', color: '#52c41a', text: '正常' };
    if (score < 50) return { level: 'warning', color: '#faad14', text: '輕微異常' };
    if (score < 70) return { level: 'error', color: '#ff4d4f', text: '異常' };
    return { level: 'critical', color: '#cf1322', text: '嚴重異常' };
  };

  const createModel = async (values) => {
    try {
      await axios.post('http://localhost:8000/ai/models/', values);
      message.success('AI 模型創建成功');
      setModelModalVisible(false);
      form.resetFields();
      loadModels();
    } catch (error) {
      message.error('創建模型失敗');
    }
  };

  const trainModel = async (values) => {
    try {
      const response = await axios.post('http://localhost:8000/ai/train/', {
        model_id: selectedModel,
        training_config: values.training_config,
        data_config: values.data_config
      });
      message.success('模型訓練啟動成功');
      setTrainingModalVisible(false);
      trainingForm.resetFields();
      loadModelTrainings();
    } catch (error) {
      message.error('啟動訓練失敗');
    }
  };

  const deployModel = async (values) => {
    try {
      await axios.post('http://localhost:8000/ai/deploy/', {
        model_id: selectedModel,
        version_id: values.version_id,
        deployment_config: values.deployment_config
      });
      message.success('模型部署成功');
      setDeploymentModalVisible(false);
      deploymentForm.resetFields();
      loadModelVersions();
    } catch (error) {
      message.error('部署失敗');
    }
  };

  const createPreprocessing = async (values) => {
    try {
      await axios.post('http://localhost:8000/ai/preprocessing/', {
        ...values,
        model_id: selectedModel
      });
      message.success('資料預處理配置創建成功');
      setPreprocessingModalVisible(false);
      preprocessingForm.resetFields();
      loadDataPreprocessing();
    } catch (error) {
      message.error('創建預處理配置失敗');
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await axios.patch(`http://localhost:8000/ai/alerts/${alertId}/acknowledge`);
      message.success('告警已確認');
      loadAnomalyAlerts();
    } catch (error) {
      message.error('確認告警失敗');
    }
  };

  const anomalyDetectionColumns = [
    {
      title: '偵測時間',
      dataIndex: 'detection_time',
      key: 'detection_time',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '異常分數',
      dataIndex: 'anomaly_score',
      key: 'anomaly_score',
      render: (score) => (
        <Tag color={getAnomalyLevel(score).color}>
          {score.toFixed(2)}
        </Tag>
      ),
    },
    {
      title: '是否異常',
      dataIndex: 'is_anomaly',
      key: 'is_anomaly',
      render: (isAnomaly) => (
        <Badge 
          status={isAnomaly ? 'error' : 'success'} 
          text={isAnomaly ? '是' : '否'} 
        />
      ),
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence) => `${(confidence * 100).toFixed(1)}%`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => {
            setModelExplainability(record);
            setExplainabilityModalVisible(true);
          }}
        >
          查看解釋
        </Button>
      ),
    },
  ];

  const anomalyAlertColumns = [
    {
      title: '告警時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '告警等級',
      dataIndex: 'alert_level',
      key: 'alert_level',
      render: (level) => {
        const colors = {
          low: 'green',
          medium: 'orange',
          high: 'red',
          critical: 'purple'
        };
        return <Tag color={colors[level]}>{level.toUpperCase()}</Tag>;
      },
    },
    {
      title: '告警訊息',
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
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              Modal.info({
                title: '建議行動',
                content: (
                  <div>
                    {record.recommended_actions?.map((action, index) => (
                      <p key={index}>• {action}</p>
                    ))}
                  </div>
                ),
              });
            }}
          >
            查看建議
          </Button>
          {!record.is_acknowledged && (
            <Button 
              size="small" 
              type="primary"
              onClick={() => acknowledgeAlert(record.id)}
            >
              確認
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const modelTrainingColumns = [
    {
      title: '訓練時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '狀態',
      dataIndex: 'training_status',
      key: 'training_status',
      render: (status) => {
        const colors = {
          running: 'processing',
          completed: 'success',
          failed: 'error'
        };
        return <Badge status={colors[status]} text={status} />;
      },
    },
    {
      title: '準確率',
      dataIndex: 'final_accuracy',
      key: 'final_accuracy',
      render: (accuracy) => accuracy ? `${(accuracy * 100).toFixed(1)}%` : '-',
    },
    {
      title: '訓練資料大小',
      dataIndex: 'training_data_size',
      key: 'training_data_size',
    },
    {
      title: '訓練時長',
      dataIndex: 'training_duration',
      key: 'training_duration',
      render: (duration) => duration ? `${duration.toFixed(1)}s` : '-',
    },
  ];

  const modelVersionColumns = [
    {
      title: '版本號',
      dataIndex: 'version_number',
      key: 'version_number',
      render: (version) => <Text code>{version}</Text>,
    },
    {
      title: '部署狀態',
      dataIndex: 'is_deployed',
      key: 'is_deployed',
      render: (deployed) => (
        <Badge 
          status={deployed ? 'success' : 'default'} 
          text={deployed ? '已部署' : '未部署'} 
        />
      ),
    },
    {
      title: '性能指標',
      dataIndex: 'performance_metrics',
      key: 'performance_metrics',
      render: (metrics) => (
        <div>
          <div>準確率: {metrics?.accuracy ? `${(metrics.accuracy * 100).toFixed(1)}%` : '-'}</div>
          <div>F1: {metrics?.f1_score ? metrics.f1_score.toFixed(3) : '-'}</div>
        </div>
      ),
    },
    {
      title: '創建時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              Modal.info({
                title: '變更日誌',
                content: record.change_log,
              });
            }}
          >
            查看日誌
          </Button>
          {!record.is_deployed && (
            <Button 
              size="small" 
              type="primary"
              icon={<DeploymentUnitOutlined />}
              onClick={() => {
                deploymentForm.setFieldsValue({ version_id: record.id });
                setDeploymentModalVisible(true);
              }}
            >
              部署
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const modelOperationsColumns = [
    {
      title: '操作時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '操作類型',
      dataIndex: 'operation_type',
      key: 'operation_type',
      render: (type) => {
        const colors = {
          retrain: 'blue',
          update: 'green',
          deploy: 'orange',
          rollback: 'red'
        };
        return <Tag color={colors[type]}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: '狀態',
      dataIndex: 'operation_status',
      key: 'operation_status',
      render: (status) => {
        const colors = {
          pending: 'default',
          running: 'processing',
          completed: 'success',
          failed: 'error'
        };
        return <Badge status={colors[status]} text={status} />;
      },
    },
    {
      title: '觸發條件',
      dataIndex: 'retraining_trigger',
      key: 'retraining_trigger',
    },
    {
      title: '性能指標',
      dataIndex: 'performance_metrics',
      key: 'performance_metrics',
      render: (metrics) => (
        <div>
          <div>準確率: {metrics?.accuracy ? `${(metrics.accuracy * 100).toFixed(1)}%` : '-'}</div>
          <div>漂移分數: {metrics?.drift_score ? metrics.drift_score.toFixed(3) : '-'}</div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <RobotOutlined />
                <span>AI 異常偵測系統</span>
              </Space>
            }
            extra={
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={() => {
                    loadDevices();
                    loadModels();
                    if (selectedDevice) loadAIResult();
                  }}
                >
                  重新整理
                </Button>
                <Button 
                  type="primary" 
                  icon={<SettingOutlined />}
                  onClick={() => setModelModalVisible(true)}
                >
                  新增模型
                </Button>
              </Space>
            }
          >
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Statistic
                  title="總設備數"
                  value={devices.length}
                  prefix={<MonitorOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="AI 模型數"
                  value={models.length}
                  prefix={<RobotOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="異常偵測數"
                  value={anomalyDetections.length}
                  prefix={<WarningOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="未確認告警"
                  value={anomalyAlerts.filter(a => !a.is_acknowledged).length}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Select
                  placeholder="選擇設備進行 AI 分析"
                  style={{ width: '100%' }}
                  onChange={setSelectedDevice}
                  value={selectedDevice}
                >
                  {devices.map(device => (
                    <Option key={device.id} value={device.id}>
                      {device.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={12}>
                <Select
                  placeholder="選擇 AI 模型"
                  style={{ width: '100%' }}
                  onChange={setSelectedModel}
                  value={selectedModel}
                >
                  {models.map(model => (
                    <Option key={model.id} value={model.id}>
                      {model.name} ({model.model_type})
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              {/* 即時異常偵測 */}
              <TabPane tab="即時異常偵測" key="1">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    {aiResult && (
                      <Card title="AI 分析結果" loading={loading}>
                        <Row gutter={16}>
                          <Col span={6}>
                            <Statistic
                              title="異常分數"
                              value={aiResult.anomaly_score}
                              prefix={<RobotOutlined />}
                              valueStyle={{ 
                                color: getAnomalyLevel(aiResult.anomaly_score).color,
                                fontSize: '24px'
                              }}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic
                              title="最新數值"
                              value={aiResult.latest_value}
                              prefix={<CheckCircleOutlined />}
                              valueStyle={{ color: '#1890ff' }}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic
                              title="平均值"
                              value={aiResult.mean_value}
                              prefix={<ExclamationCircleOutlined />}
                              valueStyle={{ color: '#722ed1' }}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic
                              title="置信度"
                              value={aiResult.confidence}
                              suffix="%"
                              prefix={<SafetyCertificateOutlined />}
                              valueStyle={{ color: '#52c41a' }}
                            />
                          </Col>
                        </Row>

                        <div style={{ marginTop: 24 }}>
                          <Alert
                            message={aiResult.advice}
                            type={getAnomalyLevel(aiResult.anomaly_score).level}
                            showIcon
                            icon={<WarningOutlined />}
                            style={{ marginBottom: 16 }}
                          />

                          <div style={{ marginTop: 16 }}>
                            <h4>異常程度</h4>
                            <Progress
                              percent={Math.min(aiResult.anomaly_score, 100)}
                              strokeColor={getAnomalyLevel(aiResult.anomaly_score).color}
                              format={() => getAnomalyLevel(aiResult.anomaly_score).text}
                            />
                          </div>
                        </div>
                      </Card>
                    )}
                  </Col>
                </Row>
              </TabPane>

              {/* 資料準備與前處理 */}
              <TabPane tab="資料準備與前處理" key="2">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Card 
                      title="資料預處理配置"
                      extra={
                        <Button 
                          type="primary" 
                          icon={<ToolOutlined />}
                          onClick={() => setPreprocessingModalVisible(true)}
                        >
                          新增預處理
                        </Button>
                      }
                    >
                      <List
                        dataSource={dataPreprocessing}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<DatabaseOutlined />}
                              title={`${item.preprocessing_type} 預處理`}
                              description={`配置: ${JSON.stringify(item.config)}`}
                            />
                            <Tag color={item.is_active ? 'green' : 'red'}>
                              {item.is_active ? '啟用' : '停用'}
                            </Tag>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              {/* 模型訓練與管理 */}
              <TabPane tab="模型訓練與管理" key="3">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Card 
                      title="模型訓練記錄"
                      extra={
                        <Button 
                          type="primary" 
                          icon={<PlayCircleOutlined />}
                          onClick={() => setTrainingModalVisible(true)}
                        >
                          啟動訓練
                        </Button>
                      }
                    >
                      <Table
                        dataSource={modelTrainings}
                        columns={modelTrainingColumns}
                        rowKey="id"
                        size="small"
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              {/* 異常告警與行動建議 */}
              <TabPane tab="異常告警與行動建議" key="4">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Card title="異常告警">
                      <Table
                        dataSource={anomalyAlerts}
                        columns={anomalyAlertColumns}
                        rowKey="id"
                        size="small"
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              {/* 歷史分析與模型可解釋性 */}
              <TabPane tab="歷史分析與模型可解釋性" key="5">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card title="異常偵測歷史">
                      <Table
                        dataSource={anomalyDetections}
                        columns={anomalyDetectionColumns}
                        rowKey="id"
                        size="small"
                        pagination={{ pageSize: 10 }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="模型可解釋性">
                      <div style={{ padding: 16, background: '#f6ffed', borderRadius: 6 }}>
                        <Paragraph>
                          <Text strong>特徵重要性分析</Text>
                        </Paragraph>
                        <Paragraph>
                          <Text strong>SHAP 值分析</Text>
                        </Paragraph>
                        <Paragraph>
                          <Text strong>LIME 解釋</Text>
                        </Paragraph>
                        <Paragraph>
                          <Text strong>決策路徑分析</Text>
                        </Paragraph>
                        <Button 
                          type="primary" 
                          icon={<EyeOutlined />}
                          onClick={() => setExplainabilityModalVisible(true)}
                        >
                          查看詳細解釋
                        </Button>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              {/* AI 模型營運與調整 */}
              <TabPane tab="AI 模型營運與調整" key="6">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card title="模型版本管理">
                      <Table
                        dataSource={modelVersions}
                        columns={modelVersionColumns}
                        rowKey="id"
                        size="small"
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="模型營運記錄">
                      <Table
                        dataSource={modelOperations}
                        columns={modelOperationsColumns}
                        rowKey="id"
                        size="small"
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* 新增模型模態框 */}
      <Modal
        title="新增 AI 模型"
        open={modelModalVisible}
        onCancel={() => setModelModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={createModel} layout="vertical">
          <Form.Item
            label="模型名稱"
            name="name"
            rules={[{ required: true, message: '請輸入模型名稱' }]}
          >
            <Input placeholder="例如: 設備異常偵測模型" />
          </Form.Item>

          <Form.Item
            label="模型類型"
            name="model_type"
            rules={[{ required: true, message: '請選擇模型類型' }]}
          >
            <Select placeholder="選擇模型類型">
              <Option value="isolation_forest">Isolation Forest</Option>
              <Option value="autoencoder">Autoencoder</Option>
              <Option value="lstm">LSTM</Option>
              <Option value="random_forest">Random Forest</Option>
              <Option value="svm">SVM</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="關聯設備"
            name="device_id"
            rules={[{ required: true, message: '請選擇設備' }]}
          >
            <Select placeholder="選擇設備">
              {devices.map(device => (
                <Option key={device.id} value={device.id}>
                  {device.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="模型配置"
            name="model_config"
            initialValue={{}}
          >
            <TextArea rows={4} placeholder="JSON 格式的模型配置" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                創建模型
              </Button>
              <Button onClick={() => setModelModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 模型訓練模態框 */}
      <Modal
        title="啟動模型訓練"
        open={trainingModalVisible}
        onCancel={() => setTrainingModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={trainingForm} onFinish={trainModel} layout="vertical">
          <Form.Item
            label="訓練配置"
            name="training_config"
            initialValue={{}}
          >
            <TextArea rows={4} placeholder="JSON 格式的訓練配置" />
          </Form.Item>

          <Form.Item
            label="資料配置"
            name="data_config"
            initialValue={{}}
          >
            <TextArea rows={4} placeholder="JSON 格式的資料配置" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                啟動訓練
              </Button>
              <Button onClick={() => setTrainingModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 模型部署模態框 */}
      <Modal
        title="部署模型"
        open={deploymentModalVisible}
        onCancel={() => setDeploymentModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={deploymentForm} onFinish={deployModel} layout="vertical">
          <Form.Item
            label="版本"
            name="version_id"
            rules={[{ required: true, message: '請選擇版本' }]}
          >
            <Select placeholder="選擇要部署的版本">
              {modelVersions.map(version => (
                <Option key={version.id} value={version.id}>
                  {version.version_number}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="部署配置"
            name="deployment_config"
            initialValue={{}}
          >
            <TextArea rows={4} placeholder="JSON 格式的部署配置" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                部署模型
              </Button>
              <Button onClick={() => setDeploymentModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 資料預處理模態框 */}
      <Modal
        title="新增資料預處理"
        open={preprocessingModalVisible}
        onCancel={() => setPreprocessingModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={preprocessingForm} onFinish={createPreprocessing} layout="vertical">
          <Form.Item
            label="預處理類型"
            name="preprocessing_type"
            rules={[{ required: true, message: '請選擇預處理類型' }]}
          >
            <Select placeholder="選擇預處理類型">
              <Option value="normalization">標準化</Option>
              <Option value="standardization">正規化</Option>
              <Option value="scaling">縮放</Option>
              <Option value="encoding">編碼</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="配置"
            name="config"
            initialValue={{}}
          >
            <TextArea rows={4} placeholder="JSON 格式的預處理配置" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                創建預處理
              </Button>
              <Button onClick={() => setPreprocessingModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 模型可解釋性模態框 */}
      <Modal
        title="模型可解釋性分析"
        open={explainabilityModalVisible}
        onCancel={() => setExplainabilityModalVisible(false)}
        footer={null}
        width={800}
      >
        {modelExplainability && (
          <div>
            <Descriptions title="特徵重要性" bordered>
              <Descriptions.Item label="特徵1" span={3}>0.25</Descriptions.Item>
              <Descriptions.Item label="特徵2" span={3}>0.18</Descriptions.Item>
              <Descriptions.Item label="特徵3" span={3}>0.15</Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Card title="SHAP 值分析" size="small">
              <Paragraph>
                此分析顯示了各個特徵對預測結果的貢獻度。
              </Paragraph>
            </Card>
            
            <Divider />
            
            <Card title="LIME 解釋" size="small">
              <Paragraph>
                局部可解釋性分析顯示了特定預測的解釋。
              </Paragraph>
            </Card>
            
            <Divider />
            
            <Card title="決策路徑" size="small">
              <Timeline>
                <Timeline.Item>數據輸入</Timeline.Item>
                <Timeline.Item>特徵提取</Timeline.Item>
                <Timeline.Item>模型預測</Timeline.Item>
                <Timeline.Item>異常判定</Timeline.Item>
              </Timeline>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AIAnalysis; 