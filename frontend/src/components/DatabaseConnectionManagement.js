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
  Progress
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
  SettingOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

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
      }
      
      const connectionData = {
        ...values,
        connection_string: connectionString
      };
      
      if (selectedConnection) {
        await axios.patch(`http://localhost:8000/database-connections/${selectedConnection.id}`, connectionData);
        message.success('資料庫連線更新成功');
      } else {
        await axios.post('http://localhost:8000/database-connections/', connectionData);
        message.success('資料庫連線創建成功');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchConnections();
    } catch (error) {
      message.error('操作失敗: ' + (error.response?.data?.detail || error.message));
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
      message.error('刪除失敗: ' + (error.response?.data?.detail || error.message));
    }
  };

  const testConnection = async (connectionId) => {
    try {
      setTestLoading(prev => ({ ...prev, [connectionId]: true }));
      const response = await axios.post(`http://localhost:8000/database-connections/${connectionId}/test`);
      
      if (response.data.test_result === 'success') {
        message.success(`連線測試成功 (${response.data.response_time.toFixed(2)}s)`);
      } else {
        message.error(`連線測試失敗: ${response.data.error_message}`);
      }
    } catch (error) {
      message.error('連線測試失敗: ' + (error.response?.data?.detail || error.message));
    } finally {
      setTestLoading(prev => ({ ...prev, [connectionId]: false }));
    }
  };

  const getDbTypeColor = (type) => {
    switch (type) {
      case 'sqlite': return 'green';
      case 'mysql': return 'blue';
      case 'postgresql': return 'purple';
      case 'oracle': return 'orange';
      case 'mssql': return 'red';
      default: return 'default';
    }
  };

  const getDbTypeText = (type) => {
    switch (type) {
      case 'sqlite': return 'SQLite';
      case 'mysql': return 'MySQL';
      case 'postgresql': return 'PostgreSQL';
      case 'oracle': return 'Oracle';
      case 'mssql': return 'SQL Server';
      default: return type;
    }
  };

  const getDefaultPort = (dbType) => {
    switch (dbType) {
      case 'mysql': return 3306;
      case 'postgresql': return 5432;
      case 'oracle': return 1521;
      case 'mssql': return 1433;
      default: return null;
    }
  };

  const handleDbTypeChange = (value) => {
    const port = getDefaultPort(value);
    if (port) {
      form.setFieldsValue({ port });
    }
  };

  const columns = [
    {
      title: '連線名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          {record.is_default && <Tag color="blue">預設</Tag>}
        </Space>
      ),
    },
    {
      title: '資料庫類型',
      dataIndex: 'db_type',
      key: 'db_type',
      render: (type) => (
        <Tag color={getDbTypeColor(type)}>
          {getDbTypeText(type)}
        </Tag>
      ),
    },
    {
      title: '主機',
      dataIndex: 'host',
      key: 'host',
      render: (host) => host || '-',
    },
    {
      title: '資料庫',
      dataIndex: 'database',
      key: 'database',
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Badge 
          status={active ? 'success' : 'error'} 
          text={active ? '啟用' : '停用'} 
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="測試連線">
            <Button
              size="small"
              icon={<ExperimentOutlined />}
              loading={testLoading[record.id]}
              onClick={() => testConnection(record.id)}
            >
              測試
            </Button>
          </Tooltip>
          <Tooltip title="編輯連線">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedConnection(record);
                setModalVisible(true);
                form.setFieldsValue(record);
              }}
            >
              編輯
            </Button>
          </Tooltip>
          <Popconfirm
            title="確定要刪除此連線嗎？"
            description="此操作無法復原"
            onConfirm={() => deleteConnection(record.id)}
            okText="確定"
            cancelText="取消"
          >
            <Tooltip title="刪除連線">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              >
                刪除
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const connectionStats = {
    total: connections.length,
    active: connections.filter(c => c.is_active).length,
    default: connections.filter(c => c.is_default).length,
    sqlite: connections.filter(c => c.db_type === 'sqlite').length,
    mysql: connections.filter(c => c.db_type === 'mysql').length,
    postgresql: connections.filter(c => c.db_type === 'postgresql').length,
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <DatabaseOutlined />
                <span>資料庫連線管理</span>
              </Space>
            }
            extra={
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchConnections}
                  loading={loading}
                >
                  重新整理
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => {
                    setSelectedConnection(null);
                    setModalVisible(true);
                    form.resetFields();
                  }}
                >
                  新增連線
                </Button>
              </Space>
            }
          >
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={4}>
                <Statistic
                  title="總連線數"
                  value={connectionStats.total}
                  prefix={<DatabaseOutlined />}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="啟用連線"
                  value={connectionStats.active}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="預設連線"
                  value={connectionStats.default}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="SQLite"
                  value={connectionStats.sqlite}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="MySQL"
                  value={connectionStats.mysql}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="PostgreSQL"
                  value={connectionStats.postgresql}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>

            {connections.length === 0 && (
              <Alert
                message="尚未建立任何資料庫連線"
                description="點擊「新增連線」按鈕來建立第一個資料庫連線配置"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Table
              dataSource={connections}
              columns={columns}
              rowKey="id"
              loading={loading}
              size="small"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <Space>
            <SettingOutlined />
            {selectedConnection ? "編輯資料庫連線" : "新增資料庫連線"}
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          onFinish={createConnection}
          layout="vertical"
          initialValues={{
            is_active: true,
            is_default: false,
            port: 3306
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="連線名稱"
                name="name"
                rules={[{ required: true, message: '請輸入連線名稱' }]}
              >
                <Input placeholder="例如: 主資料庫" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="資料庫類型"
                name="db_type"
                rules={[{ required: true, message: '請選擇資料庫類型' }]}
              >
                <Select 
                  placeholder="選擇資料庫類型"
                  onChange={handleDbTypeChange}
                >
                  <Option value="sqlite">SQLite</Option>
                  <Option value="mysql">MySQL</Option>
                  <Option value="postgresql">PostgreSQL</Option>
                  <Option value="oracle">Oracle</Option>
                  <Option value="mssql">SQL Server</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="主機地址"
                name="host"
                rules={[
                  ({ getFieldValue }) => ({
                    required: getFieldValue('db_type') !== 'sqlite',
                    message: '主機地址為必填項'
                  })
                ]}
              >
                <Input placeholder="例如: localhost" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="端口"
                name="port"
                rules={[
                  ({ getFieldValue }) => ({
                    required: getFieldValue('db_type') !== 'sqlite',
                    message: '端口為必填項'
                  })
                ]}
              >
                <InputNumber 
                  placeholder="例如: 3306" 
                  style={{ width: '100%' }}
                  min={1}
                  max={65535}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="資料庫名稱"
                name="database"
                rules={[{ required: true, message: '請輸入資料庫名稱' }]}
              >
                <Input placeholder="例如: iot_platform" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="用戶名"
                name="username"
                rules={[
                  ({ getFieldValue }) => ({
                    required: getFieldValue('db_type') !== 'sqlite',
                    message: '用戶名為必填項'
                  })
                ]}
              >
                <Input placeholder="資料庫用戶名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="密碼"
                name="password"
                rules={[
                  ({ getFieldValue }) => ({
                    required: getFieldValue('db_type') !== 'sqlite',
                    message: '密碼為必填項'
                  })
                ]}
              >
                <Input.Password placeholder="資料庫密碼" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="啟用"
                name="is_active"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="設為預設"
                name="is_default"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Alert
            message="連線資訊"
            description={
              <div>
                <Paragraph>
                  <Text strong>SQLite:</Text> 本地檔案資料庫，無需主機和認證
                </Paragraph>
                <Paragraph>
                  <Text strong>MySQL/PostgreSQL:</Text> 需要主機、端口、用戶名和密碼
                </Paragraph>
                <Paragraph>
                  <Text strong>Oracle/SQL Server:</Text> 企業級資料庫，需要完整的連線資訊
                </Paragraph>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedConnection ? '更新連線' : '創建連線'}
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