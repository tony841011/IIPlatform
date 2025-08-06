import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Space,
  Typography,
  Tag,
  Progress,
  Alert,
  Divider,
  Row,
  Col,
  Tooltip,
  message,
  Spin,
  Descriptions,
  Badge,
  Switch,
  InputNumber,
  Tabs,
  List,
  Avatar,
  Statistic,
  Timeline
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SettingOutlined,
  CloudUploadOutlined,
  LinkOutlined,
  ApiOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  RocketOutlined,
  ExperimentOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const AIModelManagement = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // 模型類型選項
  const modelTypes = [
    { value: 'llm', label: '大語言模型 (LLM)', icon: <RocketOutlined /> },
    { value: 'vision', label: '視覺模型 (Vision)', icon: <EyeOutlined /> },
    { value: 'audio', label: '語音模型 (Audio)', icon: <ApiOutlined /> },
    { value: 'multimodal', label: '多模態模型 (Multimodal)', icon: <ThunderboltOutlined /> },
    { value: 'embedding', label: '嵌入模型 (Embedding)', icon: <DatabaseOutlined /> },
    { value: 'custom', label: '自定義模型 (Custom)', icon: <ExperimentOutlined /> }
  ];

  // 模型框架選項
  const frameworks = [
    { value: 'pytorch', label: 'PyTorch' },
    { value: 'tensorflow', label: 'TensorFlow' },
    { value: 'onnx', label: 'ONNX' },
    { value: 'tensorrt', label: 'TensorRT' },
    { value: 'openvino', label: 'OpenVINO' },
    { value: 'custom', label: '自定義框架' }
  ];

  // 模型來源選項
  const modelSources = [
    { value: 'huggingface', label: 'Hugging Face' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'local', label: '本地文件' },
    { value: 'url', label: 'URL 下載' },
    { value: 'custom', label: '自定義來源' }
  ];

  // 模擬數據
  useEffect(() => {
    const mockModels = [
      {
        id: 1,
        name: 'GPT-4',
        type: 'llm',
        framework: 'openai',
        source: 'openai',
        version: '4.0',
        status: 'active',
        size: '1.7TB',
        accuracy: 95.2,
        latency: 120,
        description: 'OpenAI 最新的大語言模型，支援多種任務',
        tags: ['NLP', '對話', '生成'],
        createdAt: '2024-01-15',
        lastUsed: '2024-01-15 14:30:00',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        config: {
          maxTokens: 4096,
          temperature: 0.7,
          topP: 0.9
        }
      },
      {
        id: 2,
        name: 'Claude-3',
        type: 'llm',
        framework: 'anthropic',
        source: 'anthropic',
        version: '3.0',
        status: 'active',
        size: '1.2TB',
        accuracy: 94.8,
        latency: 150,
        description: 'Anthropic 的 Claude 3 模型，擅長推理和寫作',
        tags: ['NLP', '推理', '寫作'],
        createdAt: '2024-01-14',
        lastUsed: '2024-01-15 13:45:00',
        endpoint: 'https://api.anthropic.com/v1/messages',
        config: {
          maxTokens: 4096,
          temperature: 0.5,
          topP: 0.8
        }
      },
      {
        id: 3,
        name: 'ResNet-50',
        type: 'vision',
        framework: 'pytorch',
        source: 'huggingface',
        version: '1.0',
        status: 'inactive',
        size: '98MB',
        accuracy: 92.1,
        latency: 45,
        description: '經典的圖像分類模型，適用於多種視覺任務',
        tags: ['CV', '分類', '圖像'],
        createdAt: '2024-01-13',
        lastUsed: '2024-01-14 16:20:00',
        endpoint: 'http://localhost:8000/vision/resnet50',
        config: {
          inputSize: [224, 224],
          numClasses: 1000,
          batchSize: 32
        }
      }
    ];
    setModels(mockModels);
  }, []);

  // 添加新模型
  const handleAddModel = () => {
    setIsAddModalVisible(true);
    form.resetFields();
  };

  // 確認添加模型
  const handleAddConfirm = () => {
    form.validateFields().then(values => {
      setLoading(true);
      
      // 模擬上傳進度
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        setUploadProgress(Math.min(progress, 100));
        
        if (progress >= 100) {
          clearInterval(interval);
          
          const newModel = {
            id: Date.now(),
            ...values,
            status: 'uploading',
            createdAt: new Date().toISOString().split('T')[0],
            lastUsed: new Date().toISOString().replace('T', ' ').split('.')[0],
            accuracy: Math.floor(Math.random() * 20) + 80,
            latency: Math.floor(Math.random() * 200) + 50,
            size: `${Math.floor(Math.random() * 1000) + 50}MB`
          };
          
          setModels([...models, newModel]);
          setIsAddModalVisible(false);
          setUploadProgress(0);
          setLoading(false);
          message.success('模型添加成功！');
        }
      }, 500);
    });
  };

  // 編輯模型
  const handleEditModel = (model) => {
    setCurrentModel(model);
    editForm.setFieldsValue({
      name: model.name,
      type: model.type,
      framework: model.framework,
      source: model.source,
      version: model.version,
      description: model.description,
      endpoint: model.endpoint
    });
    setIsEditModalVisible(true);
  };

  // 確認編輯模型
  const handleEditConfirm = () => {
    editForm.validateFields().then(values => {
      const updatedModels = models.map(model => 
        model.id === currentModel.id ? { ...model, ...values } : model
      );
      setModels(updatedModels);
      setIsEditModalVisible(false);
      message.success('模型更新成功！');
    });
  };

  // 查看模型詳情
  const handleViewDetails = (model) => {
    setCurrentModel(model);
    setIsDetailModalVisible(true);
  };

  // 切換模型狀態
  const handleToggleStatus = (modelId) => {
    const updatedModels = models.map(model => 
      model.id === modelId 
        ? { ...model, status: model.status === 'active' ? 'inactive' : 'active' }
        : model
    );
    setModels(updatedModels);
    message.success('模型狀態已更新！');
  };

  // 刪除模型
  const handleDeleteModel = (modelId) => {
    Modal.confirm({
      title: '確認刪除',
      content: '確定要刪除這個模型嗎？此操作不可撤銷。',
      okText: '確認',
      cancelText: '取消',
      onOk: () => {
        const updatedModels = models.filter(model => model.id !== modelId);
        setModels(updatedModels);
        message.success('模型已刪除！');
      }
    });
  };

  // 測試模型
  const handleTestModel = (model) => {
    message.info(`正在測試模型: ${model.name}`);
    // 這裡可以添加實際的模型測試邏輯
  };

  // 表格列定義
  const columns = [
    {
      title: '模型名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          <Tag color="blue">v{record.version}</Tag>
        </Space>
      )
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeInfo = modelTypes.find(t => t.value === type);
        return (
          <Space>
            {typeInfo?.icon}
            <Text>{typeInfo?.label}</Text>
          </Space>
        );
      }
    },
    {
      title: '框架',
      dataIndex: 'framework',
      key: 'framework',
      render: (framework) => {
        const frameworkInfo = frameworks.find(f => f.value === framework);
        return <Tag color="green">{frameworkInfo?.label}</Tag>;
      }
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'active' ? 'success' : status === 'uploading' ? 'processing' : 'default'} 
          text={status === 'active' ? '運行中' : status === 'uploading' ? '上傳中' : '已停止'} 
        />
      )
    },
    {
      title: '準確率',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy) => (
        <Progress 
          percent={accuracy} 
          size="small" 
          status={accuracy >= 90 ? 'success' : accuracy >= 80 ? 'normal' : 'exception'}
        />
      )
    },
    {
      title: '延遲 (ms)',
      dataIndex: 'latency',
      key: 'latency',
      render: (latency) => (
        <Text type={latency < 100 ? 'success' : latency < 200 ? 'warning' : 'danger'}>
          {latency}ms
        </Text>
      )
    },
    {
      title: '最後使用',
      dataIndex: 'lastUsed',
      key: 'lastUsed',
      render: (time) => <Text type="secondary">{time}</Text>
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看詳情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="編輯">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditModel(record)}
            />
          </Tooltip>
          <Tooltip title="測試模型">
            <Button 
              type="text" 
              icon={<PlayCircleOutlined />} 
              onClick={() => handleTestModel(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? '停止' : '啟動'}>
            <Button 
              type="text" 
              icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => handleToggleStatus(record.id)}
            />
          </Tooltip>
          <Tooltip title="刪除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteModel(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 統計數據
  const stats = {
    total: models.length,
    active: models.filter(m => m.status === 'active').length,
    uploading: models.filter(m => m.status === 'uploading').length,
    types: [...new Set(models.map(m => m.type))].length
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* 頁面標題 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <RocketOutlined style={{ marginRight: '8px' }} />
          AI Model 管理
        </Title>
        <Text type="secondary">
          管理您的 AI 模型，支援從外部來源新增和掛載模型
        </Text>
      </div>

      {/* 統計卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="總模型數"
              value={stats.total}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="運行中"
              value={stats.active}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="上傳中"
              value={stats.uploading}
              prefix={<LoadingOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="模型類型"
              value={stats.types}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要內容區域 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="模型列表" key="1">
            <div style={{ marginBottom: '16px' }}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddModel}
                >
                  新增模型
                </Button>
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={() => message.info('刷新模型列表')}
                >
                  刷新
                </Button>
              </Space>
            </div>
            
            <Table
              columns={columns}
              dataSource={models}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
              }}
            />
          </TabPane>

          <TabPane tab="模型監控" key="2">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="性能監控" size="small">
                  <List
                    dataSource={models.filter(m => m.status === 'active')}
                    renderItem={model => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<RocketOutlined />} />}
                          title={model.name}
                          description={`延遲: ${model.latency}ms | 準確率: ${model.accuracy}%`}
                        />
                        <Progress 
                          percent={model.accuracy} 
                          size="small" 
                          status={model.accuracy >= 90 ? 'success' : 'normal'}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="使用統計" size="small">
                  <Timeline>
                    {models.slice(0, 5).map(model => (
                      <Timeline.Item key={model.id}>
                        <Text strong>{model.name}</Text>
                        <br />
                        <Text type="secondary">最後使用: {model.lastUsed}</Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="模型配置" key="3">
            <Alert
              message="模型配置"
              description="在這裡可以配置模型的運行參數、環境變數等設定。"
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            <Card title="全局配置">
              <Form layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="默認 GPU 記憶體限制">
                      <InputNumber 
                        min={1} 
                        max={32} 
                        defaultValue={8} 
                        addonAfter="GB" 
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="默認批次大小">
                      <InputNumber 
                        min={1} 
                        max={128} 
                        defaultValue={32} 
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="模型快取目錄">
                      <Input defaultValue="/models/cache" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="日誌級別">
                      <Select defaultValue="info">
                        <Option value="debug">Debug</Option>
                        <Option value="info">Info</Option>
                        <Option value="warning">Warning</Option>
                        <Option value="error">Error</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button type="primary">保存配置</Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* 新增模型模態框 */}
      <Modal
        title="新增 AI Model"
        open={isAddModalVisible}
        onOk={handleAddConfirm}
        onCancel={() => setIsAddModalVisible(false)}
        width={800}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="模型名稱"
                rules={[{ required: true, message: '請輸入模型名稱' }]}
              >
                <Input placeholder="例如: GPT-4, Claude-3" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="version"
                label="版本"
                rules={[{ required: true, message: '請輸入版本號' }]}
              >
                <Input placeholder="例如: 1.0, 4.0" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="type"
                label="模型類型"
                rules={[{ required: true, message: '請選擇模型類型' }]}
              >
                <Select placeholder="選擇模型類型">
                  {modelTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      <Space>
                        {type.icon}
                        {type.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="framework"
                label="框架"
                rules={[{ required: true, message: '請選擇框架' }]}
              >
                <Select placeholder="選擇框架">
                  {frameworks.map(framework => (
                    <Option key={framework.value} value={framework.value}>
                      {framework.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="source"
                label="模型來源"
                rules={[{ required: true, message: '請選擇模型來源' }]}
              >
                <Select placeholder="選擇來源">
                  {modelSources.map(source => (
                    <Option key={source.value} value={source.value}>
                      {source.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="模型描述"
          >
            <TextArea 
              rows={3} 
              placeholder="請描述模型的功能、特點和適用場景"
            />
          </Form.Item>

          <Form.Item
            name="endpoint"
            label="API 端點"
            rules={[{ required: true, message: '請輸入 API 端點' }]}
          >
            <Input placeholder="例如: https://api.openai.com/v1/chat/completions" />
          </Form.Item>

          <Form.Item label="模型文件">
            <Upload.Dragger
              name="files"
              action="/api/upload"
              multiple
              accept=".pt,.pth,.onnx,.pb,.h5,.bin"
            >
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined />
              </p>
              <p className="ant-upload-text">點擊或拖拽文件到此區域上傳</p>
              <p className="ant-upload-hint">
                支援 PyTorch (.pt, .pth), ONNX (.onnx), TensorFlow (.pb, .h5) 等格式
              </p>
            </Upload.Dragger>
          </Form.Item>

          {uploadProgress > 0 && (
            <Form.Item label="上傳進度">
              <Progress percent={uploadProgress} status="active" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* 編輯模型模態框 */}
      <Modal
        title="編輯模型"
        open={isEditModalVisible}
        onOk={handleEditConfirm}
        onCancel={() => setIsEditModalVisible(false)}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="模型名稱"
                rules={[{ required: true, message: '請輸入模型名稱' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="version"
                label="版本"
                rules={[{ required: true, message: '請輸入版本號' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="type"
                label="模型類型"
                rules={[{ required: true, message: '請選擇模型類型' }]}
              >
                <Select>
                  {modelTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="framework"
                label="框架"
                rules={[{ required: true, message: '請選擇框架' }]}
              >
                <Select>
                  {frameworks.map(framework => (
                    <Option key={framework.value} value={framework.value}>
                      {framework.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="source"
                label="模型來源"
                rules={[{ required: true, message: '請選擇模型來源' }]}
              >
                <Select>
                  {modelSources.map(source => (
                    <Option key={source.value} value={source.value}>
                      {source.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="模型描述"
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="endpoint"
            label="API 端點"
            rules={[{ required: true, message: '請輸入 API 端點' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* 模型詳情模態框 */}
      <Modal
        title="模型詳情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="test" type="primary" icon={<PlayCircleOutlined />}>
            測試模型
          </Button>,
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            關閉
          </Button>
        ]}
        width={800}
      >
        {currentModel && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="模型名稱">{currentModel.name}</Descriptions.Item>
              <Descriptions.Item label="版本">{currentModel.version}</Descriptions.Item>
              <Descriptions.Item label="類型">
                {modelTypes.find(t => t.value === currentModel.type)?.label}
              </Descriptions.Item>
              <Descriptions.Item label="框架">
                {frameworks.find(f => f.value === currentModel.framework)?.label}
              </Descriptions.Item>
              <Descriptions.Item label="來源">
                {modelSources.find(s => s.value === currentModel.source)?.label}
              </Descriptions.Item>
              <Descriptions.Item label="狀態">
                <Badge 
                  status={currentModel.status === 'active' ? 'success' : 'default'} 
                  text={currentModel.status === 'active' ? '運行中' : '已停止'} 
                />
              </Descriptions.Item>
              <Descriptions.Item label="大小">{currentModel.size}</Descriptions.Item>
              <Descriptions.Item label="準確率">{currentModel.accuracy}%</Descriptions.Item>
              <Descriptions.Item label="延遲">{currentModel.latency}ms</Descriptions.Item>
              <Descriptions.Item label="創建時間">{currentModel.createdAt}</Descriptions.Item>
              <Descriptions.Item label="最後使用">{currentModel.lastUsed}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="配置信息" bordered column={1}>
              <Descriptions.Item label="API 端點">{currentModel.endpoint}</Descriptions.Item>
              <Descriptions.Item label="描述">{currentModel.description}</Descriptions.Item>
              <Descriptions.Item label="標籤">
                {currentModel.tags?.map(tag => (
                  <Tag key={tag} color="blue">{tag}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>

            {currentModel.config && (
              <>
                <Divider />
                <Descriptions title="模型配置" bordered column={2}>
                  {Object.entries(currentModel.config).map(([key, value]) => (
                    <Descriptions.Item key={key} label={key}>
                      {typeof value === 'object' ? JSON.stringify(value) : value}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AIModelManagement; 