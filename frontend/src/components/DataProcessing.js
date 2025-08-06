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
  Steps,
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
  TimePicker
} from 'antd';
import { 
  DatabaseOutlined, 
  ApiOutlined, 
  SyncOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SettingOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  LineChartOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const DataProcessing = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [processingStatus, setProcessingStatus] = useState('idle'); // idle, running, paused, completed
  const [dataSources, setDataSources] = useState([
    {
      id: 1,
      name: 'MQTT 溫度數據',
      type: 'mqtt',
      status: 'connected',
      lastUpdate: '2024-01-15 14:30:00',
      dataCount: 1250,
      processingRules: 3
    },
    {
      id: 2,
      name: 'Modbus 壓力數據',
      type: 'modbus',
      status: 'connected',
      lastUpdate: '2024-01-15 14:28:00',
      dataCount: 890,
      processingRules: 2
    },
    {
      id: 3,
      name: 'PostgreSQL 設備數據',
      type: 'postgresql',
      status: 'connected',
      lastUpdate: '2024-01-15 14:25:00',
      dataCount: 456,
      processingRules: 1
    },
    {
      id: 4,
      name: 'MongoDB 日誌數據',
      type: 'mongodb',
      status: 'disconnected',
      lastUpdate: '2024-01-15 13:45:00',
      dataCount: 0,
      processingRules: 0
    }
  ]);

  const [processingRules, setProcessingRules] = useState([
    {
      id: 1,
      name: '溫度異常檢測',
      source: 'MQTT 溫度數據',
      type: 'filter',
      status: 'active',
      description: '檢測溫度超過閾值的異常數據',
      lastRun: '2024-01-15 14:30:00',
      processedCount: 1250,
      outputCount: 45
    },
    {
      id: 2,
      name: '數據聚合計算',
      source: 'Modbus 壓力數據',
      type: 'aggregate',
      status: 'active',
      description: '每5分鐘計算平均壓力值',
      lastRun: '2024-01-15 14:28:00',
      processedCount: 890,
      outputCount: 178
    },
    {
      id: 3,
      name: '數據格式轉換',
      source: 'PostgreSQL 設備數據',
      type: 'transform',
      status: 'inactive',
      description: '將設備狀態轉換為標準格式',
      lastRun: '2024-01-15 14:25:00',
      processedCount: 456,
      outputCount: 456
    }
  ]);

  const [processedData, setProcessedData] = useState([
    {
      id: 1,
      timestamp: '2024-01-15 14:30:00',
      source: 'MQTT 溫度數據',
      rule: '溫度異常檢測',
      originalValue: 87.5,
      processedValue: '異常',
      status: 'processed',
      confidence: 0.95
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:28:00',
      source: 'Modbus 壓力數據',
      rule: '數據聚合計算',
      originalValue: '2.5, 2.6, 2.4, 2.7, 2.5',
      processedValue: 2.54,
      status: 'processed',
      confidence: 1.0
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:25:00',
      source: 'PostgreSQL 設備數據',
      rule: '數據格式轉換',
      originalValue: 'ONLINE',
      processedValue: 'online',
      status: 'processed',
      confidence: 1.0
    }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [dataSourceModalVisible, setDataSourceModalVisible] = useState(false);
  const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [form] = Form.useForm();
  const [ruleForm] = Form.useForm();
  const [dataSourceForm] = Form.useForm();
  const [pipelineForm] = Form.useForm();
  
  // 新增狀態
  const [availableProcessors, setAvailableProcessors] = useState([]);
  const [currentPipeline, setCurrentPipeline] = useState([]);
  const [processingResults, setProcessingResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 統計數據
  const stats = {
    totalSources: dataSources.length,
    connectedSources: dataSources.filter(s => s.status === 'connected').length,
    totalRules: processingRules.length,
    activeRules: processingRules.filter(r => r.status === 'active').length,
    totalProcessed: processedData.length,
    todayProcessed: processedData.filter(d => d.timestamp.includes('2024-01-15')).length
  };

  const dataSourceColumns = [
    {
      title: '數據源名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.type === 'mqtt' && <ApiOutlined style={{ color: '#1890ff' }} />}
          {record.type === 'modbus' && <ThunderboltOutlined style={{ color: '#52c41a' }} />}
          {record.type === 'postgresql' && <DatabaseOutlined style={{ color: '#722ed1' }} />}
          {record.type === 'mongodb' && <DatabaseOutlined style={{ color: '#13c2c2' }} />}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={
          type === 'mqtt' ? 'blue' :
          type === 'modbus' ? 'green' :
          type === 'postgresql' ? 'purple' : 'cyan'
        }>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'connected' ? 'success' : 'error'} 
          text={status === 'connected' ? '已連線' : '未連線'} 
        />
      ),
    },
    {
      title: '最後更新',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
    },
    {
      title: '數據量',
      dataIndex: 'dataCount',
      key: 'dataCount',
      sorter: (a, b) => a.dataCount - b.dataCount,
    },
    {
      title: '處理規則',
      dataIndex: 'processingRules',
      key: 'processingRules',
      sorter: (a, b) => a.processingRules - b.processingRules,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看數據">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => {
                message.info(`查看數據源: ${record.name}`);
                // 這裡可以添加查看數據的邏輯
              }}
            />
          </Tooltip>
          <Tooltip title="配置">
            <Button 
              type="text" 
              icon={<SettingOutlined />} 
              size="small"
              onClick={() => {
                message.info(`配置數據源: ${record.name}`);
                // 這裡可以添加配置的邏輯
              }}
            />
          </Tooltip>
          <Tooltip title="測試連線">
            <Button 
              type="text" 
              icon={<SyncOutlined />} 
              size="small"
              onClick={() => {
                message.info(`測試連線: ${record.name}`);
                // 這裡可以添加測試連線的邏輯
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const ruleColumns = [
    {
      title: '規則名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.type === 'filter' && <FilterOutlined style={{ color: '#1890ff' }} />}
          {record.type === 'aggregate' && <BarChartOutlined style={{ color: '#52c41a' }} />}
          {record.type === 'transform' && <SyncOutlined style={{ color: '#722ed1' }} />}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '數據源',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = { filter: 'blue', aggregate: 'green', transform: 'purple' };
        const labels = { filter: '過濾', aggregate: '聚合', transform: '轉換' };
        return <Tag color={colors[type]}>{labels[type]}</Tag>;
      },
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
      title: '最後執行',
      dataIndex: 'lastRun',
      key: 'lastRun',
    },
    {
      title: '處理數量',
      dataIndex: 'processedCount',
      key: 'processedCount',
      sorter: (a, b) => a.processedCount - b.processedCount,
    },
    {
      title: '輸出數量',
      dataIndex: 'outputCount',
      key: 'outputCount',
      sorter: (a, b) => a.outputCount - b.outputCount,
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
              onClick={() => handleEditRule(record)}
            />
          </Tooltip>
          <Tooltip title="執行">
            <Button 
              type="text" 
              icon={<PlayCircleOutlined />} 
              size="small"
              onClick={() => {
                message.info(`執行規則: ${record.name}`);
                // 這裡可以添加執行規則的邏輯
              }}
            />
          </Tooltip>
          <Tooltip title="刪除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
              onClick={() => {
                message.warning(`刪除規則: ${record.name}`);
                // 這裡可以添加刪除規則的邏輯
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const processedDataColumns = [
    {
      title: '時間戳',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: '數據源',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: '處理規則',
      dataIndex: 'rule',
      key: 'rule',
    },
    {
      title: '原始值',
      dataIndex: 'originalValue',
      key: 'originalValue',
      render: (value) => <Text code>{String(value)}</Text>,
    },
    {
      title: '處理後值',
      dataIndex: 'processedValue',
      key: 'processedValue',
      render: (value) => <Text strong>{String(value)}</Text>,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'processed' ? 'green' : 'orange'}>
          {status === 'processed' ? '已處理' : '處理中'}
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
    },
  ];

  const handleEditRule = (rule) => {
    setSelectedRule(rule);
    ruleForm.setFieldsValue(rule);
    setRuleModalVisible(true);
  };

  const handleStartProcessing = () => {
    setProcessingStatus('running');
    message.success('數據處理已開始');
  };

  const handlePauseProcessing = () => {
    setProcessingStatus('paused');
    message.info('數據處理已暫停');
  };

  const handleStopProcessing = () => {
    setProcessingStatus('idle');
    message.info('數據處理已停止');
  };

  // 新增函數：獲取可用處理器
  const fetchAvailableProcessors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/data-processing/available-processors');
      const data = await response.json();
      if (data.success) {
        setAvailableProcessors(data.processors);
      }
    } catch (error) {
      console.error('獲取處理器失敗:', error);
      message.error('獲取處理器列表失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // 新增函數：獲取當前處理管道
  const fetchCurrentPipeline = async () => {
    try {
      const response = await fetch('/api/v1/data-processing/pipeline');
      const data = await response.json();
      if (data.success) {
        setCurrentPipeline(data.pipeline);
      }
    } catch (error) {
      console.error('獲取處理管道失敗:', error);
    }
  };

  // 新增函數：設置處理管道
  const setProcessingPipeline = async (pipeline) => {
    try {
      const response = await fetch('/api/v1/data-processing/set-pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pipeline),
      });
      const data = await response.json();
      if (data.success) {
        message.success('處理管道設置成功');
        setCurrentPipeline(pipeline);
      }
    } catch (error) {
      console.error('設置處理管道失敗:', error);
      message.error('設置處理管道失敗');
    }
  };

  // 新增函數：添加數據源
  const addDataSource = async (sourceConfig) => {
    try {
      const response = await fetch('/api/v1/data-processing/add-data-source', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sourceConfig),
      });
      const data = await response.json();
      if (data.success) {
        message.success('數據源添加成功');
        // 重新獲取數據源列表
        // fetchDataSources();
      }
    } catch (error) {
      console.error('添加數據源失敗:', error);
      message.error('添加數據源失敗');
    }
  };

  // 新增函數：處理 MQTT 數據
  const processMqttData = async (topic, payload) => {
    try {
      const response = await fetch('/api/v1/data-processing/process-mqtt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, payload }),
      });
      const data = await response.json();
      if (data.success) {
        setProcessingResults(prev => [data, ...prev.slice(0, 9)]);
        message.success('MQTT 數據處理成功');
      } else {
        message.error(`處理失敗: ${data.error_message}`);
      }
      return data;
    } catch (error) {
      console.error('處理 MQTT 數據失敗:', error);
      message.error('處理 MQTT 數據失敗');
    }
  };

  // 新增函數：處理 Modbus 數據
  const processModbusData = async (deviceId, registers) => {
    try {
      const response = await fetch('/api/v1/data-processing/process-modbus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device_id: deviceId, registers }),
      });
      const data = await response.json();
      if (data.success) {
        setProcessingResults(prev => [data, ...prev.slice(0, 9)]);
        message.success('Modbus 數據處理成功');
      } else {
        message.error(`處理失敗: ${data.error_message}`);
      }
      return data;
    } catch (error) {
      console.error('處理 Modbus 數據失敗:', error);
      message.error('處理 Modbus 數據失敗');
    }
  };

  // 新增函數：處理資料庫數據
  const processDatabaseData = async (sourceId, queryResult) => {
    try {
      const response = await fetch('/api/v1/data-processing/process-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source_id: sourceId, query_result: queryResult }),
      });
      const data = await response.json();
      if (data.success) {
        setProcessingResults(prev => [data, ...prev.slice(0, 9)]);
        message.success('資料庫數據處理成功');
      } else {
        message.error(`處理失敗: ${data.error_message}`);
      }
      return data;
    } catch (error) {
      console.error('處理資料庫數據失敗:', error);
      message.error('處理資料庫數據失敗');
    }
  };

  // 組件載入時獲取數據
  React.useEffect(() => {
    fetchAvailableProcessors();
    fetchCurrentPipeline();
  }, []);

  // 新增函數：重新整理數據
  const handleRefresh = () => {
    fetchAvailableProcessors();
    fetchCurrentPipeline();
    message.success('數據已重新整理');
  };

  // 新增函數：匯出結果
  const handleExportResults = () => {
    const dataStr = JSON.stringify(processingResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data_processing_results_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('結果已匯出');
  };

  // 新增函數：新增數據源
  const handleAddDataSource = () => {
    setDataSourceModalVisible(true);
  };

  // 新增函數：新增規則
  const handleAddRule = () => {
    setRuleModalVisible(true);
  };

  // 新增函數：配置管道
  const handleConfigurePipeline = () => {
    setPipelineModalVisible(true);
  };

  return (
    <div>
      <Card title="數據處理中心">
        {/* 處理狀態和控制 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Space>
                <Text strong>處理狀態：</Text>
                <Badge 
                  status={
                    processingStatus === 'running' ? 'processing' :
                    processingStatus === 'paused' ? 'warning' :
                    processingStatus === 'completed' ? 'success' : 'default'
                  } 
                  text={
                    processingStatus === 'running' ? '運行中' :
                    processingStatus === 'paused' ? '已暫停' :
                    processingStatus === 'completed' ? '已完成' : '未開始'
                  } 
                />
              </Space>
            </Col>
            <Col span={8}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={handleStartProcessing}
                  disabled={processingStatus === 'running'}
                >
                  開始處理
                </Button>
                <Button 
                  icon={<PauseCircleOutlined />}
                  onClick={handlePauseProcessing}
                  disabled={processingStatus !== 'running'}
                >
                  暫停
                </Button>
                <Button 
                  icon={<StopOutlined />}
                  onClick={handleStopProcessing}
                  disabled={processingStatus === 'idle'}
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
                title="數據源總數"
                value={stats.totalSources}
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="已連線源"
                value={stats.connectedSources}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="處理規則"
                value={stats.totalRules}
                prefix={<SettingOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="啟用規則"
                value={stats.activeRules}
                valueStyle={{ color: '#1890ff' }}
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
                title="今日處理"
                value={stats.todayProcessed}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 主要功能標籤頁 */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="數據源管理" key="1">
            <Card 
              title="數據源列表" 
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDataSource}>
                  新增數據源
                </Button>
              }
            >
              <Table
                columns={dataSourceColumns}
                dataSource={dataSources}
                rowKey="id"
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
                }}
              />
            </Card>
          </TabPane>

          <TabPane tab="處理規則" key="2">
            <Card 
              title="處理規則配置" 
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRule}>
                  新增規則
                </Button>
              }
            >
              <Table
                columns={ruleColumns}
                dataSource={processingRules}
                rowKey="id"
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
                }}
              />
            </Card>
          </TabPane>

          <TabPane tab="處理結果" key="3">
            <Card title="數據處理結果">
              <Table
                columns={processedDataColumns}
                dataSource={processedData}
                rowKey="id"
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
                }}
              />
            </Card>
          </TabPane>

          <TabPane tab="處理流程" key="4">
            <Card title="數據處理流程圖">
              <Steps direction="vertical" current={1}>
                <Step 
                  title="數據接收" 
                  description="從各種數據源接收原始數據"
                  icon={<DatabaseOutlined />}
                />
                <Step 
                  title="數據驗證" 
                  description="驗證數據格式和完整性"
                  icon={<CheckCircleOutlined />}
                />
                <Step 
                  title="數據轉換" 
                  description="應用處理規則進行數據轉換"
                  icon={<SyncOutlined />}
                />
                <Step 
                  title="數據聚合" 
                  description="對數據進行聚合計算"
                  icon={<BarChartOutlined />}
                />
                <Step 
                  title="結果輸出" 
                  description="將處理結果輸出到目標系統"
                  icon={<DownloadOutlined />}
                />
              </Steps>
            </Card>
          </TabPane>

          <TabPane tab="處理管道配置" key="5">
            <Card title="處理管道配置">
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={12}>
                  <Card size="small" title="可用處理器">
                    <List
                      size="small"
                      dataSource={availableProcessors}
                      renderItem={(processor) => (
                        <List.Item>
                          <Text code>{processor}</Text>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="當前處理管道">
                    <List
                      size="small"
                      dataSource={currentPipeline}
                      renderItem={(step, index) => (
                        <List.Item>
                          <Space>
                            <Text strong>{index + 1}.</Text>
                            <Text code>{step}</Text>
                          </Space>
                        </List.Item>
                      )}
                    />
                    <Button 
                      type="primary" 
                      size="small" 
                      style={{ marginTop: 8 }}
                      onClick={handleConfigurePipeline}
                    >
                      配置管道
                    </Button>
                  </Card>
                </Col>
              </Row>
              
              <Card size="small" title="快速處理測試">
                <Row gutter={16}>
                  <Col span={8}>
                    <Card size="small" title="MQTT 數據測試">
                      <Form layout="vertical" size="small" id="mqtt-test-form">
                        <Form.Item label="Topic" name="topic">
                          <Input placeholder="iot/device1/data" />
                        </Form.Item>
                        <Form.Item label="Payload" name="payload">
                          <Input.TextArea 
                            placeholder='{"temperature": 25.5, "humidity": 60}' 
                            rows={3}
                          />
                        </Form.Item>
                        <Button 
                          type="primary" 
                          size="small"
                          onClick={() => {
                            const form = document.getElementById('mqtt-test-form');
                            const topic = form.querySelector('[name="topic"]').value || "iot/device1/data";
                            const payloadText = form.querySelector('[name="payload"]').value || '{"temperature": 25.5, "humidity": 60}';
                            let payload;
                            try {
                              payload = JSON.parse(payloadText);
                            } catch (e) {
                              message.error('Payload 格式錯誤，請檢查 JSON 格式');
                              return;
                            }
                            processMqttData(topic, payload);
                          }}
                        >
                          處理 MQTT 數據
                        </Button>
                      </Form>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" title="Modbus 數據測試">
                      <Form layout="vertical" size="small" id="modbus-test-form">
                        <Form.Item label="設備 ID" name="deviceId">
                          <Input placeholder="modbus_device_1" />
                        </Form.Item>
                        <Form.Item label="寄存器值" name="registers">
                          <Input placeholder="[100, 200, 300]" />
                        </Form.Item>
                        <Button 
                          type="primary" 
                          size="small"
                          onClick={() => {
                            const form = document.getElementById('modbus-test-form');
                            const deviceId = form.querySelector('[name="deviceId"]').value || "modbus_device_1";
                            const registersText = form.querySelector('[name="registers"]').value || "[100, 200, 300]";
                            let registers;
                            try {
                              registers = JSON.parse(registersText);
                            } catch (e) {
                              message.error('寄存器值格式錯誤，請檢查 JSON 格式');
                              return;
                            }
                            processModbusData(deviceId, registers);
                          }}
                        >
                          處理 Modbus 數據
                        </Button>
                      </Form>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" title="資料庫數據測試">
                      <Form layout="vertical" size="small" id="database-test-form">
                        <Form.Item label="數據源 ID" name="sourceId">
                          <Input placeholder="postgresql_source" />
                        </Form.Item>
                        <Form.Item label="查詢結果" name="queryResult">
                          <Input.TextArea 
                            placeholder='{"rows": [{"id": 1, "value": 100}]}' 
                            rows={3}
                          />
                        </Form.Item>
                        <Button 
                          type="primary" 
                          size="small"
                          onClick={() => {
                            const form = document.getElementById('database-test-form');
                            const sourceId = form.querySelector('[name="sourceId"]').value || "postgresql_source";
                            const queryResultText = form.querySelector('[name="queryResult"]').value || '{"rows": [{"id": 1, "value": 100}]}';
                            let queryResult;
                            try {
                              queryResult = JSON.parse(queryResultText);
                            } catch (e) {
                              message.error('查詢結果格式錯誤，請檢查 JSON 格式');
                              return;
                            }
                            processDatabaseData(sourceId, queryResult);
                          }}
                        >
                          處理資料庫數據
                        </Button>
                      </Form>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Card>
          </TabPane>

          <TabPane tab="處理結果" key="6">
            <Card title="即時處理結果">
              <List
                dataSource={processingResults}
                renderItem={(result, index) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`處理結果 ${index + 1}`}
                      description={
                        <Space direction="vertical" size="small">
                          <Text>成功: {result.success ? '是' : '否'}</Text>
                          {result.processing_time && (
                            <Text>處理時間: {result.processing_time.toFixed(3)}秒</Text>
                          )}
                          {result.error_message && (
                            <Text type="danger">錯誤: {result.error_message}</Text>
                          )}
                          <Text>數據: {JSON.stringify(result.data, null, 2)}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* 規則編輯模態框 */}
      <Modal
        title="編輯處理規則"
        open={ruleModalVisible}
        onCancel={() => setRuleModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setRuleModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            ruleForm.validateFields().then(values => {
              console.log('規則配置:', values);
              setRuleModalVisible(false);
              message.success('規則配置已保存');
            });
          }}>
            保存
          </Button>
        ]}
        width={600}
      >
        <Form
          form={ruleForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="規則名稱"
                rules={[{ required: true, message: '請輸入規則名稱' }]}
              >
                <Input placeholder="請輸入規則名稱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="規則類型"
                rules={[{ required: true, message: '請選擇規則類型' }]}
              >
                <Select placeholder="請選擇規則類型">
                  <Option value="filter">過濾</Option>
                  <Option value="aggregate">聚合</Option>
                  <Option value="transform">轉換</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="source"
            label="數據源"
            rules={[{ required: true, message: '請選擇數據源' }]}
          >
            <Select placeholder="請選擇數據源">
              {dataSources.map(source => (
                <Option key={source.id} value={source.name}>{source.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="規則描述"
          >
            <Input.TextArea rows={3} placeholder="請輸入規則描述" />
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

      {/* 數據源新增模態框 */}
      <Modal
        title="新增數據源"
        open={dataSourceModalVisible}
        onCancel={() => setDataSourceModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDataSourceModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            dataSourceForm.validateFields().then(values => {
              console.log('數據源配置:', values);
              addDataSource(values);
              setDataSourceModalVisible(false);
              dataSourceForm.resetFields();
            });
          }}>
            保存
          </Button>
        ]}
        width={600}
      >
        <Form
          form={dataSourceForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="source_id"
                label="數據源 ID"
                rules={[{ required: true, message: '請輸入數據源 ID' }]}
              >
                <Input placeholder="請輸入數據源 ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="數據源類型"
                rules={[{ required: true, message: '請選擇數據源類型' }]}
              >
                <Select placeholder="請選擇數據源類型">
                  <Option value="mqtt">MQTT</Option>
                  <Option value="modbus">Modbus</Option>
                  <Option value="postgresql">PostgreSQL</Option>
                  <Option value="mongodb">MongoDB</Option>
                  <Option value="influxdb">InfluxDB</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="數據源描述"
          >
            <Input.TextArea rows={3} placeholder="請輸入數據源描述" />
          </Form.Item>

          <Form.Item
            name="config"
            label="配置參數"
          >
            <Input.TextArea 
              rows={5} 
              placeholder='{"min_temperature": -50, "max_temperature": 150}'
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 處理管道配置模態框 */}
      <Modal
        title="配置處理管道"
        open={pipelineModalVisible}
        onCancel={() => setPipelineModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPipelineModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            pipelineForm.validateFields().then(values => {
              const pipeline = values.pipeline.split(',').map(p => p.trim()).filter(p => p);
              setProcessingPipeline(pipeline);
              setPipelineModalVisible(false);
              pipelineForm.resetFields();
            });
          }}>
            保存
          </Button>
        ]}
        width={600}
      >
        <Form
          form={pipelineForm}
          layout="vertical"
        >
          <Form.Item
            name="pipeline"
            label="處理管道"
            rules={[{ required: true, message: '請輸入處理管道' }]}
            extra="請用逗號分隔處理器名稱，例如：temperature_filter, range_validation, unit_conversion"
          >
            <Input.TextArea 
              rows={5} 
              placeholder="temperature_filter, range_validation, unit_conversion, statistical_aggregate"
            />
          </Form.Item>

          <Form.Item label="可用處理器">
            <Text type="secondary">
              可用的處理器：{availableProcessors.join(', ')}
            </Text>
          </Form.Item>

          <Form.Item label="預設管道">
            <Space direction="vertical">
              <Button 
                size="small" 
                onClick={() => pipelineForm.setFieldsValue({pipeline: 'temperature_filter, range_validation, unit_conversion'})}
              >
                溫度處理管道
              </Button>
              <Button 
                size="small" 
                onClick={() => pipelineForm.setFieldsValue({pipeline: 'pressure_filter, range_validation, statistical_aggregate'})}
              >
                壓力處理管道
              </Button>
              <Button 
                size="small" 
                onClick={() => pipelineForm.setFieldsValue({pipeline: 'outlier_filter, range_validation, min_max_normalize'})}
              >
                標準化處理管道
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DataProcessing; 