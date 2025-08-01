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
  Tree,
  Transfer,
  Typography,
  Divider
} from 'antd';
import {
  KeyOutlined,
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LockOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRoles();
    fetchUsers();
    fetchDevices();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/roles/');
      setRoles(response.data);
    } catch (error) {
      message.error('獲取角色列表失敗');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/users/');
      setUsers(response.data);
    } catch (error) {
      message.error('獲取用戶列表失敗');
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/devices/');
      setDevices(response.data);
    } catch (error) {
      message.error('獲取設備列表失敗');
    }
  };

  const createRole = async (values) => {
    try {
      setLoading(true);
      
      // 構建權限對象
      const permissions = {};
      if (values.device_permissions) {
        permissions.device = values.device_permissions;
      }
      if (values.user_permissions) {
        permissions.user = values.user_permissions;
      }
      if (values.system_permissions) {
        permissions.system = values.system_permissions;
      }
      
      const roleData = {
        name: values.name,
        description: values.description,
        permissions: permissions
      };
      
      await axios.post('http://localhost:8000/roles/', roleData);
      message.success('角色創建成功');
      setModalVisible(false);
      form.resetFields();
      fetchRoles();
    } catch (error) {
      message.error('角色創建失敗');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLevel = (roleName) => {
    switch (roleName) {
      case 'admin': return 1;
      case 'operator': return 2;
      case 'viewer': return 3;
      case 'maintenance': return 2;
      default: return 4;
    }
  };

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'admin': return 'red';
      case 'operator': return 'blue';
      case 'viewer': return 'green';
      case 'maintenance': return 'orange';
      default: return 'default';
    }
  };

  const getRoleText = (roleName) => {
    switch (roleName) {
      case 'admin': return '管理員';
      case 'operator': return '操作員';
      case 'viewer': return '檢視者';
      case 'maintenance': return '維護員';
      default: return roleName;
    }
  };

  const roleColumns = [
    {
      title: '角色名稱',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Tag color={getRoleColor(name)}>
          {getRoleText(name)}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '權限等級',
      key: 'level',
      render: (_, record) => getRoleLevel(record.name),
      sorter: (a, b) => getRoleLevel(a.name) - getRoleLevel(b.name),
    },
    {
      title: '用戶數量',
      key: 'user_count',
      render: (_, record) => {
        const count = users.filter(user => user.role === record.name).length;
        return count;
      },
    },
    {
      title: '創建時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>
            查看權限
          </Button>
          <Button size="small" icon={<EditOutlined />}>
            編輯
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />}>
            刪除
          </Button>
        </Space>
      ),
    },
  ];

  const userColumns = [
    {
      title: '用戶名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      ),
    },
    {
      title: '郵箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? '啟用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '最後登入',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (time) => time ? new Date(time).toLocaleString() : '從未登入',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>
            編輯角色
          </Button>
          <Button size="small" icon={<LockOutlined />}>
            重置密碼
          </Button>
        </Space>
      ),
    },
  ];

  const permissionTreeData = [
    {
      title: '設備管理',
      key: 'device',
      children: [
        { title: '查看設備', key: 'device:read' },
        { title: '創建設備', key: 'device:create' },
        { title: '編輯設備', key: 'device:update' },
        { title: '刪除設備', key: 'device:delete' },
        { title: '控制設備', key: 'device:control' },
      ]
    },
    {
      title: '用戶管理',
      key: 'user',
      children: [
        { title: '查看用戶', key: 'user:read' },
        { title: '創建用戶', key: 'user:create' },
        { title: '編輯用戶', key: 'user:update' },
        { title: '刪除用戶', key: 'user:delete' },
      ]
    },
    {
      title: '系統管理',
      key: 'system',
      children: [
        { title: '查看日誌', key: 'system:audit' },
        { title: '系統設定', key: 'system:settings' },
        { title: '備份還原', key: 'system:backup' },
      ]
    },
    {
      title: '規則引擎',
      key: 'rule',
      children: [
        { title: '查看規則', key: 'rule:read' },
        { title: '創建規則', key: 'rule:create' },
        { title: '編輯規則', key: 'rule:update' },
        { title: '刪除規則', key: 'rule:delete' },
      ]
    },
    {
      title: '工作流程',
      key: 'workflow',
      children: [
        { title: '查看工作流程', key: 'workflow:read' },
        { title: '創建工作流程', key: 'workflow:create' },
        { title: '編輯工作流程', key: 'workflow:update' },
        { title: '執行工作流程', key: 'workflow:execute' },
      ]
    }
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="角色管理概覽" extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新增角色
            </Button>
          }>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="總角色數"
                  value={roles.length}
                  prefix={<KeyOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="總用戶數"
                  value={users.length}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="活躍用戶"
                  value={users.filter(u => u.is_active).length}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="管理員"
                  value={users.filter(u => u.role === 'admin').length}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="角色列表">
            <Table
              dataSource={roles}
              columns={roleColumns}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="用戶列表">
            <Table
              dataSource={users}
              columns={userColumns}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="權限樹狀圖">
            <Tree
              treeData={permissionTreeData}
              defaultExpandAll
              showLine
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="新增角色"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          onFinish={createRole}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="角色名稱"
                name="name"
                rules={[{ required: true, message: '請輸入角色名稱' }]}
              >
                <Input placeholder="例如: operator" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="顯示名稱"
                name="display_name"
              >
                <Input placeholder="例如: 操作員" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea rows={3} placeholder="角色描述" />
          </Form.Item>

          <Divider>權限設定</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="設備權限"
                name="device_permissions"
              >
                <Select mode="multiple" placeholder="選擇設備權限">
                  <Option value="read">查看設備</Option>
                  <Option value="create">創建設備</Option>
                  <Option value="update">編輯設備</Option>
                  <Option value="delete">刪除設備</Option>
                  <Option value="control">控制設備</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="用戶權限"
                name="user_permissions"
              >
                <Select mode="multiple" placeholder="選擇用戶權限">
                  <Option value="read">查看用戶</Option>
                  <Option value="create">創建用戶</Option>
                  <Option value="update">編輯用戶</Option>
                  <Option value="delete">刪除用戶</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="系統權限"
                name="system_permissions"
              >
                <Select mode="multiple" placeholder="選擇系統權限">
                  <Option value="audit">查看日誌</Option>
                  <Option value="settings">系統設定</Option>
                  <Option value="backup">備份還原</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                創建角色
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

export default RoleManagement; 