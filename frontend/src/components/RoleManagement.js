import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Typography,
  Divider,
  Badge,
  Tooltip,
  Popconfirm,
  message,
  Spin,
  Tabs,
  Tree,
  Checkbox,
  Alert,
  Descriptions,
  List,
  Avatar,
  Progress,
  Drawer,
  Transfer,
  TreeSelect,
  Collapse,
  Statistic
} from 'antd';
import {
  KeyOutlined,
  UserOutlined,
  SettingOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  ReloadOutlined,
  LockOutlined,
  UnlockOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ApiOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  RobotOutlined,
  DashboardOutlined,
  DesktopOutlined,
  AlertOutlined,
  HistoryOutlined,
  VideoCameraOutlined,
  NodeIndexOutlined,
  ProjectOutlined,
  AuditOutlined,
  TableOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const RoleManagement = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [permissionCategories, setPermissionCategories] = useState([]);
  const [pages, setPages] = useState([]);
  const [pageCategories, setPageCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [activeTab, setActiveTab] = useState('roles');
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 模擬數據
      setRoles([
        {
          id: 1,
          name: 'super_admin',
          display_name: '超級管理員',
          description: '擁有所有權限的超級管理員',
          level: 999,
          is_system: true,
          user_count: 1
        },
        {
          id: 2,
          name: 'admin',
          display_name: '系統管理員',
          description: '系統管理員，擁有大部分權限',
          level: 100,
          is_system: true,
          user_count: 3
        },
        {
          id: 3,
          name: 'operator',
          display_name: '操作員',
          description: '一般操作員，擁有基本操作權限',
          level: 50,
          is_system: false,
          user_count: 8
        },
        {
          id: 4,
          name: 'viewer',
          display_name: '檢視者',
          description: '只能檢視數據，無操作權限',
          level: 10,
          is_system: false,
          user_count: 15
        }
      ]);

      // 模擬用戶數據
      setUsers([
        {
          id: 1,
          username: 'admin',
          email: 'admin@company.com',
          role: 'admin',
          is_active: true,
          last_login: '2024-01-15 10:30:00'
        },
        {
          id: 2,
          username: 'operator1',
          email: 'operator1@company.com',
          role: 'operator',
          is_active: true,
          last_login: '2024-01-15 09:15:00'
        },
        {
          id: 3,
          username: 'viewer1',
          email: 'viewer1@company.com',
          role: 'viewer',
          is_active: true,
          last_login: '2024-01-15 08:45:00'
        }
      ]);

      // 模擬權限分類
      setPermissionCategories([
        {
          id: 1,
          name: 'dashboard',
          display_name: '儀表板',
          description: '儀表板相關權限',
          icon: 'DashboardOutlined'
        },
        {
          id: 2,
          name: 'device_management',
          display_name: '設備管理',
          description: '設備管理相關權限',
          icon: 'DesktopOutlined'
        },
        {
          id: 3,
          name: 'data_analysis',
          display_name: '數據分析',
          description: '數據分析相關權限',
          icon: 'BarChartOutlined'
        },
        {
          id: 4,
          name: 'ai_analysis',
          display_name: 'AI 分析',
          description: 'AI 分析相關權限',
          icon: 'RobotOutlined'
        },
        {
          id: 5,
          name: 'system_settings',
          display_name: '系統設定',
          description: '系統設定相關權限',
          icon: 'SettingOutlined'
        }
      ]);

      // 模擬權限數據
      setPermissions([
        {
          id: 1,
          category_id: 1,
          name: 'dashboard:view',
          display_name: '檢視儀表板',
          description: '允許檢視儀表板'
        },
        {
          id: 2,
          category_id: 1,
          name: 'dashboard:export',
          display_name: '匯出儀表板',
          description: '允許匯出儀表板數據'
        },
        {
          id: 3,
          category_id: 2,
          name: 'device:view',
          display_name: '檢視設備',
          description: '允許檢視設備列表'
        },
        {
          id: 4,
          category_id: 2,
          name: 'device:edit',
          display_name: '編輯設備',
          description: '允許編輯設備資訊'
        },
        {
          id: 5,
          category_id: 2,
          name: 'device:delete',
          display_name: '刪除設備',
          description: '允許刪除設備'
        },
        {
          id: 6,
          category_id: 3,
          name: 'data:view',
          display_name: '檢視數據',
          description: '允許檢視數據分析'
        },
        {
          id: 7,
          category_id: 3,
          name: 'data:export',
          display_name: '匯出數據',
          description: '允許匯出數據'
        },
        {
          id: 8,
          category_id: 4,
          name: 'ai:view',
          display_name: '檢視 AI 分析',
          description: '允許檢視 AI 分析結果'
        },
        {
          id: 9,
          category_id: 4,
          name: 'ai:train',
          display_name: '訓練 AI 模型',
          description: '允許訓練 AI 模型'
        },
        {
          id: 10,
          category_id: 5,
          name: 'settings:view',
          display_name: '檢視設定',
          description: '允許檢視系統設定'
        },
        {
          id: 11,
          category_id: 5,
          name: 'settings:edit',
          display_name: '編輯設定',
          description: '允許編輯系統設定'
        }
      ]);

      // 模擬頁面分類
      setPageCategories([
        {
          id: 1,
          name: 'core',
          display_name: '核心功能',
          description: '平台核心功能頁面'
        },
        {
          id: 2,
          name: 'analysis',
          display_name: '分析功能',
          description: '數據分析相關頁面'
        },
        {
          id: 3,
          name: 'management',
          display_name: '管理功能',
          description: '系統管理相關頁面'
        },
        {
          id: 4,
          name: 'advanced',
          display_name: '進階功能',
          description: '進階功能頁面'
        }
      ]);

      // 模擬頁面數據
      setPages([
        {
          id: 1,
          category_id: 1,
          name: 'dashboard',
          display_name: '儀表板',
          path: '/dashboard',
          description: '主要儀表板頁面'
        },
        {
          id: 2,
          category_id: 1,
          name: 'device_management',
          display_name: '設備管理',
          path: '/devices',
          description: '設備管理頁面'
        },
        {
          id: 3,
          category_id: 2,
          name: 'data_analysis',
          display_name: '數據分析',
          path: '/analysis',
          description: '數據分析頁面'
        },
        {
          id: 4,
          category_id: 2,
          name: 'ai_analysis',
          display_name: 'AI 分析',
          path: '/ai',
          description: 'AI 分析頁面'
        },
        {
          id: 5,
          category_id: 3,
          name: 'user_management',
          display_name: '用戶管理',
          path: '/users',
          description: '用戶管理頁面'
        },
        {
          id: 6,
          category_id: 3,
          name: 'role_management',
          display_name: '角色管理',
          path: '/roles',
          description: '角色管理頁面'
        },
        {
          id: 7,
          category_id: 4,
          name: 'video_recognition',
          display_name: '串流影像辨識',
          path: '/video',
          description: '串流影像辨識頁面'
        },
        {
          id: 8,
          category_id: 4,
          name: 'etl_flow_designer',
          display_name: 'ETL 流程設計器',
          path: '/etl-designer',
          description: 'ETL 流程設計器頁面'
        }
      ]);

    } catch (error) {
      message.error('載入數據失敗');
    } finally {
      setLoading(false);
    }
  };

  // 用戶列表欄位定義
  const userColumns = [
    {
      title: '用戶名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '電子郵件',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : role === 'operator' ? 'blue' : 'green'}>
          {role}
        </Tag>
      ),
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Badge status={isActive ? 'success' : 'error'} text={isActive ? '啟用' : '停用'} />
      ),
    },
    {
      title: '最後登入',
      dataIndex: 'last_login',
      key: 'last_login',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>
            檢視
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />}>
            編輯
          </Button>
        </Space>
      ),
    },
  ];

  // 角色列表欄位定義
  const roleColumns = [
    {
      title: '角色名稱',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '顯示名稱',
      dataIndex: 'display_name',
      key: 'display_name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '等級',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Tag color={level >= 100 ? 'red' : level >= 50 ? 'blue' : 'green'}>
          {level}
        </Tag>
      ),
    },
    {
      title: '用戶數',
      dataIndex: 'user_count',
      key: 'user_count',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>
            檢視
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />}>
            編輯
          </Button>
          {!record.is_system && (
            <Popconfirm
              title="確定要刪除這個角色嗎？"
              onConfirm={() => handleDeleteRole(record.id)}
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                刪除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const handleCreateRole = () => {
    setSelectedRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    form.setFieldsValue(role);
    setModalVisible(true);
  };

  const handleDeleteRole = async (roleId) => {
    try {
      // 這裡應該調用 API 刪除角色
      message.success('角色刪除成功');
      fetchData();
    } catch (error) {
      message.error('刪除失敗');
    }
  };

  const handleSaveRole = async (values) => {
    try {
      if (selectedRole) {
        // 更新角色
        message.success('角色更新成功');
      } else {
        // 新增角色
        message.success('角色新增成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('儲存失敗');
    }
  };

  // 建立角色函數
  const createRole = async (values) => {
    try {
      // 這裡應該調用 API 建立角色
      message.success('角色建立成功');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('建立失敗');
    }
  };

  // 權限樹狀數據
  const permissionTreeData = permissionCategories.map(category => ({
    title: (
      <Space>
        <Tag color="blue">{category.display_name}</Tag>
        <Text type="secondary">({permissions.filter(p => p.category_id === category.id).length} 個權限)</Text>
      </Space>
    ),
    key: `category-${category.id}`,
    children: permissions
      .filter(permission => permission.category_id === category.id)
      .map(permission => ({
        title: (
          <Space>
            <Text>{permission.display_name}</Text>
            <Text type="secondary">({permission.name})</Text>
          </Space>
        ),
        key: `permission-${permission.id}`,
      }))
  }));

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <KeyOutlined /> 角色與權限管理
      </Title>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="角色管理概覽" extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateRole}>
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
                rules={[{ required: true, message: '請輸入顯示名稱' }]}
              >
                <Input placeholder="例如: 操作員" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea rows={3} placeholder="請輸入角色描述" />
          </Form.Item>
          <Form.Item
            label="權限等級"
            name="level"
            rules={[{ required: true, message: '請選擇權限等級' }]}
          >
            <Select placeholder="請選擇權限等級">
              <Option value={10}>檢視者 (10)</Option>
              <Option value={50}>操作員 (50)</Option>
              <Option value={100}>管理員 (100)</Option>
              <Option value={999}>超級管理員 (999)</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                儲存
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