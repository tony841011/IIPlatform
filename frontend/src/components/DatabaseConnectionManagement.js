import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Tag,
  message,
  Alert,
  Divider,
  Typography,
  Row,
  Col,
  Badge,
  Tooltip,
  Progress,
  InputNumber,
  Checkbox,
  Collapse
} from 'antd';
import {
  DatabaseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined,
  SettingOutlined,
  CloudOutlined,
  GlobalOutlined,
  KeyOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const DatabaseConnectionManagement = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [form] = Form.useForm();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/v1/database-connections/');
      // 確保 response.data 是陣列
      const data = Array.isArray(response.data) ? response.data : [];
      setConnections(data);
    } catch (error) {
      console.error('獲取資料庫連線失敗:', error);
      message.error('獲取資料庫連線失敗');
      // 錯誤時設置為空陣列而不是 undefined
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConnection = () => {
    setEditingConnection(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditConnection = (connection) => {
    setEditingConnection(connection);
    form.setFieldsValue({
      name: connection.name,
      db_type: connection.db_type,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: connection.username,
      password: connection.password,
      description: connection.description,
      is_active: connection.is_active,
      is_default: connection.is_default,
      // MongoDB 特定欄位
      auth_source: connection.auth_source,
      auth_mechanism: connection.auth_mechanism,
      replica_set: connection.replica_set,
      ssl_enabled: connection.ssl_enabled,
      ssl_cert_reqs: connection.ssl_cert_reqs,
      max_pool_size: connection.max_pool_size,
      min_pool_size: connection.min_pool_size,
      // InfluxDB 特定欄位
      token: connection.token,
      org: connection.org,
      bucket: connection.bucket,
      // 連線設定
      timeout: connection.timeout,
      retry_attempts: connection.retry_attempts,
      connection_pool_size: connection.connection_pool_size
    });
    setModalVisible(true);
  };

  const handleDeleteConnection = async (connection) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/database-connections/${connection.id}`);
      message.success('連線刪除成功');
      fetchConnections();
    } catch (error) {
      message.error('連線刪除失敗');
    }
  };

  const handleTestConnection = async (connection) => {
    try {
      setTestResults(prev => ({ ...prev, [connection.id]: 'testing' }));
      const response = await axios.post(`http://localhost:8000/api/v1/database-connections/${connection.id}/test`);
      setTestResults(prev => ({ ...prev, [connection.id]: 'success' }));
      message.success('連線測試成功');
    } catch (error) {
      setTestResults(prev => ({ ...prev, [connection.id]: 'error' }));
      message.error('連線測試失敗');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const connectionData = {
        ...values,
        connection_string: generateConnectionString(values)
      };

      if (editingConnection) {
        await axios.put(`http://localhost:8000/api/v1/database-connections/${editingConnection.id}`, connectionData);
        message.success('連線更新成功');
      } else {
        await axios.post('http://localhost:8000/api/v1/database-connections/', connectionData);
        message.success('連線創建成功');
      }

      setModalVisible(false);
      fetchConnections();
    } catch (error) {
      message.error('操作失敗');
    }
  };

  // 生成連線字串
  const generateConnectionString = (values) => {
    const { db_type, host, port, database, username, password, auth_source, auth_mechanism, replica_set, ssl_enabled } = values;

    // 對用戶名和密碼進行 URL 編碼
    const encodedUsername = encodeURIComponent(username || '');
    const encodedPassword = encodeURIComponent(password || '');

    switch (db_type) {
      case 'postgresql':
        return `postgresql://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
      case 'mysql':
        return `mysql://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
      case 'mongodb':
        let mongoUrl = `mongodb://`;
        if (username && password) {
          mongoUrl += `${encodedUsername}:${encodedPassword}@`;
        }
        mongoUrl += `${host}:${port}/${database}`;
        
        // 添加 MongoDB 特定參數
        const params = [];
        if (auth_source) params.push(`authSource=${auth_source}`);
        if (auth_mechanism) params.push(`authMechanism=${auth_mechanism}`);
        if (replica_set) params.push(`replicaSet=${replica_set}`);
        if (ssl_enabled) params.push('ssl=true');
        
        if (params.length > 0) {
          mongoUrl += `?${params.join('&')}`;
        }
        return mongoUrl;
      case 'influxdb':
        return `http://${host}:${port}`;
      case 'oracle':
        return `oracle://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
      case 'sqlserver':
        return `mssql://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
      default:
        return `unknown://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
    }
  };

  // 根據資料庫類型獲取預設埠號
  const getDefaultPort = (dbType) => {
    const defaultPorts = {
      postgresql: 5432,
      mysql: 3306,
      mongodb: 27017,
      influxdb: 8086,
      oracle: 1521,
      sqlserver: 1433
    };
    return defaultPorts[dbType] || 0;
  };

  // 資料庫類型選項
  const dbTypeOptions = [
    { value: 'postgresql', label: 'PostgreSQL', icon: <DatabaseOutlined /> },
    { value: 'mysql', label: 'MySQL', icon: <DatabaseOutlined /> },
    { value: 'mongodb', label: 'MongoDB', icon: <CloudOutlined /> },
    { value: 'influxdb', label: 'InfluxDB', icon: <GlobalOutlined /> },
    { value: 'oracle', label: 'Oracle', icon: <DatabaseOutlined /> },
    { value: 'sqlserver', label: 'SQL Server', icon: <DatabaseOutlined /> }
  ];

  const columns = [
    {
      title: '連線名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <DatabaseOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: '資料庫類型',
      dataIndex: 'db_type',
      key: 'db_type',
      render: (type) => {
        const option = dbTypeOptions.find(opt => opt.value === type);
        return (
          <Tag color={
            type === 'postgresql' ? 'blue' :
            type === 'mongodb' ? 'green' :
            type === 'influxdb' ? 'orange' :
            type === 'mysql' ? 'purple' :
            type === 'oracle' ? 'red' :
            type === 'sqlserver' ? 'cyan' : 'default'
          }>
            {option ? option.label : type.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: '主機',
      dataIndex: 'host',
      key: 'host',
      render: (host, record) => (
        <Space>
          <Text>{host}</Text>
          <Text type="secondary">:{record.port}</Text>
        </Space>
      ),
    },
    {
      title: '資料庫',
      dataIndex: 'database',
      key: 'database',
    },
    {
      title: '狀態',
      key: 'status',
      render: (_, record) => {
        const testResult = testResults[record.id];
        return (
          <Space>
            <Badge
              status={
                testResult === 'success' ? 'success' :
                testResult === 'error' ? 'error' :
                testResult === 'testing' ? 'processing' : 'default'
              }
            />
            <Button
              size="small"
              onClick={() => handleTestConnection(record)}
              loading={testResult === 'testing'}
            >
              測試連線
            </Button>
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditConnection(record)}
          >
            編輯
          </Button>
          <Button
            type="link"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteConnection(record)}
          >
            刪除
          </Button>
        </Space>
      ),
    },
  ];

  // 安全的資料處理
  const safeConnections = Array.isArray(connections) ? connections : [];
  const safeColumns = Array.isArray(columns) ? columns : [];

  // 檢查資料有效性
  useEffect(() => {
    if (connections && !Array.isArray(connections)) {
      console.warn('connections 不是陣列:', connections);
      setConnections([]);
    }
  }, [connections]);

  // 安全的表格配置
  const tableConfig = {
    columns: safeColumns,
    dataSource: safeConnections,
    rowKey: (record) => record?.id || record?.key || Math.random().toString(),
    loading: loading,
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
    },
    scroll: { x: 'max-content' },
    size: 'small',
    bordered: true
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <DatabaseOutlined style={{ marginRight: '8px' }} />
        資料庫連線管理
      </Title>

      <Alert
        message="遠端資料庫連線設定"
        description="支援連線到不同網段的遠端資料庫，包括 PostgreSQL、MySQL、MongoDB、InfluxDB、Oracle、SQL Server 等"
        type="info"
        showIcon
        style={{ marginBottom: '16px' }}
      />

      <Card
        title="資料庫連線列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateConnection}
          >
            新增連線
          </Button>
        }
      >
        <Table {...tableConfig} />
      </Card>

      <Modal
        title={editingConnection ? '編輯資料庫連線' : '新增資料庫連線'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="連線名稱"
                rules={[{ required: true, message: '請輸入連線名稱！' }]}
              >
                <Input placeholder="例如：生產環境 PostgreSQL" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="db_type"
                label="資料庫類型"
                rules={[{ required: true, message: '請選擇資料庫類型！' }]}
              >
                <Select
                  placeholder="選擇資料庫類型"
                  onChange={(value) => {
                    const defaultPort = getDefaultPort(value);
                    form.setFieldsValue({ port: defaultPort });
                  }}
                >
                  {dbTypeOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      <Space>
                        {option.icon}
                        {option.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="host"
                label="主機地址"
                rules={[{ required: true, message: '請輸入主機地址！' }]}
              >
                <Input placeholder="例如：192.168.1.100 或 db.example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="port"
                label="埠號"
                rules={[{ required: true, message: '請輸入埠號！' }]}
              >
                <InputNumber
                  placeholder="埠號"
                  style={{ width: '100%' }}
                  min={1}
                  max={65535}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="database"
                label="資料庫名稱"
                rules={[{ required: true, message: '請輸入資料庫名稱！' }]}
              >
                <Input placeholder="資料庫名稱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用戶名"
              >
                <Input placeholder="資料庫用戶名" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="password"
            label="密碼"
          >
            <Input.Password placeholder="資料庫密碼" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="連線描述" rows={2} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="is_active"
                label="啟用狀態"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_default"
                label="預設連線"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          {/* 進階設定 */}
          <Collapse ghost>
            <Panel header="進階設定" key="advanced">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="timeout"
                    label="連線超時 (秒)"
                  >
                    <InputNumber
                      placeholder="30"
                      style={{ width: '100%' }}
                      min={1}
                      max={300}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="retry_attempts"
                    label="重試次數"
                  >
                    <InputNumber
                      placeholder="3"
                      style={{ width: '100%' }}
                      min={0}
                      max={10}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="connection_pool_size"
                    label="連線池大小"
                  >
                    <InputNumber
                      placeholder="10"
                      style={{ width: '100%' }}
                      min={1}
                      max={100}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* MongoDB 特定設定 */}
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.db_type !== currentValues.db_type}
              >
                {({ getFieldValue }) => {
                  const dbType = getFieldValue('db_type');
                  if (dbType === 'mongodb') {
                    return (
                      <div>
                        <Divider>MongoDB 特定設定</Divider>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="auth_source"
                              label="認證資料庫"
                            >
                              <Input placeholder="admin" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="auth_mechanism"
                              label="認證機制"
                            >
                              <Select placeholder="選擇認證機制">
                                <Option value="SCRAM-SHA-1">SCRAM-SHA-1</Option>
                                <Option value="SCRAM-SHA-256">SCRAM-SHA-256</Option>
                                <Option value="MONGODB-CR">MONGODB-CR</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="replica_set"
                              label="複製集名稱"
                            >
                              <Input placeholder="複製集名稱" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="ssl_enabled"
                              label="SSL 連線"
                              valuePropName="checked"
                            >
                              <Switch />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    );
                  }
                  return null;
                }}
              </Form.Item>

              {/* InfluxDB 特定設定 */}
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.db_type !== currentValues.db_type}
              >
                {({ getFieldValue }) => {
                  const dbType = getFieldValue('db_type');
                  if (dbType === 'influxdb') {
                    return (
                      <div>
                        <Divider>InfluxDB 特定設定</Divider>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="token"
                              label="API Token"
                            >
                              <Input.Password placeholder="InfluxDB API Token" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="org"
                              label="組織"
                            >
                              <Input placeholder="組織名稱" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item
                          name="bucket"
                          label="儲存桶"
                        >
                          <Input placeholder="儲存桶名稱" />
                        </Form.Item>
                      </div>
                    );
                  }
                  return null;
                }}
              </Form.Item>
            </Panel>
          </Collapse>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingConnection ? '更新' : '創建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DatabaseConnectionManagement;