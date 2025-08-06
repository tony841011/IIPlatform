import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Select, 
  Button, 
  Table, 
  Statistic, 
  Space,
  Typography,
  Divider,
  Tag,
  Progress,
  Alert,
  Modal,
  Form,
  Input,
  DatePicker,
  Badge
} from 'antd';
import { 
  RobotOutlined, 
  ExperimentOutlined, 
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  DownloadOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const AIAnalysis = () => {
  const [selectedModel, setSelectedModel] = useState('anomaly_detection');
  const [isRunning, setIsRunning] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模擬數據
  const models = [
    { id: 'anomaly_detection', name: '異常偵測模型', status: 'active', accuracy: 95.2 },
    { id: 'predictive_maintenance', name: '預測性維護模型', status: 'training', accuracy: 87.8 },
    { id: 'quality_prediction', name: '品質預測模型', status: 'inactive', accuracy: 92.1 },
    { id: 'optimization', name: '製程優化模型', status: 'active', accuracy: 89.5 }
  ];

  const analysisResults = [
    {
      key: '1',
      timestamp: '2024-01-15 14:30:00',
      model: '異常偵測模型',
      device: '溫度感測器-01',
      prediction: '異常',
      confidence: 0.92,
      actual: '異常',
      accuracy: '正確',
      details: '檢測到溫度異常升高趨勢'
    },
    {
      key: '2',
      timestamp: '2024-01-15 14:25:00',
      model: '預測性維護模型',
      device: '控制閥-01',
      prediction: '需要維護',
      confidence: 0.78,
      actual: '正常',
      accuracy: '錯誤',
      details: '預測維護時間可能過於保守'
    },
    {
      key: '3',
      timestamp: '2024-01-15 14:20:00',
      model: '品質預測模型',
      device: '生產線A',
      prediction: '品質良好',
      confidence: 0.95,
      actual: '品質良好',
      accuracy: '正確',
      details: '所有參數都在正常範圍內'
    },
    {
      key: '4',
      timestamp: '2024-01-15 14:15:00',
      model: '製程優化模型',
      device: '混合器-02',
      prediction: '可優化',
      confidence: 0.83,
      actual: '可優化',
      accuracy: '正確',
      details: '建議調整混合時間和溫度'
    }
  ];

  const performanceStats = {
    totalPredictions: 1250,
    correctPredictions: 1180,
    accuracy: 94.4,
    activeModels: 2,
    trainingModels: 1,
    inactiveModels: 1
  };

  const columns = [
    {
      title: '時間戳',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
      filters: models.map(m => ({ text: m.name, value: m.name })),
      onFilter: (value, record) => record.model === value,
    },
    {
      title: '設備',
      dataIndex: 'device',
      key: 'device',
    },
    {
      title: '預測結果',
      dataIndex: 'prediction',
      key: 'prediction',
      render: (prediction) => (
        <Tag color={
          prediction === '異常' || prediction === '需要維護' ? 'red' :
          prediction === '可優化' ? 'orange' : 'green'
        }>
          {prediction}
        </Tag>
      ),
    },
    {
      title: '信心度',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence) => (
        <Progress 
          percent={Math.round(confidence * 100)} 
          size="small" 
          status={confidence > 0.9 ? 'success' : confidence > 0.7 ? 'normal' : 'exception'}
        />
      ),
      sorter: (a, b) => a.confidence - b.confidence,
    },
    {
      title: '實際結果',
      dataIndex: 'actual',
      key: 'actual',
    },
    {
      title: '準確性',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy) => (
        <Tag color={accuracy === '正確' ? 'green' : 'red'}>
          {accuracy}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="text" icon={<EyeOutlined />} size="small">
          詳情
        </Button>
      ),
    },
  ];

  const handleStartAnalysis = () => {
    setIsRunning(true);
    // 模擬分析過程
    setTimeout(() => {
      setIsRunning(false);
    }, 3000);
  };

  const handleStopAnalysis = () => {
    setIsRunning(false);
  };

  const handleConfigureModel = () => {
    setConfigModalVisible(true);
  };

  return (
    <div>
      <Card title="AI 分析">
        {/* 狀態警報 */}
        <Alert
          message="AI 模型狀態"
          description="異常偵測模型檢測到溫度感測器-01 的異常模式，建議立即檢查設備狀態。"
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
        />

        {/* 控制面板 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <span>選擇模型：</span>
              <Select
                value={selectedModel}
                onChange={setSelectedModel}
                style={{ width: '100%', marginLeft: 8 }}
                placeholder="選擇AI模型"
              >
                {models.map(model => (
                  <Option key={model.id} value={model.id}>{model.name}</Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={handleStartAnalysis}
                  loading={isRunning}
                  disabled={isRunning}
                >
                  開始分析
                </Button>
                <Button 
                  icon={<PauseCircleOutlined />}
                  onClick={handleStopAnalysis}
                  disabled={!isRunning}
                >
                  停止分析
                </Button>
                <Button icon={<ReloadOutlined />}>
                  重新訓練
                </Button>
              </Space>
            </Col>
            <Col span={6}>
              <Space>
                <Button icon={<SettingOutlined />} onClick={handleConfigureModel}>
                  模型配置
                </Button>
                <Button icon={<DownloadOutlined />}>
                  匯出結果
                </Button>
              </Space>
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              <Text type="secondary">
                最後更新：2024-01-15 14:30:00
              </Text>
            </Col>
          </Row>
        </Card>

        {/* 性能統計 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="總預測數"
                value={performanceStats.totalPredictions}
                prefix={<ExperimentOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="正確預測"
                value={performanceStats.correctPredictions}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="整體準確率"
                value={performanceStats.accuracy}
                suffix="%"
                precision={1}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="活躍模型"
                value={performanceStats.activeModels}
                valueStyle={{ color: '#52c41a' }}
                prefix={<RobotOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="訓練中"
                value={performanceStats.trainingModels}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<ExperimentOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="停用模型"
                value={performanceStats.inactiveModels}
                valueStyle={{ color: '#666' }}
                prefix={<PauseCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 模型狀態 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {models.map(model => (
            <Col span={6} key={model.id}>
              <Card 
                title={model.name}
                extra={
                  <Tag color={
                    model.status === 'active' ? 'green' :
                    model.status === 'training' ? 'orange' : 'default'
                  }>
                    {model.status === 'active' ? '活躍' :
                     model.status === 'training' ? '訓練中' : '停用'}
                  </Tag>
                }
              >
                <Statistic
                  title="準確率"
                  value={model.accuracy}
                  suffix="%"
                  precision={1}
                  valueStyle={{ 
                    color: model.accuracy > 90 ? '#3f8600' : 
                           model.accuracy > 80 ? '#fa8c16' : '#cf1322' 
                  }}
                />
                <div style={{ marginTop: 8 }}>
                  <Progress 
                    percent={model.accuracy} 
                    size="small"
                    status={model.status === 'training' ? 'active' : 'normal'}
                  />
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 分析結果表格 */}
        <Card title="分析結果" extra={<Button icon={<DownloadOutlined />}>匯出報告</Button>}>
          <Table
            columns={columns}
            dataSource={analysisResults}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
            }}
          />
        </Card>
      </Card>

      {/* 模型配置模態框 */}
      <Modal
        title="AI 模型配置"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfigModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            form.validateFields().then(values => {
              console.log('配置參數:', values);
              setConfigModalVisible(false);
            });
          }}>
            保存配置
          </Button>
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="learning_rate"
                label="學習率"
                rules={[{ required: true, message: '請輸入學習率' }]}
              >
                <Input placeholder="0.001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="batch_size"
                label="批次大小"
                rules={[{ required: true, message: '請輸入批次大小' }]}
              >
                <Input placeholder="32" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="epochs"
                label="訓練輪數"
                rules={[{ required: true, message: '請輸入訓練輪數' }]}
              >
                <Input placeholder="100" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="threshold"
                label="異常閾值"
                rules={[{ required: true, message: '請輸入異常閾值' }]}
              >
                <Input placeholder="0.8" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="配置描述"
          >
            <Input.TextArea rows={3} placeholder="請輸入配置描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AIAnalysis;
