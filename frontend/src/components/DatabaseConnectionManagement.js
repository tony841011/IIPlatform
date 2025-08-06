import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Card,
  Tag,
  Tooltip,
  Switch,
  Collapse
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { Panel } = Collapse;

const DatabaseConnectionManagement = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchConnections();
  }, []);

  // 修復：生成連線字串時進行 URL 編碼
  const generateConnectionString = (values) => {
    const { db_type, host, port, database, username, password } = values;
    
    // 對用戶名和密碼進行 URL 編碼
    const encodedUsername = encodeURIComponent(username || '');
    const encodedPassword = encodeURIComponent(password || '');
    
    switch (db_type) {
      case 'mongodb':
        return `mongodb://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
      case 'postgresql':
        return `postgresql://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
      case 'mysql':
        return `mysql://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
      case 'influxdb':
        return `http://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
      case 'oracle':
        return `oracle://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
      case 'sqlserver':
        return `mssql://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
      default:
        return `unknown://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
    }
  };

  const fetchConnections = async () => {
    try {
      setLoading(true);
      console.log('正在獲取連線列表...');
      
      const response = await axios.get('http://localhost:8000/database-connections/');
      console.log('獲取連線列表成功:', response.data);
      
      setConnections(response.data);
    } catch (error) {
      console.error('獲取連線列表失敗:', error);
      let errorMessage = '獲取連線列表失敗';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConnection = async (values) => {
    try {
      setLoading(true);
      console.log('正在創建連線:', values);
      
      // 生成連線字串（包含 URL 編碼）
      const connectionData = {
        ...values,
        connection_string: generateConnectionString(values)
      };
      
      console.log('完整的連線資料:', connectionData);
      
      const response = await axios.post('http://localhost:8000/database-connections/', connectionData);
      console.log('創建連線成功:', response.data);
      
      message.success('資料庫連線創建成功');
      setModalVisible(false);
      form.resetFields();
      fetchConnections();
    } catch (error) {
      console.error('創建連線失敗:', error);
      
      let errorMessage = '創建連線失敗';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = '無法連接到伺服器，請檢查網路連線';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (connectionId) => {
    try {
      setLoading(true);
      console.log('正在測試連線:', connectionId);
      
      const response = await axios.post(`http://localhost:8000/database-connections/${connectionId}/test`);
      console.log('測試連線結果:', response.data);
      
      if (response.data.success) {
        message.success('連線測試成功');
      } else {
        const errorMessage = response.data.error_message || '連線測試失敗';
        message.error(`連線測試失敗: ${errorMessage}`);
      }
      
      fetchConnections();
    } catch (error) {
      console.error('測試連線失敗:', error);
      
      let errorMessage = '測試連線失敗，請檢查網路連線';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async (connectionId) => {
    try {
      setLoading(true);
      
      await axios.delete(`http://localhost:8000/database-connections/${connectionId}`);
      message.success('連線刪除成功');
      fetchConnections();
    } catch (error) {
      console.error('刪除連線失敗:', error);
      
      let errorMessage = '刪除連線失敗';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '連線名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <DatabaseOutlined />
          <span>{text}</span>
          {record.is_default && <Tag color="blue">預設</Tag>}
        </Space>
      )
    },
    {
      title: '資料庫類型',
      dataIndex: 'db_type',
      key: 'db_type',
      render: (text) => (
        <Tag color={text === 'mongodb' ? 'green' : text === 'postgresql' ? 'blue' : 'orange'}>
          {text ? text.toUpperCase() : 'UNKNOWN'}
        </Tag>
      )
    },
    {
      title: '主機',
      dataIndex: 'host',
      key: 'host',
    },
    {
      title: '埠號',
      dataIndex: 'port',
      key: 'port',
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
        <Tag color={active ? 'green' : 'red'}>
          {active ? '啟用' : '停用'}
        </Tag>
      )
    },
    {
      title: '最後測試',
      dataIndex: 'last_test_result',
      key: 'last_test_result',
      render: (result, record) => {
        if (!record.last_test_time) {
          return <Tag color="gray">未測試</Tag>;
        }
        return (
          <Tag color={result === 'success' ? 'green' : 'red'}>
            {result === 'success' ? '成功' : '失敗'}
          </Tag>
        );
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="測試連線">
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleTestConnection(record.id)}
              loading={loading}
            />
          </Tooltip>
          <Tooltip title="編輯">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="刪除">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteConnection(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const handleEdit = (connection) => {
    setEditingConnection(connection);
    form.setFieldsValue({
      name: connection.name,
      db_type: connection.db_type,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: connection.username,
      password: connection.password,
      is_active: connection.is_active,
      description: connection.description
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    if (editingConnection) {
      try {
        setLoading(true);
        
        // 生成連線字串（包含 URL 編碼）
        const connectionData = {
          ...values,
          connection_string: generateConnectionString(values)
        };
        
        await axios.patch(`http://localhost:8000/database-connections/${editingConnection.id}`, connectionData);
        message.success('連線更新成功');
        setModalVisible(false);
        setEditingConnection(null);
        form.resetFields();
        fetchConnections();
      } catch (error) {
        console.error('更新連線失敗:', error);
        
        let errorMessage = '更新連線失敗';
        if (error.response && error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      await handleCreateConnection(values);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="資料庫連線管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingConnection(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新增連線
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={connections}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 個連線`
          }}
        />
      </Card>

      <Modal
        title={editingConnection ? '編輯連線' : '新增連線'}
        open={modalVisible}
        onOk={form.submit}
        onCancel={() => {
          setModalVisible(false);
          setEditingConnection(null);
          form.resetFields();
        }}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="連線名稱"
            rules={[{ required: true, message: '請輸入連線名稱' }]}
          >
            <Input placeholder="請輸入連線名稱" />
          </Form.Item>

          <Form.Item
            name="db_type"
            label="資料庫類型"
            rules={[{ required: true, message: '請選擇資料庫類型' }]}
          >
            <Select placeholder="請選擇資料庫類型">
              <Option value="postgresql">PostgreSQL</Option>
              <Option value="mongodb">MongoDB</Option>
              <Option value="influxdb">InfluxDB</Option>
              <Option value="mysql">MySQL</Option>
              <Option value="oracle">Oracle</Option>
              <Option value="sqlserver">SQL Server</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="host"
            label="主機"
            rules={[{ required: true, message: '請輸入主機地址' }]}
          >
            <Input placeholder="例如: localhost 或 192.168.1.100" />
          </Form.Item>

          <Form.Item
            name="port"
            label="埠號"
            rules={[{ required: true, message: '請輸入埠號' }]}
          >
            <Input placeholder="例如: 5432, 27017, 8086" />
          </Form.Item>

          <Form.Item
            name="database"
            label="資料庫名稱"
            rules={[{ required: true, message: '請輸入資料庫名稱' }]}
          >
            <Input placeholder="請輸入資料庫名稱" />
          </Form.Item>

          <Form.Item
            name="username"
            label="用戶名"
            rules={[{ required: true, message: '請輸入用戶名' }]}
          >
            <Input placeholder="請輸入用戶名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密碼"
            rules={[{ required: true, message: '請輸入密碼' }]}
          >
            <Input.Password
              placeholder="請輸入密碼"
              iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="啟用狀態"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea
              placeholder="請輸入連線描述"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DatabaseConnectionManagement;