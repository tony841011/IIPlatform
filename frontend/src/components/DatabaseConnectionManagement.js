import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  message,
  Alert,
  Switch,
  InputNumber,
  Typography,
  Divider,
  Tooltip,
  Popconfirm,
  Badge,
  Progress,
  Collapse
} from 'antd';
import {
  DatabaseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  KeyOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

const DatabaseConnectionManagement = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [testLoading, setTestLoading] = useState({});
  const [form] = Form.useForm();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/database-connections/');
      setConnections(response.data);
    } catch (error) {
      message.error('獲取資料庫連線列表失敗');
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConnection = async (values) => {
    try {
      setLoading(true);
      
      // 根據資料庫類型構建連線字串
      let connectionString = '';
      if (values.db_type === 'sqlite') {
        connectionString = `sqlite:///${values.database}`;
      } else if (values.db_type === 'mysql') {
        connectionString = `mysql+pymysql://${values.username}:${values.password}@${values.host}:${values.port}/${values.database}`;
      } else if (values.db_type === 'postgresql') {
        connectionString = `postgresql://${values.username}:${values.password}@${values.host}:${values.port}/${values.database}`;
      } else if (values.db_type === 'oracle') {
        connectionString = `oracle://${values.username}:${values.password}@${values.host}:${values.port}/${values.database}`;
      } else if (values.db_type === 'mssql') {
        connectionString = `mssql+pyodbc://${values.username}:${values.password}@${values.host}:${values.port}/${values.database}`;
      } else if (values.db_type === 'mongodb') {
        // MongoDB 連線字串格式
        let mongoUrl = 'mongodb://';
        if (values.username && values.password) {
          mongoUrl += `${values.username}:${values.password}@`;
        }
        mongoUrl += `${values.host}:${values.port}/${values.database}`;
        
        // 添加 MongoDB 特定參數
        const mongoParams = [];
        if (values.auth_source) mongoParams.push(`authSource=${values.auth_source}`);
        if (values.auth_mechanism) mongoParams.push(`authMechanism=${values.auth_mechanism}`);
        if (values.replica_set) mongoParams.push(`replicaSet=${values.replica_set}`);
        if (values.ssl_enabled) mongoParams.push('ssl=true');
        if (values.max_pool_size) mongoParams.push(`maxPoolSize=${values.max_pool_size}`);
        if (values.min_pool_size) mongoParams.push(`minPoolSize=${values.min_pool_size}`);
        if (values.max_idle_time_ms) mongoParams.push(`maxIdleTimeMS=${values.max_idle_time_ms}`);
        if (values.server_selection_timeout_ms) mongoParams.push(`serverSelectionTimeoutMS=${values.server_selection_timeout_ms}`);
        if (values.socket_timeout_ms) mongoParams.push(`socketTimeoutMS=${values.socket_timeout_ms}`);
        if (values.connect_timeout_ms) mongoParams.push(`connectTimeoutMS=${values.connect_timeout_ms}`);
        if (values.retry_writes) mongoParams.push('retryWrites=true');
        if (values.retry_reads) mongoParams.push('retryReads=true');
        if (values.read_preference) mongoParams.push(`readPreference=${values.read_preference}`);
        if (values.write_concern) mongoParams.push(`w=${values.write_concern}`);
        if (values.read_concern) mongoParams.push(`readConcernLevel=${values.read_concern}`);
        if (values.journal) mongoParams.push('journal=true');
        if (values.wtimeout) mongoParams.push(`wtimeout=${values.wtimeout}`);
        if (values.direct_connection) mongoParams.push('directConnection=true');
        if (values.app_name) mongoParams.push(`appName=${values.app_name}`);
        if (values.compressors) mongoParams.push(`compressors=${values.compressors}`);
        if (values.zlib_compression_level) mongoParams.push(`zlibCompressionLevel=${values.zlib_compression_level}`);
        if (values.uuid_representation) mongoParams.push(`uuidRepresentation=${values.uuid_representation}`);
        if (values.unicode_decode_error_handler) mongoParams.push(`unicode_decode_error_handler=${values.unicode_decode_error_handler}`);
        if (values.tz_aware) mongoParams.push('tz_aware=true');
        if (values.connect) mongoParams.push('connect=true');
        if (values.max_connecting) mongoParams.push(`maxConnecting=${values.max_connecting}`);
        if (values.load_balanced) mongoParams.push('loadBalanced=true');
        if (values.server_api) mongoParams.push(`serverApi=${values.server_api}`);
        if (values.heartbeat_frequency_ms) mongoParams.push(`heartbeatFrequencyMS=${values.heartbeat_frequency_ms}`);
        if (values.local_threshold_ms) mongoParams.push(`localThresholdMS=${values.local_threshold_ms}`);
        
        if (mongoParams.length > 0) {
          mongoUrl += `?${mongoParams.join('&')}`;
        }
        
        connectionString = mongoUrl;
      }
      
      const connectionData = {
        ...values,
        connection_string: connectionString
      };
      
      console.log('Sending request to:', selectedConnection ? 
        `http://localhost:8000/database-connections/${selectedConnection.id}` : 
        'http://localhost:8000/database-connections/');
      console.log('Request method:', selectedConnection ? 'PATCH' : 'POST');
      console.log('Request data:', connectionData);
      
      if (selectedConnection) {
        await axios.patch(`http://localhost:8000/database-connections/${selectedConnection.id}`, connectionData);
        message.success('資料庫連線更新成功');
      } else {
        await axios.post('http://localhost:8000/database-connections/', connectionData);
        message.success('資料庫連線創建成功');
      }
      
      setModalVisible(false);
      form.resetFields();
      setSelectedConnection(null);
      fetchConnections();
    } catch (error) {
      // 改善錯誤處理，顯示更詳細的錯誤訊息
      let errorMessage = '操作失敗';
      if (error.response) {
        // 伺服器回應了錯誤狀態碼
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.status === 405) {
          errorMessage = '請求方法不被允許，請檢查 API 端點';
        } else if (error.response.status === 422) {
          errorMessage = '請檢查輸入資料格式是否正確';
        } else if (error.response.status === 500) {
          errorMessage = '伺服器內部錯誤，請稍後再試';
        }
      } else if (error.request) {
        // 請求已發出但沒有收到回應
        errorMessage = '無法連接到伺服器，請檢查網路連線';
      } else {
        // 其他錯誤
        errorMessage = error.message || '未知錯誤';
      }
      
      message.error(errorMessage);
      console.error('Error creating/updating connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteConnection = async (connectionId) => {
    try {
      await axios.delete(`http://localhost:8000/database-connections/${connectionId}`);
      message.success('資料庫連線刪除成功');
      fetchConnections();
    } catch (error) {
      message.error('刪除失敗');
      console.error('Error deleting connection:', error);
    }
  };

  const testConnection = async (connectionId) => {
    try {
      setTestLoading(prev => ({ ...prev, [connectionId]: true }));
      const response = await axios.post(`http://localhost:8000/database-connections/${connectionId}/test`);
      if (response.data.success) {
        message.success('連線測試成功');
      } else {
        message.error('連線測試失敗');
      }
    } catch (error) {
      message.error('連線測試失敗');
      console.error('Error testing connection:', error);
    } finally {
      setTestLoading(prev => ({ ...prev, [connectionId]: false }));
    }
  };

  const getDbTypeColor = (type) => {
    const colors = {
      sqlite: 'blue',
      mysql: 'orange',
      postgresql: 'green',
      oracle: 'red',
      mssql: 'purple',
      mongodb: 'cyan'
    };
    return colors[type] || 'default';
  };

  const getDbTypeText = (type) => {
    const texts = {
      sqlite: 'SQLite',
      mysql: 'MySQL',
      postgresql: 'PostgreSQL',
      oracle: 'Oracle',
      mssql: 'SQL Server',
      mongodb: 'MongoDB'
    };
    return texts[type] || type;
  };

  const getDefaultPort = (dbType) => {
    const ports = {
      mysql: 3306,
      postgresql: 5432,
      oracle: 1521,
      mssql: 1433,
      mongodb: 27017
    };
    return ports[dbType] || 0;
  };

  const handleDbTypeChange = (value) => {
    form.setFieldsValue({
      port: getDefaultPort(value),
      host: value === 'sqlite' ? '' : 'localhost'
    });
  };

  const handleEdit = (connection) => {
    setSelectedConnection(connection);
    form.setFieldsValue(connection);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setSelectedConnection(null);
    form.resetFields();
    setModalVisible(true);
  };

  const columns = [
    {
      title: '連線名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <DatabaseOutlined style={{ color: getDbTypeColor(record.db_type) }} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: '資料庫類型',
      dataIndex: 'db_type',
      key: 'db_type',
      render: (type) => (
        <Tag color={getDbTypeColor(type)}>
          {getDbTypeText(type)}
        </Tag>
      )
    },
    {
      title: '主機',
      dataIndex: 'host',
      key: 'host',
      render: (host, record) => record.db_type === 'sqlite' ? '-' : host
    },
    {
      title: '埠號',
      dataIndex: 'port',
      key: 'port',
      render: (port, record) => record.db_type === 'sqlite' ? '-' : port
    },
    {
      title: '資料庫',
      dataIndex: 'database',
      key: 'database'
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Badge 
          status={isActive ? 'success' : 'error'} 
          text={isActive ? '啟用' : '停用'} 
        />
      )
    },
    {
      title: '最後測試',
      dataIndex: 'last_test_result',
      key: 'last_test_result',
      render: (result) => {
        if (!result) return '-';
        return (
          <Space>
            {result === 'success' ? (
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            ) : (
              <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            )}
            <Text type={result === 'success' ? 'success' : 'danger'}>
              {result === 'success' ? '成功' : '失敗'}
            </Text>
          </Space>
        );
      }
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<ExperimentOutlined />}
            loading={testLoading[record.id]}
            onClick={() => testConnection(record.id)}
          >
            測試
          </Button>
          <Button 
            type="default" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            編輯
          </Button>
          <Popconfirm
            title="確定要刪除此連線嗎？"
            onConfirm={() => deleteConnection(record.id)}
            okText="確定"
            cancelText="取消"
          >
            <Button 
              type="default" 
              size="small" 
              danger 
              icon={<DeleteOutlined />}
            >
              刪除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <DatabaseOutlined />
            <Title level={4} style={{ margin: 0 }}>資料庫連線管理</Title>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增連線
          </Button>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic title="總連線數" value={connections.length} />
          </Col>
          <Col span={6}>
            <Statistic 
              title="啟用連線" 
              value={connections.filter(c => c.is_active).length} 
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="測試成功" 
              value={connections.filter(c => c.last_test_result === 'success').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="測試失敗" 
              value={connections.filter(c => c.last_test_result === 'failed').length}
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
        </Row>

        <Table
          dataSource={connections}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={selectedConnection ? '編輯資料庫連線' : '新增資料庫連線'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={createConnection}
            initialValues={{
              db_type: 'mysql',
              host: 'localhost',
              port: 3306,
              is_active: true
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="連線名稱"
                  rules={[{ required: true, message: '請輸入連線名稱' }]}
                >
                  <Input placeholder="請輸入連線名稱" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="db_type"
                  label="資料庫類型"
                  rules={[{ required: true, message: '請選擇資料庫類型' }]}
                >
                  <Select onChange={handleDbTypeChange}>
                    <Option value="sqlite">SQLite</Option>
                    <Option value="mysql">MySQL</Option>
                    <Option value="postgresql">PostgreSQL</Option>
                    <Option value="oracle">Oracle</Option>
                    <Option value="mssql">SQL Server</Option>
                    <Option value="mongodb">MongoDB</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="host"
                  label="主機"
                  rules={[{ required: true, message: '請輸入主機地址' }]}
                >
                  <Input placeholder="localhost" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="port"
                  label="埠號"
                  rules={[{ required: true, message: '請輸入埠號' }]}
                >
                  <InputNumber 
                    placeholder="3306" 
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
                  rules={[{ required: true, message: '請輸入資料庫名稱' }]}
                >
                  <Input placeholder="請輸入資料庫名稱" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="username"
                  label="用戶名"
                >
                  <Input placeholder="請輸入用戶名" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="password"
              label="密碼"
            >
              <Input.Password placeholder="請輸入密碼" />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="啟用狀態"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            {/* MongoDB 特定配置 */}
            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.db_type !== currentValues.db_type}>
              {({ getFieldValue }) => {
                const dbType = getFieldValue('db_type');
                if (dbType === 'mongodb') {
                  return (
                    <Collapse ghost>
                      <Panel header="MongoDB 進階配置" key="mongodb-advanced">
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
                                <Option value="PLAIN">PLAIN</Option>
                                <Option value="GSSAPI">GSSAPI</Option>
                                <Option value="MONGODB-X509">MONGODB-X509</Option>
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
                              <Input placeholder="rs0" />
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

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="max_pool_size"
                              label="最大連線池大小"
                            >
                              <InputNumber 
                                placeholder="100" 
                                style={{ width: '100%' }}
                                min={1}
                                max={1000}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="min_pool_size"
                              label="最小連線池大小"
                            >
                              <InputNumber 
                                placeholder="0" 
                                style={{ width: '100%' }}
                                min={0}
                                max={100}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="max_idle_time_ms"
                              label="最大閒置時間 (ms)"
                            >
                              <InputNumber 
                                placeholder="30000" 
                                style={{ width: '100%' }}
                                min={0}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="server_selection_timeout_ms"
                              label="伺服器選擇超時 (ms)"
                            >
                              <InputNumber 
                                placeholder="30000" 
                                style={{ width: '100%' }}
                                min={0}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="socket_timeout_ms"
                              label="Socket 超時 (ms)"
                            >
                              <InputNumber 
                                placeholder="20000" 
                                style={{ width: '100%' }}
                                min={0}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="connect_timeout_ms"
                              label="連線超時 (ms)"
                            >
                              <InputNumber 
                                placeholder="20000" 
                                style={{ width: '100%' }}
                                min={0}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="retry_writes"
                              label="重試寫入"
                              valuePropName="checked"
                            >
                              <Switch />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="retry_reads"
                              label="重試讀取"
                              valuePropName="checked"
                            >
                              <Switch />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="read_preference"
                              label="讀取偏好"
                            >
                              <Select placeholder="選擇讀取偏好">
                                <Option value="primary">Primary</Option>
                                <Option value="primaryPreferred">Primary Preferred</Option>
                                <Option value="secondary">Secondary</Option>
                                <Option value="secondaryPreferred">Secondary Preferred</Option>
                                <Option value="nearest">Nearest</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="write_concern"
                              label="寫入關注"
                            >
                              <Select placeholder="選擇寫入關注">
                                <Option value="1">1</Option>
                                <Option value="majority">Majority</Option>
                                <Option value="all">All</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="direct_connection"
                              label="直接連線"
                              valuePropName="checked"
                            >
                              <Switch />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="app_name"
                              label="應用程式名稱"
                            >
                              <Input placeholder="IIoT Platform" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Panel>
                    </Collapse>
                  );
                }
                return null;
              }}
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {selectedConnection ? '更新' : '創建'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default DatabaseConnectionManagement;