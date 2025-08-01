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
  Steps
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
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Step } = Steps;

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
  const [anomalyDetections, setAnomalyDetections] = useState([]);
  const [anomalyAlerts, setAnomalyAlerts] = useState([]);
  const [modelTrainings, setModelTrainings] = useState([]);
  const [modelOperations, setModelOperations] = useState([]);
  const [modelVersions, setModelVersions] = useState([]);
  const [form] = Form.useForm();
  const [trainingForm] = Form.useForm();
  const [deploymentForm] = Form.useForm();

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
      render: (level) => (
        <Tag color={level === 'critical' ? 'red' : level === 'error' ? 'orange' : level === 'warning' ? 'yellow' : 'green'}>
          {level}
        </Tag>
      ),
    },
    {
      title: '告警訊息',
      dataIndex: 'alert_message',
      key: 'alert_message',
    },
    {
      title: '建議行動',
      dataIndex: 'recommended_actions',
      key: 'recommended_actions',
      render: (actions) => (
        <ul>
          {Object.entries(actions).map(([key, value]) => (
            <li key={key}>{key}: {value}</li>
          ))}
        </ul>
      ),
    },
    {
      title: '確認狀態',
      dataIndex: 'is_acknowledged',
      key: 'is_acknowledged',
      render: (isAcknowledged) => (
        <Badge 
          status={isAcknowledged ? 'success' : 'default'} 
          text={isAcknowledged ? '已確認' : '未確認'} 
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {!record.is_acknowledged && (
            <Popconfirm
              title="確認告警"
              description="確認此告警嗎？"
              onConfirm={() => acknowledgeAlert(record.id)}
              okText="確認"
              cancelText="取消"
            >
              <Button type="primary" icon={<CheckCircleOutlined />} size="small">
                確認告警
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const modelTrainingColumns = [
    {
      title: '訓練時間',
      dataIndex: 'training_start',
      key: 'training_start',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '狀態',
      dataIndex: 'training_status',
      key: 'training_status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : status === 'failed' ? 'red' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '訓練數據量',
      dataIndex: 'training_data_size',
      key: 'training_data_size',
    },
    {
      title: '驗證數據量',
      dataIndex: 'validation_data_size',
      key: 'validation_data_size',
    },
    {
      title: '最終準確率',
      dataIndex: 'final_accuracy',
      key: 'final_accuracy',
      render: (accuracy) => `${(accuracy * 100).toFixed(2)}%`,
    },
    {
      title: '最終損失',
      dataIndex: 'final_loss',
      key: 'final_loss',
      render: (loss) => loss.toFixed(4),
    },
    {
      title: '訓練時長',
      dataIndex: 'training_duration',
      key: 'training_duration',
      render: (duration) => `${(duration / 60).toFixed(2)} 分鐘`,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<EyeOutlined />} size="small" onClick={() => {}}>
            查看詳情
          </Button>
        </Space>
      ),
    },
  ];

  const modelOperationColumns = [
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
    },
    {
      title: '操作狀態',
      dataIndex: 'operation_status',
      key: 'operation_status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : status === 'failed' ? 'red' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '操作配置',
      dataIndex: 'operation_config',
      key: 'operation_config',
      render: (config) => JSON.stringify(config, null, 2),
    },
    {
      title: '性能指標',
      dataIndex: 'performance_metrics',
      key: 'performance_metrics',
      render: (metrics) => JSON.stringify(metrics, null, 2),
    },
    {
      title: '漂移檢測',
      dataIndex: 'drift_detection',
      key: 'drift_detection',
      render: (drift) => JSON.stringify(drift, null, 2),
    },
    {
      title: '重訓練觸發',
      dataIndex: 'retraining_trigger',
      key: 'retraining_trigger',
    },
    {
      title: '操作人',
      dataIndex: 'created_by',
      key: 'created_by',
      render: (userId) => `User ${userId}`, // 實際應該是使用者名稱
    },
    {
      title: '完成時間',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (time) => time ? new Date(time).toLocaleString() : 'N/A',
    },
  ];

  const modelVersionColumns = [
    {
      title: '版本號',
      dataIndex: 'version_number',
      key: 'version_number',
    },
    {
      title: '模型路徑',
      dataIndex: 'model_path',
      key: 'model_path',
    },
    {
      title: '模型雜湊',
      dataIndex: 'model_hash',
      key: 'model_hash',
    },
    {
      title: '性能指標',
      dataIndex: 'performance_metrics',
      key: 'performance_metrics',
      render: (metrics) => JSON.stringify(metrics, null, 2),
    },
    {
      title: '變更日誌',
      dataIndex: 'change_log',
      key: 'change_log',
    },
    {
      title: '部署狀態',
      dataIndex: 'is_deployed',
      key: 'is_deployed',
      render: (isDeployed) => (
        <Badge 
          status={isDeployed ? 'success' : 'default'} 
          text={isDeployed ? '已部署' : '未部署'} 
        />
      ),
    },
    {
      title: '部署時間',
      dataIndex: 'deployed_at',
      key: 'deployed_at',
      render: (time) => time ? new Date(time).toLocaleString() : 'N/A',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<DeploymentUnitOutlined />} size="small" onClick={() => {}}>
            部署
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>AI 異常偵測</h2>
      
      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="選擇設備進行 AI 分析"
          style={{ width: 300 }}
          onChange={setSelectedDevice}
          value={selectedDevice}
        >
          {devices.map(device => (
            <Select.Option key={device.id} value={device.id}>
              {device.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      {loading ? (
        <Spin tip="載入中..." />
      ) : aiResult && (
        <>
          {/* AI 分析結果 */}
          <Card title="AI 分析結果" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="異常分數"
                  value={aiResult.score.toFixed(2)}
                  prefix={<RobotOutlined />}
                  valueStyle={{ 
                    color: getAnomalyLevel(aiResult.score).color,
                    fontSize: '24px'
                  }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="最新數值"
                  value={aiResult.latest.toFixed(2)}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="平均值"
                  value={aiResult.mean.toFixed(2)}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
              <Alert
                message={aiResult.advice}
                type={getAnomalyLevel(aiResult.score).level}
                showIcon
                icon={<WarningOutlined />}
                style={{ marginBottom: 16 }}
              />

              <div style={{ marginTop: 16 }}>
                <h4>異常程度</h4>
                <Progress
                  percent={Math.min(aiResult.score * 25, 100)}
                  strokeColor={getAnomalyLevel(aiResult.score).color}
                  format={() => getAnomalyLevel(aiResult.score).text}
                />
              </div>
            </div>
          </Card>

          {/* 詳細統計 */}
          <Row gutter={16}>
            <Col span={12}>
              <Card title="統計資訊">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="標準差"
                      value={aiResult.std.toFixed(2)}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="變異係數"
                      value={((aiResult.std / aiResult.mean) * 100).toFixed(2)}
                      suffix="%"
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="AI 建議">
                <div style={{ padding: 16, background: '#f6ffed', borderRadius: 6 }}>
                  <p><strong>分析結果：</strong></p>
                  <ul>
                    <li>異常分數：{aiResult.score.toFixed(2)}</li>
                    <li>建議：{aiResult.advice}</li>
                    <li>當前數值：{aiResult.latest.toFixed(2)}</li>
                    <li>歷史平均：{aiResult.mean.toFixed(2)}</li>
                  </ul>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 異常偵測記錄 */}
          <Card title="異常偵測記錄" style={{ marginTop: 24 }}>
            <Table
              columns={anomalyDetectionColumns}
              dataSource={anomalyDetections}
              pagination={{ pageSize: 10 }}
            />
          </Card>

          {/* 異常告警 */}
          <Card title="異常告警" style={{ marginTop: 24 }}>
            <Table
              columns={anomalyAlertColumns}
              dataSource={anomalyAlerts}
              pagination={{ pageSize: 10 }}
            />
          </Card>

          {/* 模型訓練記錄 */}
          <Card title="模型訓練記錄" style={{ marginTop: 24 }}>
            <Table
              columns={modelTrainingColumns}
              dataSource={modelTrainings}
              pagination={{ pageSize: 10 }}
            />
          </Card>

          {/* 模型營運記錄 */}
          <Card title="模型營運記錄" style={{ marginTop: 24 }}>
            <Table
              columns={modelOperationColumns}
              dataSource={modelOperations}
              pagination={{ pageSize: 10 }}
            />
          </Card>

          {/* 模型版本 */}
          <Card title="模型版本" style={{ marginTop: 24 }}>
            <Table
              columns={modelVersionColumns}
              dataSource={modelVersions}
              pagination={{ pageSize: 10 }}
            />
          </Card>

          {/* 新增 AI 模型 */}
          <Button type="primary" icon={<SettingOutlined />} onClick={() => setModelModalVisible(true)} style={{ marginTop: 24 }}>
            新增 AI 模型
          </Button>

          {/* 新增模型訓練 */}
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => setTrainingModalVisible(true)} style={{ marginTop: 16 }}>
            模型訓練
          </Button>

          {/* 模型部署 */}
          <Button type="primary" icon={<DeploymentUnitOutlined />} onClick={() => setDeploymentModalVisible(true)} style={{ marginTop: 16 }}>
            模型部署
          </Button>
        </>
      )}

      {/* 新增 AI 模型 Modal */}
      <Modal
        title="新增 AI 模型"
        visible={modelModalVisible}
        onCancel={() => setModelModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModelModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            提交
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={createModel}
        >
          <Form.Item
            name="name"
            label="模型名稱"
            rules={[{ required: true, message: '請輸入模型名稱' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="model_type"
            label="模型類型"
            rules={[{ required: true, message: '請選擇模型類型' }]}
          >
            <Select>
              <Option value="isolation_forest">Isolation Forest</Option>
              <Option value="autoencoder">Autoencoder</Option>
              <Option value="lstm">LSTM</Option>
              <Option value="xgboost">XGBoost</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="device_id"
            label="關聯設備"
            rules={[{ required: true, message: '請選擇關聯設備' }]}
          >
            <Select>
              {devices.map(device => (
                <Option key={device.id} value={device.id}>
                  {device.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="model_config"
            label="模型配置"
            rules={[{ required: true, message: '請輸入模型配置' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="is_active"
            label="啟用狀態"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="is_production"
            label="生產環境模型"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 模型訓練 Modal */}
      <Modal
        title="模型訓練"
        visible={trainingModalVisible}
        onCancel={() => setTrainingModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setTrainingModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => trainingForm.submit()}>
            提交
          </Button>,
        ]}
      >
        <Form
          form={trainingForm}
          layout="vertical"
          onFinish={trainModel}
        >
          <Form.Item
            name="training_config"
            label="訓練配置"
            rules={[{ required: true, message: '請輸入訓練配置' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="data_config"
            label="數據配置"
            rules={[{ required: true, message: '請輸入數據配置' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 模型部署 Modal */}
      <Modal
        title="模型部署"
        visible={deploymentModalVisible}
        onCancel={() => setDeploymentModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDeploymentModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => deploymentForm.submit()}>
            提交
          </Button>,
        ]}
      >
        <Form
          form={deploymentForm}
          layout="vertical"
          onFinish={deployModel}
        >
          <Form.Item
            name="version_id"
            label="模型版本"
            rules={[{ required: true, message: '請選擇模型版本' }]}
          >
            <Select>
              {modelVersions.map(version => (
                <Option key={version.id} value={version.id}>
                  {version.version_number}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="deployment_config"
            label="部署配置"
            rules={[{ required: true, message: '請輸入部署配置' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AIAnalysis; 