import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch,
  Statistic,
  Progress,
  Alert,
  Tooltip,
  Typography,
  Divider,
  Tabs,
  List,
  Badge,
  message,
  Upload,
  InputNumber,
  DatePicker,
  TimePicker,
  Collapse
} from 'antd';
import { 
  SyncOutlined, 
  FilterOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SettingOutlined,
  DownloadOutlined,
  UploadOutlined,
  PlusOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

const DataTransformation = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [transformationStatus, setTransformationStatus] = useState('idle');
  const [transformations, setTransformations] = useState([
    {
      id: 1,
      name: '溫度數據標準化',
      type: 'normalize',
      status: 'active',
      source: 'MQTT 溫度數據',
      description: '將攝氏溫度轉換為標準化數值',
      inputFormat: 'JSON',
      outputFormat: 'JSON',
      lastRun: '2024-01-15 14:30:00',
      processedCount: 1250,
      successRate: 98.5
    },
    {
      id: 2,
      name: '壓力數據聚合',
      type: 'aggregate',
      status: 'active',
      source: 'Modbus 壓力數據',
      description: '每分鐘聚合壓力數據',
      inputFormat: 'CSV',
      outputFormat: 'JSON',
      lastRun: '2024-01-15 14:28:00',
      processedCount: 890,
      successRate: 99.2
    },
    {
      id: 3,
      name: '設備狀態轉換',
      type: 'transform',
      status: 'inactive',
      source: 'PostgreSQL 設備數據',
      description: '將設備狀態代碼轉換為可讀文字',
      inputFormat: 'SQL',
      outputFormat: 'JSON',
      lastRun: '2024-01-15 14:25:00',
      processedCount: 456,
      successRate: 100.0
    }
  ]);

  const [dataValidation, setDataValidation] = useState([
    {
      id: 1,
      field: 'temperature',
      rule: '範圍檢查',
      condition: '0 <= value <= 100',
      status: 'passed',
      errorCount: 0,
      totalCount: 1250
    },
    {
      id: 2,
      field: 'pressure',
      rule: '非空檢查',
      condition: 'value != null && value != ""',
      status: 'passed',
      errorCount: 0,
      totalCount: 890
    },
    {
      id: 3,
      field: 'device_id',
      rule: '格式檢查',
      condition: 'regex: ^[A-Z]{2}\\d{4}$',
      status: 'failed',
      errorCount: 15,
      totalCount: 456
    }
  ]);

  const [transformationResults, setTransformationResults] = useState([
    {
      id: 1,
      timestamp: '2024-01-15 14:30:00',
      transformation: '溫度數據標準化',
      inputData: '{"temperature": 87.5, "unit": "celsius"}',
      outputData: '{"temperature": 0.875, "unit": "normalized"}',
      status: 'success',
      processingTime: 0.15
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:28:00',
      transformation: '壓力數據聚合',
      inputData: '[2.5, 2.6, 2.4, 2.7, 2.5]',
      outputData: '{"avg_pressure": 2.54, "min_pressure": 2.4, "max_pressure": 2.7}',
      status: 'success',
      processingTime: 0.08
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:25:00',
      transformation: '設備狀態轉換',
      inputData: '{"status": "ONLINE"}',
      outputData: '{"status": "online", "status_text": "在線"}',
      status: 'success',
      processingTime: 0.05
    }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [validationModalVisible, setValidationModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedTransformation, setSelectedTransformation] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form] = Form.useForm();
  const [validationForm] = Form.useForm();
  const [templateForm] = Form.useForm();

  // 統計數據
  const stats = {
    totalTransformations: transformations.length,
    activeTransformations: transformations.filter(t => t.status === 'active').length,
    totalProcessed: transformations.reduce((sum, t) => sum + t.processedCount, 0),
    avgSuccessRate: transformations.reduce((sum, t) => sum + t.successRate, 0) / transformations.length,
    totalValidations: dataValidation.length,
    passedValidations: dataValidation.filter(v => v.status === 'passed').length
  };

  const transformationColumns = [
    {
      title: '轉換名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.type === 'normalize' && <SyncOutlined style={{ color: '#1890ff' }} />}
          {record.type === 'aggregate' && <BarChartOutlined style={{ color: '#52c41a' }} />}
          {record.type === 'transform' && <ThunderboltOutlined style={{ color: '#722ed1' }} />}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = { normalize: 'blue', aggregate: 'green', transform: 'purple' };
        const labels = { normalize: '標準化', aggregate: '聚合', transform: '轉換' };
        return <Tag color={colors[type]}>{labels[type]}</Tag>;
      },
    },
    {
      title: '數據源',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '啟用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '輸入格式',
      dataIndex: 'inputFormat',
      key: 'inputFormat',
      render: (format) => <Tag color="blue">{format}</Tag>,
    },
    {
      title: '輸出格式',
      dataIndex: 'outputFormat',
      key: 'outputFormat',
      render: (format) => <Tag color="green">{format}</Tag>,
    },
    {
      title: '處理數量',
      dataIndex: 'processedCount',
      key: 'processedCount',
      sorter: (a, b) => a.processedCount - b.processedCount,
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate) => (
        <Progress 
          percent={rate} 
          size="small"
          status={rate > 95 ? 'success' : rate > 80 ? 'normal' : 'exception'}
        />
      ),
      sorter: (a, b) => a.successRate - b.successRate,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="編輯">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditTransformation(record)}
            />
          </Tooltip>
          <Tooltip title="執行">
            <Button 
              type="text" 
              icon={<PlayCircleOutlined />} 
              size="small"
              onClick={() => handleExecuteTransformation(record)}
            />
          </Tooltip>
          <Tooltip title="查看結果">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleViewResults(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const validationColumns = [
    {
      title: '欄位名稱',
      dataIndex: 'field',
      key: 'field',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: '驗證規則',
      dataIndex: 'rule',
      key: 'rule',
    },
    {
      title: '條件',
      dataIndex: 'condition',
      key: 'condition',
      render: (condition) => <Text code>{condition}</Text>,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'passed' ? 'success' : 'error'} 
          text={status === 'passed' ? '通過' : '失敗'} 
        />
      ),
    },
    {
      title: '錯誤數量',
      dataIndex: 'errorCount',
      key: 'errorCount',
      render: (count, record) => (
        <Text type={count > 0 ? 'danger' : 'success'}>
          {count} / {record.totalCount}
        </Text>
      ),
    },
    {
      title: '錯誤率',
      key: 'errorRate',
      render: (_, record) => {
        const rate = (record.errorCount / record.totalCount * 100).toFixed(1);
        return (
          <Progress 
            percent={100 - parseFloat(rate)} 
            size="small"
            status={parseFloat(rate) > 5 ? 'exception' : 'success'}
          />
        );
      },
    },
  ];

  const resultColumns = [
    {
      title: '時間戳',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: '轉換名稱',
      dataIndex: 'transformation',
      key: 'transformation',
    },
    {
      title: '輸入數據',
      dataIndex: 'inputData',
      key: 'inputData',
      render: (data) => (
        <Tooltip title={data}>
          <Text code style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '輸出數據',
      dataIndex: 'outputData',
      key: 'outputData',
      render: (data) => (
        <Tooltip title={data}>
          <Text strong style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status === 'success' ? '成功' : '失敗'}
        </Tag>
      ),
    },
    {
      title: '處理時間',
      dataIndex: 'processingTime',
      key: 'processingTime',
      render: (time) => `${time}s`,
      sorter: (a, b) => a.processingTime - b.processingTime,
    },
  ];

  const handleEditTransformation = (transformation) => {
    setSelectedTransformation(transformation);
    form.setFieldsValue(transformation);
    setModalVisible(true);
  };

  const handleStartTransformation = () => {
    setTransformationStatus('running');
    message.success('數據轉換已開始');
  };

  const handlePauseTransformation = () => {
    setTransformationStatus('paused');
    message.info('數據轉換已暫停');
  };

  const handleStopTransformation = () => {
    setTransformationStatus('idle');
    message.info('數據轉換已停止');
  };

  // 新增函數：重新整理數據
  const handleRefresh = () => {
    message.success('數據已重新整理');
  };

  // 新增函數：匯出結果
  const handleExportResults = () => {
    const dataStr = JSON.stringify(transformationResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transformation_results_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('轉換結果已匯出');
  };

  // 新增函數：新增轉換規則
  const handleAddTransformation = () => {
    setSelectedTransformation(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 新增函數：新增驗證規則
  const handleAddValidation = () => {
    setValidationModalVisible(true);
  };

  // 新增函數：使用模板
  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateModalVisible(true);
  };

  // 新增函數：執行轉換
  const handleExecuteTransformation = (transformation) => {
    message.info(`執行轉換: ${transformation.name}`);
    // 這裡可以添加執行轉換的邏輯
  };

  // 新增函數：查看結果
  const handleViewResults = (transformation) => {
    message.info(`查看轉換結果: ${transformation.name}`);
    // 這裡可以添加查看結果的邏輯
  };

  return (
    <div>
      <Card title="數據轉換與清洗">
        {/* 轉換狀態和控制 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Space>
                <Text strong>轉換狀態：</Text>
                <Badge 
                  status={
                    transformationStatus === 'running' ? 'processing' :
                    transformationStatus === 'paused' ? 'warning' :
                    transformationStatus === 'completed' ? 'success' : 'default'
                  } 
                  text={
                    transformationStatus === 'running' ? '運行中' :
                    transformationStatus === 'paused' ? '已暫停' :
                    transformationStatus === 'completed' ? '已完成' : '未開始'
                  } 
                />
              </Space>
            </Col>
            <Col span={8}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={handleStartTransformation}
                  disabled={transformationStatus === 'running'}
                >
                  開始轉換
                </Button>
                <Button 
                  icon={<PauseCircleOutlined />}
                  onClick={handlePauseTransformation}
                  disabled={transformationStatus !== 'running'}
                >
                  暫停
                </Button>
                <Button 
                  icon={<StopOutlined />}
                  onClick={handleStopTransformation}
                  disabled={transformationStatus === 'idle'}
                >
                  停止
                </Button>
              </Space>
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                  重新整理
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleExportResults}>
                  匯出結果
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 統計數據 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="轉換規則總數"
                value={stats.totalTransformations}
                prefix={<SyncOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="啟用規則"
                value={stats.activeTransformations}
                valueStyle={{ color: '#3f8600' }}
                prefix={<PlayCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="總處理量"
                value={stats.totalProcessed}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="平均成功率"
                value={stats.avgSuccessRate}
                suffix="%"
                precision={1}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="驗證規則"
                value={stats.totalValidations}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="通過驗證"
                value={stats.passedValidations}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 主要功能標籤頁 */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="轉換規則" key="1">
            <Card 
              title="數據轉換規則" 
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTransformation}>
                  新增轉換規則
                </Button>
              }
            >
              <Table
                columns={transformationColumns}
                dataSource={transformations}
                rowKey="id"
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
                }}
              />
            </Card>
          </TabPane>

          <TabPane tab="數據驗證" key="2">
            <Card 
              title="數據驗證規則" 
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddValidation}>
                  新增驗證規則
                </Button>
              }
            >
              <Table
                columns={validationColumns}
                dataSource={dataValidation}
                rowKey="id"
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
                }}
              />
            </Card>
          </TabPane>

          <TabPane tab="轉換結果" key="3">
            <Card title="數據轉換結果">
              <Table
                columns={resultColumns}
                dataSource={transformationResults}
                rowKey="id"
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
                }}
              />
            </Card>
          </TabPane>

          <TabPane tab="轉換模板" key="4">
            <Card title="常用轉換模板">
              <Collapse defaultActiveKey={['1']}>
                <Panel header="數據格式轉換" key="1">
                  <List
                    size="small"
                    dataSource={[
                      'JSON 到 CSV 轉換',
                      'XML 到 JSON 轉換',
                      'CSV 到 JSON 轉換',
                      'SQL 查詢結果到 JSON 轉換'
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <Space>
                          <FileTextOutlined />
                          <Text>{item}</Text>
                          <Button size="small" type="link" onClick={() => handleUseTemplate(item)}>使用模板</Button>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Panel>
                <Panel header="數據清洗" key="2">
                  <List
                    size="small"
                    dataSource={[
                      '去除重複數據',
                      '填充缺失值',
                      '異常值檢測與處理',
                      '數據標準化'
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <Space>
                          <FilterOutlined />
                          <Text>{item}</Text>
                          <Button size="small" type="link" onClick={() => handleUseTemplate(item)}>使用模板</Button>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Panel>
                <Panel header="數據聚合" key="3">
                  <List
                    size="small"
                    dataSource={[
                      '時間序列聚合',
                      '分組統計',
                      '移動平均計算',
                      '累積值計算'
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <Space>
                          <BarChartOutlined />
                          <Text>{item}</Text>
                          <Button size="small" type="link" onClick={() => handleUseTemplate(item)}>使用模板</Button>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Panel>
              </Collapse>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* 轉換規則編輯模態框 */}
      <Modal
        title="編輯轉換規則"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            form.validateFields().then(values => {
              console.log('轉換規則配置:', values);
              setModalVisible(false);
              message.success('轉換規則配置已保存');
            });
          }}>
            保存
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
                name="name"
                label="轉換名稱"
                rules={[{ required: true, message: '請輸入轉換名稱' }]}
              >
                <Input placeholder="請輸入轉換名稱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="轉換類型"
                rules={[{ required: true, message: '請選擇轉換類型' }]}
              >
                <Select placeholder="請選擇轉換類型">
                  <Option value="normalize">標準化</Option>
                  <Option value="aggregate">聚合</Option>
                  <Option value="transform">轉換</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="inputFormat"
                label="輸入格式"
                rules={[{ required: true, message: '請選擇輸入格式' }]}
              >
                <Select placeholder="請選擇輸入格式">
                  <Option value="JSON">JSON</Option>
                  <Option value="CSV">CSV</Option>
                  <Option value="XML">XML</Option>
                  <Option value="SQL">SQL</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="outputFormat"
                label="輸出格式"
                rules={[{ required: true, message: '請選擇輸出格式' }]}
              >
                <Select placeholder="請選擇輸出格式">
                  <Option value="JSON">JSON</Option>
                  <Option value="CSV">CSV</Option>
                  <Option value="XML">XML</Option>
                  <Option value="SQL">SQL</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="轉換描述"
          >
            <Input.TextArea rows={3} placeholder="請輸入轉換描述" />
          </Form.Item>

          <Form.Item
            name="status"
            label="啟用狀態"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 驗證規則新增模態框 */}
      <Modal
        title="新增驗證規則"
        open={validationModalVisible}
        onCancel={() => setValidationModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setValidationModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            validationForm.validateFields().then(values => {
              console.log('驗證規則配置:', values);
              setValidationModalVisible(false);
              message.success('驗證規則配置已保存');
              validationForm.resetFields();
            });
          }}>
            保存
          </Button>
        ]}
        width={600}
      >
        <Form
          form={validationForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="field"
                label="欄位名稱"
                rules={[{ required: true, message: '請輸入欄位名稱' }]}
              >
                <Input placeholder="請輸入欄位名稱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="rule"
                label="驗證規則"
                rules={[{ required: true, message: '請選擇驗證規則' }]}
              >
                <Select placeholder="請選擇驗證規則">
                  <Option value="範圍檢查">範圍檢查</Option>
                  <Option value="非空檢查">非空檢查</Option>
                  <Option value="格式檢查">格式檢查</Option>
                  <Option value="類型檢查">類型檢查</Option>
                  <Option value="唯一性檢查">唯一性檢查</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="condition"
            label="驗證條件"
            rules={[{ required: true, message: '請輸入驗證條件' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="例如：0 <= value <= 100 或 regex: ^[A-Z]{2}\\d{4}$"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="規則描述"
          >
            <Input.TextArea rows={2} placeholder="請輸入規則描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 模板使用模態框 */}
      <Modal
        title={`使用模板: ${selectedTemplate}`}
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setTemplateModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            templateForm.validateFields().then(values => {
              console.log('模板配置:', values);
              setTemplateModalVisible(false);
              message.success('模板配置已保存');
              templateForm.resetFields();
            });
          }}>
            保存
          </Button>
        ]}
        width={700}
      >
        <Form
          form={templateForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="轉換名稱"
            rules={[{ required: true, message: '請輸入轉換名稱' }]}
          >
            <Input placeholder="請輸入轉換名稱" />
          </Form.Item>

          <Form.Item
            name="description"
            label="轉換描述"
          >
            <Input.TextArea rows={2} placeholder="請輸入轉換描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="inputFormat"
                label="輸入格式"
                rules={[{ required: true, message: '請選擇輸入格式' }]}
              >
                <Select placeholder="請選擇輸入格式">
                  <Option value="JSON">JSON</Option>
                  <Option value="CSV">CSV</Option>
                  <Option value="XML">XML</Option>
                  <Option value="SQL">SQL</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="outputFormat"
                label="輸出格式"
                rules={[{ required: true, message: '請選擇輸出格式' }]}
              >
                <Select placeholder="請選擇輸出格式">
                  <Option value="JSON">JSON</Option>
                  <Option value="CSV">CSV</Option>
                  <Option value="XML">XML</Option>
                  <Option value="SQL">SQL</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="config"
            label="模板配置"
          >
            <Input.TextArea 
              rows={5} 
              placeholder="請輸入模板的具體配置參數"
            />
          </Form.Item>

          <Alert
            message="模板說明"
            description={`您選擇的模板是: ${selectedTemplate}。請根據實際需求調整配置參數。`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default DataTransformation; 