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
  Statistic,
  TimePicker,
  DatePicker,
  Slider,
  Rate,
  InputNumber,
  Upload,
  Image,
  Timeline,
  Steps,
  Result,
  Empty,
  Skeleton,
  Dropdown,
  Menu,
  Breadcrumb,
  PageHeader,
  Affix,
  Anchor,
  BackTop,
  ConfigProvider,
  theme,
  App,
  FloatButton
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
  TableOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  DownloadOutlined,
  UploadOutlined,
  ExportOutlined,
  ImportOutlined,
  CopyOutlined,
  LinkOutlined,
  DisconnectOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  ScheduleOutlined,
  NotificationOutlined,
  SoundOutlined,
  CameraOutlined,
  PictureOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  FileMarkdownOutlined,
  FileCodeOutlined,
  FileProtectOutlined,
  FileSearchOutlined,
  FileSyncOutlined,
  FileExclamationOutlined,
  FileDoneOutlined,
  FileAddOutlined,
  FileRemoveOutlined,
  FileJpgOutlined,
  FilePngOutlined,
  FileGifOutlined,
  FileBmpOutlined,
  FileTiffOutlined,
  FileSvgOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ThunderboltOutlined,
  CloudServerOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  CompassOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  BranchesOutlined,
  ApartmentOutlined,
  GatewayOutlined,
  CloudOutlined,
  RocketOutlined,
  BugOutlined,
  ToolOutlined,
  MonitorOutlined,
  ControlOutlined,
  HeatMapOutlined,
  PartitionOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  ScatterPlotOutlined,
  RadarChartOutlined,
  FunnelPlotOutlined,
  BoxPlotOutlined,
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  NodeCollapseOutlined,
  NodeExpandOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserSwitchOutlined,
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
  SolutionOutlined,
  SafetyOutlined,
  SecurityScanOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const RoleManagement = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissionCategories, setPermissionCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('roles');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('role');
  const [editingItem, setEditingItem] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [permissionForm] = Form.useForm();

  // 模擬數據
  const mockRoles = [
    {
      id: 1,
      name: 'admin',
      display_name: '系統管理員',
      description: '擁有所有權限的系統管理員',
      level: 100,
      is_system: true,
      is_active: true,
      user_count: 2,
      permission_count: 45,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'operator',
      display_name: '操作員',
      description: '負責日常設備操作和監控',
      level: 50,
      is_system: false,
      is_active: true,
      user_count: 5,
      permission_count: 25,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    },
    {
      id: 3,
      name: 'viewer',
      display_name: '檢視者',
      description: '只能檢視數據，無修改權限',
      level: 10,
      is_system: false,
      is_active: true,
      user_count: 8,
      permission_count: 15,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z'
    }
  ];

  const mockUsers = [
    {
      id: 1,
      username: 'admin',
      display_name: '系統管理員',
      email: 'admin@company.com',
      role: 'admin',
      avatar: 'https://joeschmoe.io/api/v1/admin',
      is_active: true,
      is_locked: false,
      last_login: '2024-01-15T10:30:00Z',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      username: 'operator1',
      display_name: '操作員 1',
      email: 'operator1@company.com',
      role: 'operator',
      avatar: 'https://joeschmoe.io/api/v1/operator1',
      is_active: true,
      is_locked: false,
      last_login: '2024-01-14T15:20:00Z',
      created_at: '2024-01-02T00:00:00Z'
    },
    {
      id: 3,
      username: 'viewer1',
      display_name: '檢視者 1',
      email: 'viewer1@company.com',
      role: 'viewer',
      avatar: 'https://joeschmoe.io/api/v1/viewer1',
      is_active: true,
      is_locked: false,
      last_login: '2024-01-13T09:15:00Z',
      created_at: '2024-01-03T00:00:00Z'
    }
  ];

  const mockPermissionCategories = [
    {
      id: 1,
      name: 'dashboard',
      display_name: '儀表板',
      description: '儀表板相關權限',
      permissions: [
        { id: 1, name: 'dashboard:view', display_name: '檢視儀表板', description: '檢視儀表板數據' },
        { id: 2, name: 'dashboard:export', display_name: '匯出儀表板', description: '匯出儀表板數據' }
      ]
    },
    {
      id: 2,
      name: 'device',
      display_name: '設備管理',
      description: '設備管理相關權限',
      permissions: [
        { id: 3, name: 'device:view', display_name: '檢視設備', description: '檢視設備列表和詳情' },
        { id: 4, name: 'device:create', display_name: '創建設備', description: '創建新設備' },
        { id: 5, name: 'device:edit', display_name: '編輯設備', description: '編輯設備資訊' },
        { id: 6, name: 'device:delete', display_name: '刪除設備', description: '刪除設備' }
      ]
    },
    {
      id: 3,
      name: 'user',
      display_name: '用戶管理',
      description: '用戶管理相關權限',
      permissions: [
        { id: 7, name: 'user:view', display_name: '檢視用戶', description: '檢視用戶列表和詳情' },
        { id: 8, name: 'user:create', display_name: '創建用戶', description: '創建新用戶' },
        { id: 9, name: 'user:edit', display_name: '編輯用戶', description: '編輯用戶資訊' },
        { id: 10, name: 'user:delete', display_name: '刪除用戶', description: '刪除用戶' }
      ]
    }
  ];

  const mockPermissions = mockPermissionCategories.flatMap(category => category.permissions);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRoles(mockRoles);
      setUsers(mockUsers);
      setPermissions(mockPermissions);
      setPermissionCategories(mockPermissionCategories);
    } catch (error) {
      message.error('載入數據失敗');
    } finally {
      setLoading(false);
    }
  };

  // 角色相關函數
  const handleCreateRole = () => {
    setModalType('role');
    setEditingItem(null);
    roleForm.resetFields();
    setModalVisible(true);
  };

  const handleEditRole = (role) => {
    setModalType('role');
    setEditingItem(role);
    roleForm.setFieldsValue(role);
    setModalVisible(true);
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoles(roles.filter(role => role.id !== roleId));
      message.success('角色刪除成功');
    } catch (error) {
      message.error('角色刪除失敗');
    }
  };

  const handleSaveRole = async (values) => {
    try {
      if (editingItem) {
        // 更新角色
        const updatedRoles = roles.map(role => 
          role.id === editingItem.id ? { ...role, ...values } : role
        );
        setRoles(updatedRoles);
        message.success('角色更新成功');
      } else {
        // 創建角色
        const newRole = {
          id: roles.length + 1,
          ...values,
          is_system: false,
          is_active: true,
          user_count: 0,
          permission_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setRoles([...roles, newRole]);
        message.success('角色創建成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('操作失敗');
    }
  };

  // 權限相關函數
  const handleCreatePermission = () => {
    setModalType('permission');
    setEditingItem(null);
    permissionForm.resetFields();
    setModalVisible(true);
  };

  const handleEditPermission = (permission) => {
    setModalType('permission');
    setEditingItem(permission);
    permissionForm.setFieldsValue(permission);
    setModalVisible(true);
  };

  const handleDeletePermission = async (permissionId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPermissions(permissions.filter(permission => permission.id !== permissionId));
      message.success('權限刪除成功');
    } catch (error) {
      message.error('權限刪除失敗');
    }
  };

  const handleSavePermission = async (values) => {
    try {
      if (editingItem) {
        // 更新權限
        const updatedPermissions = permissions.map(permission => 
          permission.id === editingItem.id ? { ...permission, ...values } : permission
        );
        setPermissions(updatedPermissions);
        message.success('權限更新成功');
      } else {
        // 創建權限
        const newPermission = {
          id: permissions.length + 1,
          ...values,
          created_at: new Date().toISOString()
        };
        setPermissions([...permissions, newPermission]);
        message.success('權限創建成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('操作失敗');
    }
  };

  // 用戶相關函數
  const handleCreateUser = () => {
    setModalType('user');
    setEditingItem(null);
    userForm.resetFields();
    setModalVisible(true);
  };

  const handleEditUser = (user) => {
    setModalType('user');
    setEditingItem(user);
    userForm.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(users.filter(user => user.id !== userId));
      message.success('用戶刪除成功');
    } catch (error) {
      message.error('用戶刪除失敗');
    }
  };

  const handleSaveUser = async (values) => {
    try {
      if (editingItem) {
        // 更新用戶
        const updatedUsers = users.map(user => 
          user.id === editingItem.id ? { ...user, ...values } : user
        );
        setUsers(updatedUsers);
        message.success('用戶更新成功');
      } else {
        // 創建用戶
        const newUser = {
          id: users.length + 1,
          ...values,
          avatar: `https://joeschmoe.io/api/v1/${values.username}`,
          is_active: true,
          is_locked: false,
          last_login: null,
          created_at: new Date().toISOString()
        };
        setUsers([...users, newUser]);
        message.success('用戶創建成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('操作失敗');
    }
  };

  // 狀態切換函數
  const handleRoleStatusToggle = (roleId, enabled) => {
    const updatedRoles = roles.map(role => 
      role.id === roleId ? { ...role, is_active: enabled } : role
    );
    setRoles(updatedRoles);
    message.success(`角色${enabled ? '啟用' : '停用'}成功`);
  };

  const handleUserStatusToggle = (userId, enabled) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, is_active: enabled } : user
    );
    setUsers(updatedUsers);
    message.success(`用戶${enabled ? '啟用' : '停用'}成功`);
  };

  const handlePermissionStatusToggle = (permissionId, enabled) => {
    const updatedPermissions = permissions.map(permission => 
      permission.id === permissionId ? { ...permission, is_active: enabled } : permission
    );
    setPermissions(updatedPermissions);
    message.success(`權限${enabled ? '啟用' : '停用'}成功`);
  };

  // 批量操作函數
  const handleBatchOperation = async (operation, selectedIds, type) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      switch (operation) {
        case 'delete':
          if (type === 'role') {
            setRoles(roles.filter(role => !selectedIds.includes(role.id)));
          } else if (type === 'user') {
            setUsers(users.filter(user => !selectedIds.includes(user.id)));
          } else if (type === 'permission') {
            setPermissions(permissions.filter(permission => !selectedIds.includes(permission.id)));
          }
          message.success('批量刪除成功');
          break;
        case 'enable':
          if (type === 'role') {
            setRoles(roles.map(role => 
              selectedIds.includes(role.id) ? { ...role, is_active: true } : role
            ));
          } else if (type === 'user') {
            setUsers(users.map(user => 
              selectedIds.includes(user.id) ? { ...user, is_active: true } : user
            ));
          }
          message.success('批量啟用成功');
          break;
        case 'disable':
          if (type === 'role') {
            setRoles(roles.map(role => 
              selectedIds.includes(role.id) ? { ...role, is_active: false } : role
            ));
          } else if (type === 'user') {
            setUsers(users.map(user => 
              selectedIds.includes(user.id) ? { ...user, is_active: false } : user
            ));
          }
          message.success('批量停用成功');
          break;
        default:
          break;
      }
      
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('批量操作失敗');
    }
  };

  // 匯出匯入函數
  const handleExportData = (type) => {
    let data = [];
    let filename = '';
    
    switch (type) {
      case 'role':
        data = roles;
        filename = 'roles.json';
        break;
      case 'user':
        data = users;
        filename = 'users.json';
        break;
      case 'permission':
        data = permissions;
        filename = 'permissions.json';
        break;
      default:
        return;
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    message.success('數據匯出成功');
  };

  const handleImportData = (type, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        switch (type) {
          case 'role':
            setRoles(data);
            break;
          case 'user':
            setUsers(data);
            break;
          case 'permission':
            setPermissions(data);
            break;
          default:
            break;
        }
        
        message.success('數據匯入成功');
      } catch (error) {
        message.error('數據格式錯誤');
      }
    };
    reader.readAsText(file);
  };

  // 詳細檢視函數
  const handleViewRoleDetail = (role) => {
    Modal.info({
      title: '角色詳情',
      width: 600,
      content: (
        <Descriptions column={2}>
          <Descriptions.Item label="角色名稱">{role.name}</Descriptions.Item>
          <Descriptions.Item label="顯示名稱">{role.display_name}</Descriptions.Item>
          <Descriptions.Item label="描述">{role.description}</Descriptions.Item>
          <Descriptions.Item label="權限等級">{role.level}</Descriptions.Item>
          <Descriptions.Item label="系統角色">{role.is_system ? '是' : '否'}</Descriptions.Item>
          <Descriptions.Item label="啟用狀態">{role.is_active ? '啟用' : '停用'}</Descriptions.Item>
          <Descriptions.Item label="用戶數量">{role.user_count}</Descriptions.Item>
          <Descriptions.Item label="權限數量">{role.permission_count}</Descriptions.Item>
          <Descriptions.Item label="創建時間">{role.created_at}</Descriptions.Item>
          <Descriptions.Item label="更新時間">{role.updated_at}</Descriptions.Item>
        </Descriptions>
      )
    });
  };

  const handleViewUserDetail = (user) => {
    Modal.info({
      title: '用戶詳情',
      width: 600,
      content: (
        <Descriptions column={2}>
          <Descriptions.Item label="用戶名">{user.username}</Descriptions.Item>
          <Descriptions.Item label="顯示名稱">{user.display_name}</Descriptions.Item>
          <Descriptions.Item label="電子郵件">{user.email}</Descriptions.Item>
          <Descriptions.Item label="角色">{user.role}</Descriptions.Item>
          <Descriptions.Item label="啟用狀態">{user.is_active ? '啟用' : '停用'}</Descriptions.Item>
          <Descriptions.Item label="鎖定狀態">{user.is_locked ? '已鎖定' : '未鎖定'}</Descriptions.Item>
          <Descriptions.Item label="最後登入">{user.last_login || '從未登入'}</Descriptions.Item>
          <Descriptions.Item label="創建時間">{user.created_at}</Descriptions.Item>
        </Descriptions>
      )
    });
  };

  // 密碼重置函數
  const handleResetPassword = async (userId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('密碼重置成功，新密碼已發送到用戶郵箱');
    } catch (error) {
      message.error('密碼重置失敗');
    }
  };

  // 用戶鎖定/解鎖函數
  const handleToggleUserLock = async (userId, locked) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, is_locked: locked } : user
      );
      setUsers(updatedUsers);
      message.success(`用戶${locked ? '鎖定' : '解鎖'}成功`);
    } catch (error) {
      message.error('操作失敗');
    }
  };

  // 權限分配函數
  const handleAssignPermissions = async (roleId, permissionIds) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('權限分配成功');
    } catch (error) {
      message.error('權限分配失敗');
    }
  };

  // 用戶角色分配函數
  const handleAssignUserRole = async (userId, roleId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, role: roles.find(role => role.id === roleId)?.name } : user
      );
      setUsers(updatedUsers);
      message.success('角色分配成功');
    } catch (error) {
      message.error('角色分配失敗');
    }
  };

  // 表格列定義
  const roleColumns = [
    {
      title: '角色名稱',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Text strong>{name}</Text>
          {record.is_system && <Tag color="red">系統</Tag>}
        </Space>
      )
    },
    {
      title: '顯示名稱',
      dataIndex: 'display_name',
      key: 'display_name'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '權限等級',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Tag color={level >= 100 ? 'red' : level >= 50 ? 'blue' : 'green'}>
          {level}
        </Tag>
      )
    },
    {
      title: '用戶數量',
      dataIndex: 'user_count',
      key: 'user_count',
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: '啟用狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleRoleStatusToggle(record.id, checked)}
          disabled={record.is_system}
        />
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewRoleDetail(record)}
          >
            詳情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
            disabled={record.is_system}
          >
            編輯
          </Button>
          <Popconfirm
            title="確定要重置密碼嗎？"
            onConfirm={() => handleResetPassword(record.id)}
          >
            <Button type="link" size="small" icon={<KeyOutlined />}>
              重置密碼
            </Button>
          </Popconfirm>
          <Popconfirm
            title="確定要刪除這個角色嗎？"
            onConfirm={() => handleDeleteRole(record.id)}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={record.is_system}
            >
              刪除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const userColumns = [
    {
      title: '用戶名',
      dataIndex: 'username',
      key: 'username',
      render: (username, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <Text strong>{username}</Text>
        </Space>
      )
    },
    {
      title: '顯示名稱',
      dataIndex: 'display_name',
      key: 'display_name'
    },
    {
      title: '電子郵件',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : role === 'operator' ? 'blue' : 'green'}>
          {role}
        </Tag>
      )
    },
    {
      title: '狀態',
      key: 'status',
      render: (_, record) => (
        <Space>
          <Badge status={record.is_active ? 'success' : 'error'} text={record.is_active ? '啟用' : '停用'} />
          {record.is_locked && <Tag color="orange">已鎖定</Tag>}
        </Space>
      )
    },
    {
      title: '最後登入',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (lastLogin) => lastLogin ? new Date(lastLogin).toLocaleString() : '從未登入'
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewUserDetail(record)}
          >
            詳情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            編輯
          </Button>
          <Button
            type="link"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => handleAssignUserRole(record.id, 1)}
          >
            分配角色
          </Button>
          <Popconfirm
            title="確定要刪除這個用戶嗎？"
            onConfirm={() => handleDeleteUser(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              刪除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const permissionColumns = [
    {
      title: '權限名稱',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '顯示名稱',
      dataIndex: 'display_name',
      key: 'display_name'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '分類',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (categoryId) => {
        const category = permissionCategories.find(cat => cat.id === categoryId);
        return <Tag color="blue">{category?.display_name}</Tag>;
      }
    },
    {
      title: '啟用狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handlePermissionStatusToggle(record.id, checked)}
        />
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditPermission(record)}
          >
            編輯
          </Button>
          <Popconfirm
            title="確定要刪除這個權限嗎？"
            onConfirm={() => handleDeletePermission(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              刪除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <KeyOutlined /> 角色與權限管理
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="角色總數"
              value={roles.length}
              prefix={<KeyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="用戶總數"
              value={users.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="權限總數"
              value={permissions.length}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活躍用戶"
              value={users.filter(user => user.is_active).length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="roles" onChange={setActiveTab}>
        <TabPane tab="角色管理" key="roles">
          <Card
            title="角色列表"
            extra={
              <Space>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => handleExportData('role')}
                >
                  匯出
                </Button>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) handleImportData('role', file);
                    };
                    input.click();
                  }}
                >
                  匯入
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateRole}
                >
                  新增角色
                </Button>
              </Space>
            }
          >
            <Table
              dataSource={roles}
              columns={roleColumns}
              rowKey="id"
              loading={loading}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="用戶管理" key="users">
          <Card
            title="用戶列表"
            extra={
              <Space>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => handleExportData('user')}
                >
                  匯出
                </Button>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) handleImportData('user', file);
                    };
                    input.click();
                  }}
                >
                  匯入
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateUser}
                >
                  新增用戶
                </Button>
              </Space>
            }
          >
            <Table
              dataSource={users}
              columns={userColumns}
              rowKey="id"
              loading={loading}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="權限管理" key="permissions">
          <Card
            title="權限列表"
            extra={
              <Space>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => handleExportData('permission')}
                >
                  匯出
                </Button>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) handleImportData('permission', file);
                    };
                    input.click();
                  }}
                >
                  匯入
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreatePermission}
                >
                  新增權限
                </Button>
              </Space>
            }
          >
            <Table
              dataSource={permissions}
              columns={permissionColumns}
              rowKey="id"
              loading={loading}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="權限分類" key="categories">
          <Card title="權限分類管理">
            <Collapse>
              {permissionCategories.map(category => (
                <Panel header={
                  <Space>
                    <Tag color="blue">{category.display_name}</Tag>
                    <Text type="secondary">({permissions.filter(p => p.category_id === category.id).length} 個權限)</Text>
                  </Space>
                } key={category.id}>
                  <List
                    dataSource={category.permissions}
                    renderItem={permission => (
                      <List.Item>
                        <Space>
                          <Text>{permission.display_name}</Text>
                          <Text type="secondary">({permission.name})</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Panel>
              ))}
            </Collapse>
          </Card>
        </TabPane>
      </Tabs>

      {/* 角色編輯模態框 */}
      <Modal
        title={editingItem ? '編輯角色' : '新增角色'}
        open={modalVisible && modalType === 'role'}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleSaveRole}
        >
          <Form.Item
            name="name"
            label="角色名稱"
            rules={[{ required: true, message: '請輸入角色名稱' }]}
          >
            <Input placeholder="請輸入角色名稱" />
          </Form.Item>
          <Form.Item
            name="display_name"
            label="顯示名稱"
            rules={[{ required: true, message: '請輸入顯示名稱' }]}
          >
            <Input placeholder="請輸入顯示名稱" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="請輸入描述" />
          </Form.Item>
          <Form.Item
            name="level"
            label="權限等級"
            rules={[{ required: true, message: '請輸入權限等級' }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingItem ? '更新' : '創建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 用戶編輯模態框 */}
      <Modal
        title={editingItem ? '編輯用戶' : '新增用戶'}
        open={modalVisible && modalType === 'user'}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleSaveUser}
        >
          <Form.Item
            name="username"
            label="用戶名"
            rules={[{ required: true, message: '請輸入用戶名' }]}
          >
            <Input placeholder="請輸入用戶名" />
          </Form.Item>
          <Form.Item
            name="display_name"
            label="顯示名稱"
            rules={[{ required: true, message: '請輸入顯示名稱' }]}
          >
            <Input placeholder="請輸入顯示名稱" />
          </Form.Item>
          <Form.Item
            name="email"
            label="電子郵件"
            rules={[
              { required: true, message: '請輸入電子郵件' },
              { type: 'email', message: '請輸入有效的電子郵件地址' }
            ]}
          >
            <Input placeholder="請輸入電子郵件" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '請選擇角色' }]}
          >
            <Select placeholder="請選擇角色">
              {roles.map(role => (
                <Option key={role.id} value={role.name}>
                  {role.display_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {!editingItem && (
            <Form.Item
              name="password"
              label="密碼"
              rules={[{ required: true, message: '請輸入密碼' }]}
            >
              <Input.Password placeholder="請輸入密碼" />
            </Form.Item>
          )}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingItem ? '更新' : '創建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 權限編輯模態框 */}
      <Modal
        title={editingItem ? '編輯權限' : '新增權限'}
        open={modalVisible && modalType === 'permission'}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={permissionForm}
          layout="vertical"
          onFinish={handleSavePermission}
        >
          <Form.Item
            name="name"
            label="權限名稱"
            rules={[{ required: true, message: '請輸入權限名稱' }]}
          >
            <Input placeholder="請輸入權限名稱" />
          </Form.Item>
          <Form.Item
            name="display_name"
            label="顯示名稱"
            rules={[{ required: true, message: '請輸入顯示名稱' }]}
          >
            <Input placeholder="請輸入顯示名稱" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="請輸入描述" />
          </Form.Item>
          <Form.Item
            name="category_id"
            label="分類"
            rules={[{ required: true, message: '請選擇分類' }]}
          >
            <Select placeholder="請選擇分類">
              {permissionCategories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.display_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingItem ? '更新' : '創建'}
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