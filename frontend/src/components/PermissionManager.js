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
  Progress
} from 'antd';
import {
  UserOutlined,
  KeyOutlined,
  DatabaseOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const PermissionManager = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [databaseConnections, setDatabaseConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 獲取用戶列表
      const usersResponse = await axios.get('http://localhost:8000/api/v1/users/');
      setUsers(usersResponse.data);

      // 獲取角色列表
      const rolesResponse = await axios.get('http://localhost:8000/api/v1/roles/');
      setRoles(rolesResponse.data);

      // 獲取權限列表
      const permissionsResponse = await axios.get('http://localhost:8000/api/v1/permissions/');
      setPermissions(permissionsResponse.data);

      // 獲取資料庫連線
      const connectionsResponse = await axios.get('http://localhost:8000/api/v1/database-connections/');
      setDatabaseConnections(connectionsResponse.data);

    } catch (error) {
      console.error('獲取數據失敗:', error);
      message.error('獲取數據失敗');
    } finally {
      setLoading(false);
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

  // 初始化資料庫
  const initializeDatabases = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/database-connections/initialize');
      message.success('資料庫初始化完成');
      fetchData(); // 重新獲取數據
    } catch (error) {
      message.error('資料庫初始化失敗');
    } finally {
      setLoading(false);
    }
  };

  // 用戶表格列定義
  const userColumns = [
    {
      title: '用戶名',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: '顯示名稱',
      dataIndex: 'display_name',
      key: 'display_name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : role === 'operator' ? 'blue' : 'green'}>
          {role === 'admin' ? '系統管理員' : role === 'operator' ? '操作員' : '檢視者'}
        </Tag>
      ),
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
      title: '最後登入',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (date) => date ? new Date(date).toLocaleString() : '從未登入',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            編輯
          </Button>
          <Button
            type="link"
            icon={<KeyOutlined />}
            onClick={() => handleResetPassword(record)}
          >
            重設密碼
          </Button>
          <Button
            type="link"
            icon={record.is_active ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleUserStatus(record)}
          >
            {record.is_active ? '停用' : '啟用'}
          </Button>
        </Space>
      ),
    },
  ];

  // 角色表格列定義
  const roleColumns = [
    {
      title: '角色名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <SafetyCertificateOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: '顯示名稱',
      dataIndex: 'display_name',
      key: 'display_name',
    },
    {
      title: '權限等級',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Progress
          percent={level}
          size="small"
          status={level >= 80 ? 'success' : level >= 50 ? 'normal' : 'exception'}
        />
      ),
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
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
          >
            編輯
          </Button>
          <Button
            type="link"
            icon={<SettingOutlined />}
            onClick={() => handleManagePermissions(record)}
          >
            權限管理
          </Button>
        </Space>
      ),
    },
  ];

  // 資料庫連線表格列定義
  const connectionColumns = [
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
      render: (type) => (
        <Tag color={
          type === 'postgresql' ? 'blue' :
          type === 'mongodb' ? 'green' :
          type === 'influxdb' ? 'orange' : 'default'
        }>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: '主機',
      dataIndex: 'host',
      key: 'host',
    },
    {
      title: '狀態',
      key: 'status',
      render: (_, record) => {
        const status = connectionStatus[record.id];
        return (
          <Space>
            <Badge
              status={
                status === 'success' ? 'success' :
                status === 'error' ? 'error' :
                status === 'testing' ? 'processing' : 'default'
              }
            />
            <Button
              size="small"
              onClick={() => testDatabaseConnection(record.id)}
              loading={status === 'testing'}
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

  // 處理函數
  const handleEditUser = (user) => {
    setEditingUser(user);
    setModalVisible(true);
  };

  const handleResetPassword = async (user) => {
    try {
      await axios.post(`http://localhost:8000/api/v1/users/${user.id}/reset-password`);
      message.success('密碼重設成功');
    } catch (error) {
      message.error('密碼重設失敗');
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      await axios.patch(`http://localhost:8000/api/v1/users/${user.id}/toggle-status`);
      message.success(`用戶已${user.is_active ? '停用' : '啟用'}`);
      fetchData();
    } catch (error) {
      message.error('操作失敗');
    }
  };

  const handleEditRole = (role) => {
    // 實現角色編輯邏輯
    message.info('角色編輯功能開發中');
  };

  const handleManagePermissions = (role) => {
    // 實現權限管理邏輯
    message.info('權限管理功能開發中');
  };

  const handleEditConnection = (connection) => {
    // 實現連線編輯邏輯
    message.info('連線編輯功能開發中');
  };

  const handleDeleteConnection = async (connection) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/database-connections/${connection.id}`);
      message.success('連線刪除成功');
      fetchData();
    } catch (error) {
      message.error('連線刪除失敗');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <SettingOutlined style={{ marginRight: '8px' }} />
        權限管理
      </Title>

      {/* 資料庫初始化 */}
      <Card
        title="資料庫管理"
        style={{ marginBottom: '24px' }}
        extra={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={initializeDatabases}
            loading={loading}
          >
            初始化資料庫
          </Button>
        }
      >
        <Alert
          message="資料庫狀態"
          description="管理平台的三個核心資料庫：PostgreSQL（結構化數據）、MongoDB（非結構化數據）、InfluxDB（時序數據）"
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        
        <Table
          columns={connectionColumns}
          dataSource={databaseConnections}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 用戶管理 */}
      <Card
        title="用戶管理"
        style={{ marginBottom: '24px' }}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            新增用戶
          </Button>
        }
      >
        <Table
          columns={userColumns}
          dataSource={users}
          rowKey="id"
          loading={loading}
        />
      </Card>

      {/* 角色管理 */}
      <Card
        title="角色管理"
        style={{ marginBottom: '24px' }}
      >
        <Table
          columns={roleColumns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
        />
      </Card>

      {/* 權限說明 */}
      <Card title="權限說明">
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" title="系統管理員">
              <ul>
                <li>擁有所有權限</li>
                <li>可以管理用戶和角色</li>
                <li>可以配置系統設定</li>
                <li>可以管理資料庫連線</li>
              </ul>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="操作員">
              <ul>
                <li>可以管理設備</li>
                <li>可以查看數據</li>
                <li>可以處理告警</li>
                <li>可以查看儀表板</li>
              </ul>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="檢視者">
              <ul>
                <li>僅能查看數據</li>
                <li>可以查看報表</li>
                <li>可以查看儀表板</li>
                <li>無修改權限</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default PermissionManager; 