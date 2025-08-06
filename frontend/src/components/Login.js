import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  Switch,
  message,
  Spin,
  Alert,
  Divider,
  Space,
  Typography,
  Row,
  Col,
  Tooltip,
  Badge,
  Modal,
  InputNumber,
  Checkbox
} from 'antd';
import FirstTimeSetup from './FirstTimeSetup';
import {
  UserOutlined,
  LockOutlined,
  DatabaseOutlined,
  KeyOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  CloudOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Login = ({ onLoginSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [databaseConnections, setDatabaseConnections] = useState([]);
  const [selectedDatabases, setSelectedDatabases] = useState({
    postgresql: true,
    mongodb: true,
    influxdb: true
  });
  const [connectionStatus, setConnectionStatus] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [connectionForm] = Form.useForm();
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showFirstTimeSetup, setShowFirstTimeSetup] = useState(false);

  // 獲取資料庫連線列表
  useEffect(() => {
    fetchDatabaseConnections();
  }, []);

  const fetchDatabaseConnections = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/database-connections/');
      setDatabaseConnections(response.data);
    } catch (error) {
      console.error('獲取資料庫連線失敗:', error);
    }
  };

  // 測試資料庫連線
  const testDatabaseConnection = async (connectionId) => {
    try {
      setConnectionStatus(prev => ({ ...prev, [connectionId]: 'testing' }));
      const response = await axios.post(`http://localhost:8000/api/v1/database-connections/${connectionId}/test`);
      setConnectionStatus(prev => ({ ...prev, [connectionId]: 'success' }));
      message.success('資料庫連線測試成功');
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [connectionId]: 'error' }));
      message.error('資料庫連線測試失敗');
    }
  };

  // 新增資料庫連線
  const handleAddConnection = () => {
    setEditingConnection(null);
    connectionForm.resetFields();
    setShowConnectionModal(true);
  };

  // 編輯資料庫連線
  const handleEditConnection = (connection) => {
    setEditingConnection(connection);
    connectionForm.setFieldsValue({
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
      // InfluxDB 特定欄位
      token: connection.token,
      org: connection.org,
      bucket: connection.bucket,
      // 連線設定
      timeout: connection.timeout,
      retry_attempts: connection.retry_attempts,
      connection_pool_size: connection.connection_pool_size
    });
    setShowConnectionModal(true);
  };

  // 刪除資料庫連線
  const handleDeleteConnection = async (connection) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/database-connections/${connection.id}`);
      message.success('連線刪除成功');
      fetchDatabaseConnections();
    } catch (error) {
      message.error('連線刪除失敗');
    }
  };

  // 提交資料庫連線
  const handleSubmitConnection = async (values) => {
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

      setShowConnectionModal(false);
      fetchDatabaseConnections();
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

  // 初始化選定的資料庫
  const initializeSelectedDatabases = async () => {
    setLoading(true);
    try {
      const selectedConnections = databaseConnections.filter(conn => 
        selectedDatabases[conn.db_type]
      );

      for (const connection of selectedConnections) {
        await testDatabaseConnection(connection.id);
      }

      message.success('資料庫初始化完成');
    } catch (error) {
      message.error('資料庫初始化失敗');
    } finally {
      setLoading(false);
    }
  };

  // 登入處理
  const handleLogin = async (values) => {
    setLoading(true);
    try {
      // 呼叫實際的登入 API
      const loginData = {
        username: values.username,
        password: values.password,
        selected_databases: selectedDatabases
      };

      const response = await axios.post('http://localhost:8000/api/v1/auth/login', loginData);
      
      if (response.data.success) {
        // 檢查是否為首次登入
        if (response.data.is_first_time) {
          setIsFirstTime(true);
          setShowFirstTimeSetup(true);
          message.info('首次登入，請設定資料庫連線');
        } else {
          const userData = {
            username: response.data.user.username,
            displayName: response.data.user.display_name,
            role: response.data.user.role,
            permissions: response.data.user.permissions,
            selectedDatabases: response.data.user.selected_databases,
            databaseStatus: response.data.user.database_status
          };

          // 觸發登入成功回調
          onLoginSuccess(userData);
          message.success(response.data.message || '登入成功！');
        }
      } else {
        message.error(response.data.message || '登入失敗！');
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      message.error('登入失敗，請檢查網路連線');
    } finally {
      setLoading(false);
    }
  };

  const handleFirstTimeSetupComplete = (setupData) => {
    setShowFirstTimeSetup(false);
    
    // 創建用戶數據
    const userData = {
      username: 'admin',
      displayName: '系統管理員',
      role: 'admin',
      permissions: ['all'],
      selectedDatabases: {
        postgresql: true,
        mongodb: true,
        influxdb: true
      },
      databaseStatus: setupData.test_results
    };

    // 觸發登入成功回調
    onLoginSuccess(userData);
    message.success('首次設定完成，歡迎使用 IIPlatform！');
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

  // 如果顯示首次設定，則渲染 FirstTimeSetup 組件
  if (showFirstTimeSetup) {
    return <FirstTimeSetup onSetupComplete={handleFirstTimeSetupComplete} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: 500,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '10px' }}>
            <GlobalOutlined style={{ marginRight: '8px' }} />
            IIPlatform
          </Title>
          <Text type="secondary">工業物聯網平台</Text>
        </div>

        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          {/* 基本登入資訊 */}
          <Form.Item
            name="username"
            rules={[{ required: true, message: '請輸入用戶名！' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用戶名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '請輸入密碼！' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密碼"
              size="large"
            />
          </Form.Item>

          {/* 高級設定 */}
          <div style={{ marginBottom: '20px' }}>
            <Button
              type="link"
              onClick={() => setShowAdvanced(!showAdvanced)}
              icon={showAdvanced ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            >
              {showAdvanced ? '隱藏' : '顯示'} 遠端資料庫設定
            </Button>
          </div>

          {showAdvanced && (
            <>
              <Divider>遠端資料庫連線設定</Divider>
              
              {/* 資料庫連線管理 */}
              <Form.Item label="資料庫連線管理">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={handleAddConnection}
                    block
                  >
                    新增遠端資料庫連線
                  </Button>
                  
                  {databaseConnections.map(connection => (
                    <div key={connection.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '8px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px'
                    }}>
                      <Space>
                        <DatabaseOutlined />
                        <Text>{connection.name}</Text>
                        <Badge
                          status={
                            connectionStatus[connection.id] === 'success' ? 'success' :
                            connectionStatus[connection.id] === 'error' ? 'error' :
                            connectionStatus[connection.id] === 'testing' ? 'processing' : 'default'
                          }
                          text={
                            connectionStatus[connection.id] === 'success' ? '連線正常' :
                            connectionStatus[connection.id] === 'error' ? '連線失敗' :
                            connectionStatus[connection.id] === 'testing' ? '測試中' : '未測試'
                          }
                        />
                      </Space>
                      <Space>
                        <Button
                          size="small"
                          onClick={() => testDatabaseConnection(connection.id)}
                          loading={connectionStatus[connection.id] === 'testing'}
                        >
                          測試
                        </Button>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEditConnection(connection)}
                        >
                          編輯
                        </Button>
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteConnection(connection)}
                        >
                          刪除
                        </Button>
                      </Space>
                    </div>
                  ))}
                </Space>
              </Form.Item>

              {/* 資料庫選擇 */}
              <Form.Item label="選擇要連線的資料庫">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Switch
                      checked={selectedDatabases.postgresql}
                      onChange={(checked) => setSelectedDatabases(prev => ({
                        ...prev,
                        postgresql: checked
                      }))}
                    />
                    <Text style={{ marginLeft: '8px' }}>
                      <DatabaseOutlined /> PostgreSQL (核心業務數據)
                    </Text>
                  </div>
                  <div>
                    <Switch
                      checked={selectedDatabases.mongodb}
                      onChange={(checked) => setSelectedDatabases(prev => ({
                        ...prev,
                        mongodb: checked
                      }))}
                    />
                    <Text style={{ marginLeft: '8px' }}>
                      <CloudOutlined /> MongoDB (非結構化數據)
                    </Text>
                  </div>
                  <div>
                    <Switch
                      checked={selectedDatabases.influxdb}
                      onChange={(checked) => setSelectedDatabases(prev => ({
                        ...prev,
                        influxdb: checked
                      }))}
                    />
                    <Text style={{ marginLeft: '8px' }}>
                      <GlobalOutlined /> InfluxDB (時序數據)
                    </Text>
                  </div>
                </Space>
              </Form.Item>
            </>
          )}

          {/* 登入按鈕 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              icon={loading ? <LoadingOutlined /> : <KeyOutlined />}
            >
              {loading ? '登入中...' : '登入'}
            </Button>
          </Form.Item>

          {/* 預設帳號提示 */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Text type="secondary">
              <InfoCircleOutlined style={{ marginRight: '4px' }} />
              預設帳號：admin / admin123
            </Text>
          </div>
        </Form>
      </Card>

      {/* 資料庫連線設定模態框 */}
      <Modal
        title={editingConnection ? '編輯資料庫連線' : '新增資料庫連線'}
        open={showConnectionModal}
        onCancel={() => setShowConnectionModal(false)}
        footer={null}
        width={800}
      >
        <Form
          form={connectionForm}
          onFinish={handleSubmitConnection}
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
                    connectionForm.setFieldsValue({ port: defaultPort });
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

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingConnection ? '更新' : '創建'}
              </Button>
              <Button onClick={() => setShowConnectionModal(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Login; 