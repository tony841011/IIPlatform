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
  FloatButton,
  Watermark,
  Tour,
  QRCode
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
  PauseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  WarningOutlined,
  HeartOutlined,
  TrophyOutlined,
  StarOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  PictureOutlined,
  CodeOutlined,
  BugOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  PieChartOutlined,
  HeatMapOutlined,
  PartitionOutlined,
  MonitorOutlined,
  ControlOutlined,
  RocketOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  CloudServerOutlined,
  CompassOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  BranchesOutlined,
  ApartmentOutlined,
  GatewayOutlined,
  CloudOutlined
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
  const [permissionCategories, setPermissionCategories] = useState([]);
  const [pages, setPages] = useState([]);
  const [pageCategories, setPageCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [activeTab, setActiveTab] = useState('roles');
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [permissionForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleDetailDrawerVisible, setRoleDetailDrawerVisible] = useState(false);
  const [userDetailDrawerVisible, setUserDetailDrawerVisible] = useState(false);
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState(null);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('descend');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [roleStats, setRoleStats] = useState({
    total_roles: 0,
    total_users: 0,
    active_users: 0,
    admin_users: 0,
    system_roles: 0,
    custom_roles: 0,
    total_permissions: 0,
    total_pages: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 模擬數據
      const mockRoles = [
        {
          id: 1,
          name: 'super_admin',
          display_name: '超級管理員',
          description: '擁有所有權限的超級管理員',
          level: 999,
          is_system: true,
          user_count: 1,
          created_at: '2024-01-01 00:00:00',
          updated_at: '2024-01-15 10:30:00',
          is_active: true,
          permissions: ['*'],
          pages: ['*']
        },
        {
          id: 2,
          name: 'admin',
          display_name: '系統管理員',
          description: '系統管理員，擁有大部分權限',
          level: 100,
          is_system: true,
          user_count: 3,
          created_at: '2024-01-01 00:00:00',
          updated_at: '2024-01-15 09:15:00',
          is_active: true,
          permissions: ['dashboard:view', 'dashboard:export', 'device:view', 'device:edit', 'data:view', 'data:export', 'ai:view', 'settings:view', 'settings:edit'],
          pages: ['dashboard', 'device_management', 'data_analysis', 'ai_analysis', 'user_management', 'role_management', 'system_settings']
        },
        {
          id: 3,
          name: 'operator',
          display_name: '操作員',
          description: '一般操作員，擁有基本操作權限',
          level: 50,
          is_system: false,
          user_count: 8,
          created_at: '2024-01-05 14:20:00',
          updated_at: '2024-01-15 08:45:00',
          is_active: true,
          permissions: ['dashboard:view', 'device:view', 'data:view'],
          pages: ['dashboard', 'device_management', 'data_analysis']
        },
        {
          id: 4,
          name: 'viewer',
          display_name: '檢視者',
          description: '只能檢視數據，無操作權限',
          level: 10,
          is_system: false,
          user_count: 15,
          created_at: '2024-01-10 11:30:00',
          updated_at: '2024-01-15 07:20:00',
          is_active: true,
          permissions: ['dashboard:view'],
          pages: ['dashboard']
        }
      ];

      const mockUsers = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@company.com',
          role: 'admin',
          is_active: true,
          last_login: '2024-01-15 10:30:00',
          created_at: '2024-01-01 00:00:00',
          avatar: 'https://joeschmoe.io/api/v1/admin',
          department: 'IT部門',
          phone: '0912-345-678',
          login_count: 156,
          failed_login_count: 2
        },
        {
          id: 2,
          username: 'operator1',
          email: 'operator1@company.com',
          role: 'operator',
          is_active: true,
          last_login: '2024-01-15 09:15:00',
          created_at: '2024-01-05 14:20:00',
          avatar: 'https://joeschmoe.io/api/v1/operator1',
          department: '營運部門',
          phone: '0923-456-789',
          login_count: 89,
          failed_login_count: 0
        },
        {
          id: 3,
          username: 'viewer1',
          email: 'viewer1@company.com',
          role: 'viewer',
          is_active: true,
          last_login: '2024-01-15 08:45:00',
          created_at: '2024-01-10 11:30:00',
          avatar: 'https://joeschmoe.io/api/v1/viewer1',
          department: '業務部門',
          phone: '0934-567-890',
          login_count: 45,
          failed_login_count: 1
        }
      ];

      const mockPermissionCategories = [
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
      ];

      const mockPermissions = [
        {
          id: 1,
          category_id: 1,
          name: 'dashboard:view',
          display_name: '檢視儀表板',
          description: '允許檢視儀表板',
          is_active: true,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 2,
          category_id: 1,
          name: 'dashboard:export',
          display_name: '匯出儀表板',
          description: '允許匯出儀表板數據',
          is_active: true,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 3,
          category_id: 2,
          name: 'device:view',
          display_name: '檢視設備',
          description: '允許檢視設備列表',
          is_active: true,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 4,
          category_id: 2,
          name: 'device:edit',
          display_name: '編輯設備',
          description: '允許編輯設備資訊',
          is_active: true,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 5,
          category_id: 2,
          name: 'device:delete',
          display_name: '刪除設備',
          description: '允許刪除設備',
          is_active: true,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 6,
          category_id: 3,
          name: 'data:view',
          display_name: '檢視數據',
          description: '允許檢視數據分析',
          is_active: true,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 7,
          category_id: 3,
          name: 'data:export',
          display_name: '匯出數據',
          description: '允許匯出數據',
          is_active: true,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 8,
          category_id: 4,
          name: 'ai:view',
          display_name: '檢視 AI 分析',
          description: '允許檢視 AI 分析結果',
          is_active: true,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 9,
          category_id: 4,
          name: 'ai:train',
          display_name: '訓練 AI 模型',
          description: '允許訓練 AI 模型',
          is_active: true,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 10,
          category_id: 5,
          name: 'settings:view',
          display_name: '檢視設定',
          description: '允許檢視系統設定',
          is_active: true,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 11,
          category_id: 5,
          name: 'settings:edit',
          display_name: '編輯設定',
          description: '允許編輯系統設定',
          is_active: true,
          created_at: '2024-01-01 00:00:00'
        }
      ];

      const mockPageCategories = [
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
      ];

      const mockPages = [
        {
          id: 1,
          category_id: 1,
          name: 'dashboard',
          display_name: '儀表板',
          path: '/dashboard',
          description: '主要儀表板頁面',
          is_active: true
        },
        {
          id: 2,
          category_id: 1,
          name: 'device_management',
          display_name: '設備管理',
          path: '/devices',
          description: '設備管理頁面',
          is_active: true
        },
        {
          id: 3,
          category_id: 2,
          name: 'data_analysis',
          display_name: '數據分析',
          path: '/analysis',
          description: '數據分析頁面',
          is_active: true
        },
        {
          id: 4,
          category_id: 2,
          name: 'ai_analysis',
          display_name: 'AI 分析',
          path: '/ai',
          description: 'AI 分析頁面',
          is_active: true
        },
        {
          id: 5,
          category_id: 3,
          name: 'user_management',
          display_name: '用戶管理',
          path: '/users',
          description: '用戶管理頁面',
          is_active: true
        },
        {
          id: 6,
          category_id: 3,
          name: 'role_management',
          display_name: '角色管理',
          path: '/roles',
          description: '角色管理頁面',
          is_active: true
        },
        {
          id: 7,
          category_id: 4,
          name: 'video_recognition',
          display_name: '串流影像辨識',
          path: '/video',
          description: '串流影像辨識頁面',
          is_active: true
        },
        {
          id: 8,
          category_id: 4,
          name: 'etl_flow_designer',
          display_name: 'ETL 流程設計器',
          path: '/etl-designer',
          description: 'ETL 流程設計器頁面',
          is_active: true
        }
      ];

      setRoles(mockRoles);
      setUsers(mockUsers);
      setPermissionCategories(mockPermissionCategories);
      setPermissions(mockPermissions);
      setPageCategories(mockPageCategories);
      setPages(mockPages);

      // 更新統計數據
      setRoleStats({
        total_roles: mockRoles.length,
        total_users: mockUsers.length,
        active_users: mockUsers.filter(u => u.is_active).length,
        admin_users: mockUsers.filter(u => u.role === 'admin').length,
        system_roles: mockRoles.filter(r => r.is_system).length,
        custom_roles: mockRoles.filter(r => !r.is_system).length,
        total_permissions: mockPermissions.length,
        total_pages: mockPages.length
      });

    } catch (error) {
      message.error('載入數據失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理新增角色
  const handleCreateRole = () => {
    setSelectedRole(null);
    roleForm.resetFields();
    setModalVisible(true);
  };

  // 處理編輯角色
  const handleEditRole = (role) => {
    setSelectedRole(role);
    roleForm.setFieldsValue(role);
    setModalVisible(true);
  };

  // 處理刪除角色
  const handleDeleteRole = async (roleId) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedRoles = roles.filter(role => role.id !== roleId);
      setRoles(updatedRoles);
      message.success('角色刪除成功');
    } catch (error) {
      message.error('刪除失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理儲存角色
  const handleSaveRole = async (values) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (selectedRole) {
        // 更新角色
        const updatedRoles = roles.map(role =>
          role.id === selectedRole.id ? { ...role, ...values, updated_at: new Date().toLocaleString() } : role
        );
        setRoles(updatedRoles);
        message.success('角色更新成功');
      } else {
        // 新增角色
        const newRole = {
          id: roles.length + 1,
          ...values,
          user_count: 0,
          created_at: new Date().toLocaleString(),
          updated_at: new Date().toLocaleString(),
          is_active: true,
          permissions: [],
          pages: []
        };
        setRoles([newRole, ...roles]);
        message.success('角色新增成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('儲存失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理新增權限
  const handleCreatePermission = () => {
    setSelectedPermission(null);
    permissionForm.resetFields();
    setPermissionModalVisible(true);
  };

  // 處理編輯權限
  const handleEditPermission = (permission) => {
    setSelectedPermission(permission);
    permissionForm.setFieldsValue(permission);
    setPermissionModalVisible(true);
  };

  // 處理刪除權限
  const handleDeletePermission = async (permissionId) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedPermissions = permissions.filter(permission => permission.id !== permissionId);
      setPermissions(updatedPermissions);
      message.success('權限刪除成功');
    } catch (error) {
      message.error('刪除失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理儲存權限
  const handleSavePermission = async (values) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (selectedPermission) {
        // 更新權限
        const updatedPermissions = permissions.map(permission =>
          permission.id === selectedPermission.id ? { ...permission, ...values } : permission
        );
        setPermissions(updatedPermissions);
        message.success('權限更新成功');
      } else {
        // 新增權限
        const newPermission = {
          id: permissions.length + 1,
          ...values,
          is_active: true,
          created_at: new Date().toLocaleString()
        };
        setPermissions([newPermission, ...permissions]);
        message.success('權限新增成功');
      }
      setPermissionModalVisible(false);
    } catch (error) {
      message.error('儲存失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理新增用戶
  const handleCreateUser = () => {
    setSelectedUser(null);
    userForm.resetFields();
    setUserModalVisible(true);
  };

  // 處理編輯用戶
  const handleEditUser = (user) => {
    setSelectedUser(user);
    userForm.setFieldsValue(user);
    setUserModalVisible(true);
  };

  // 處理刪除用戶
  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      message.success('用戶刪除成功');
    } catch (error) {
      message.error('刪除失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理儲存用戶
  const handleSaveUser = async (values) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (selectedUser) {
        // 更新用戶
        const updatedUsers = users.map(user =>
          user.id === selectedUser.id ? { ...user, ...values, updated_at: new Date().toLocaleString() } : user
        );
        setUsers(updatedUsers);
        message.success('用戶更新成功');
      } else {
        // 新增用戶
        const newUser = {
          id: users.length + 1,
          ...values,
          created_at: new Date().toLocaleString(),
          last_login: null,
          login_count: 0,
          failed_login_count: 0,
          avatar: `https://joeschmoe.io/api/v1/${values.username}`
        };
        setUsers([newUser, ...users]);
        message.success('用戶新增成功');
      }
      setUserModalVisible(false);
    } catch (error) {
      message.error('儲存失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理角色狀態切換
  const handleRoleStatusToggle = (roleId, enabled) => {
    const updatedRoles = roles.map(role =>
      role.id === roleId ? { ...role, is_active: enabled } : role
    );
    setRoles(updatedRoles);
    message.success(`角色狀態已${enabled ? '啟用' : '停用'}`);
  };

  // 處理用戶狀態切換
  const handleUserStatusToggle = (userId, enabled) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, is_active: enabled } : user
    );
    setUsers(updatedUsers);
    message.success(`用戶狀態已${enabled ? '啟用' : '停用'}`);
  };

  // 處理權限狀態切換
  const handlePermissionStatusToggle = (permissionId, enabled) => {
    const updatedPermissions = permissions.map(permission =>
      permission.id === permissionId ? { ...permission, is_active: enabled } : permission
    );
    setPermissions(updatedPermissions);
    message.success(`權限狀態已${enabled ? '啟用' : '停用'}`);
  };

  // 處理批量操作
  const handleBatchOperation = async (operation, selectedIds, type) => {
    try {
      setLoading(true);
      // 模擬批量操作
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (type === 'roles') {
        if (operation === 'delete') {
          const updatedRoles = roles.filter(role => !selectedIds.includes(role.id));
          setRoles(updatedRoles);
          message.success(`成功刪除 ${selectedIds.length} 個角色`);
        } else if (operation === 'activate') {
          const updatedRoles = roles.map(role =>
            selectedIds.includes(role.id) ? { ...role, is_active: true } : role
          );
          setRoles(updatedRoles);
          message.success(`成功啟用 ${selectedIds.length} 個角色`);
        } else if (operation === 'deactivate') {
          const updatedRoles = roles.map(role =>
            selectedIds.includes(role.id) ? { ...role, is_active: false } : role
          );
          setRoles(updatedRoles);
          message.success(`成功停用 ${selectedIds.length} 個角色`);
        }
      } else if (type === 'users') {
        if (operation === 'delete') {
          const updatedUsers = users.filter(user => !selectedIds.includes(user.id));
          setUsers(updatedUsers);
          message.success(`成功刪除 ${selectedIds.length} 個用戶`);
        } else if (operation === 'activate') {
          const updatedUsers = users.map(user =>
            selectedIds.includes(user.id) ? { ...user, is_active: true } : user
          );
          setUsers(updatedUsers);
          message.success(`成功啟用 ${selectedIds.length} 個用戶`);
        } else if (operation === 'deactivate') {
          const updatedUsers = users.map(user =>
            selectedIds.includes(user.id) ? { ...user, is_active: false } : user
          );
          setUsers(updatedUsers);
          message.success(`成功停用 ${selectedIds.length} 個用戶`);
        }
      }
    } catch (error) {
      message.error('操作失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理匯出數據
  const handleExportData = (type) => {
    let data = [];
    let filename = '';
    
    if (type === 'roles') {
      data = roles.map(role => ({
        角色名稱: role.name,
        顯示名稱: role.display_name,
        描述: role.description,
        等級: role.level,
        用戶數: role.user_count,
        系統角色: role.is_system ? '是' : '否',
        狀態: role.is_active ? '啟用' : '停用',
        創建時間: role.created_at,
        更新時間: role.updated_at
      }));
      filename = 'roles_export.csv';
    } else if (type === 'users') {
      data = users.map(user => ({
        用戶名: user.username,
        電子郵件: user.email,
        角色: user.role,
        部門: user.department,
        電話: user.phone,
        狀態: user.is_active ? '啟用' : '停用',
        最後登入: user.last_login,
        登入次數: user.login_count,
        失敗登入次數: user.failed_login_count,
        創建時間: user.created_at
      }));
      filename = 'users_export.csv';
    } else if (type === 'permissions') {
      data = permissions.map(permission => ({
        權限名稱: permission.name,
        顯示名稱: permission.display_name,
        描述: permission.description,
        分類: permissionCategories.find(cat => cat.id === permission.category_id)?.display_name,
        狀態: permission.is_active ? '啟用' : '停用',
        創建時間: permission.created_at
      }));
      filename = 'permissions_export.csv';
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success(`${type} 數據匯出成功`);
  };

  // 處理匯入數據
  const handleImportData = (type, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (type === 'roles' && data.roles) {
          setRoles(data.roles);
          message.success('角色數據匯入成功');
        } else if (type === 'users' && data.users) {
          setUsers(data.users);
          message.success('用戶數據匯入成功');
        } else if (type === 'permissions' && data.permissions) {
          setPermissions(data.permissions);
          message.success('權限數據匯入成功');
        }
      } catch (error) {
        message.error('匯入失敗：檔案格式錯誤');
      }
    };
    reader.readAsText(file);
  };

  // 處理角色詳情
  const handleViewRoleDetail = (role) => {
    setSelectedRoleForDetail(role);
    setRoleDetailDrawerVisible(true);
  };

  // 處理用戶詳情
  const handleViewUserDetail = (user) => {
    setSelectedUserForDetail(user);
    setUserDetailDrawerVisible(true);
  };

  // 處理重置密碼
  const handleResetPassword = async (userId) => {
    try {
      setLoading(true);
      // 模擬重置密碼
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success('密碼重置成功，新密碼已發送到用戶郵箱');
    } catch (error) {
      message.error('密碼重置失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理鎖定/解鎖用戶
  const handleToggleUserLock = async (userId, locked) => {
    try {
      setLoading(true);
      // 模擬鎖定/解鎖用戶
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, is_locked: locked } : user
      );
      setUsers(updatedUsers);
      message.success(`用戶已${locked ? '鎖定' : '解鎖'}`);
    } catch (error) {
      message.error('操作失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理角色權限分配
  const handleAssignPermissions = async (roleId, permissionIds) => {
    try {
      setLoading(true);
      // 模擬分配權限
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedRoles = roles.map(role =>
        role.id === roleId ? { ...role, permissions: permissionIds } : role
      );
      setRoles(updatedRoles);
      message.success('權限分配成功');
    } catch (error) {
      message.error('權限分配失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理用戶角色分配
  const handleAssignUserRole = async (userId, roleId) => {
    try {
      setLoading(true);
      // 模擬分配角色
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, role: roles.find(r => r.id === roleId)?.name } : user
      );
      setUsers(updatedUsers);
      message.success('角色分配成功');
    } catch (error) {
      message.error('角色分配失敗');
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
      render: (username, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <Text strong>{username}</Text>
        </Space>
      )
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
      title: '部門',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive, record) => (
        <Space>
          <Badge status={isActive ? 'success' : 'error'} text={isActive ? '啟用' : '停用'} />
          {record.is_locked && <Tag color="orange">已鎖定</Tag>}
        </Space>
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
          <Popconfirm
            title="確定要重置此用戶的密碼嗎？"
            onConfirm={() => handleResetPassword(record.id)}
          >
            <Button type="link" size="small" icon={<KeyOutlined />}>
              重置密碼
            </Button>
          </Popconfirm>
          <Popconfirm
            title={`確定要${record.is_locked ? '解鎖' : '鎖定'}此用戶嗎？`}
            onConfirm={() => handleToggleUserLock(record.id, !record.is_locked)}
          >
            <Button 
              type="link" 
              size="small" 
              icon={record.is_locked ? <UnlockOutlined /> : <LockOutlined />}
            >
              {record.is_locked ? '解鎖' : '鎖定'}
            </Button>
          </Popconfirm>
          <Popconfirm
            title="確定要刪除此用戶嗎？"
            onConfirm={() => handleDeleteUser(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              刪除
            </Button>
          </Popconfirm>
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
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          size="small"
          onChange={(checked) => handleRoleStatusToggle(record.id, checked)}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
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
          >
            編輯
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<SettingOutlined />}
            onClick={() => {
              // 打開權限分配模態框
              message.info('權限分配功能');
            }}
          >
            權限
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

  // 權限列表欄位定義
  const permissionColumns = [
    {
      title: '權限名稱',
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
      title: '分類',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (categoryId) => {
        const category = permissionCategories.find(cat => cat.id === categoryId);
        return <Tag color="blue">{category?.display_name}</Tag>;
      }
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          size="small"
          onChange={(checked) => handlePermissionStatusToggle(record.id, checked)}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
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
            title="確定要刪除此權限嗎？"
            onConfirm={() => handleDeletePermission(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              刪除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

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

      {/* 統計卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="總角色數"
              value={roleStats.total_roles}
              prefix={<KeyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="總用戶數"
              value={roleStats.total_users}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活躍用戶"
              value={roleStats.active_users}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="管理員"
              value={roleStats.admin_users}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="roles" onChange={setActiveTab}>
        {/* 角色管理 */}
        <TabPane tab="角色管理" key="roles">
          <Card 
            title="角色管理" 
            extra={
              <Space>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => handleExportData('roles')}
                >
                  匯出角色
                </Button>
                <Button 
                  icon={<UploadOutlined />}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleImportData('roles', file);
                      }
                    };
                    input.click();
                  }}
                >
                  匯入角色
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
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
              }}
              onChange={(pagination, filters, sorter) => {
                setPagination(pagination);
                setSortField(sorter.field);
                setSortOrder(sorter.order);
              }}
            />
          </Card>
        </TabPane>

        {/* 用戶管理 */}
        <TabPane tab="用戶管理" key="users">
          <Card 
            title="用戶管理" 
            extra={
              <Space>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => handleExportData('users')}
                >
                  匯出用戶
                </Button>
                <Button 
                  icon={<UploadOutlined />}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleImportData('users', file);
                      }
                    };
                    input.click();
                  }}
                >
                  匯入用戶
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
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
              }}
              onChange={(pagination, filters, sorter) => {
                setPagination(pagination);
                setSortField(sorter.field);
                setSortOrder(sorter.order);
              }}
            />
          </Card>
        </TabPane>

        {/* 權限管理 */}
        <TabPane tab="權限管理" key="permissions">
          <Card 
            title="權限管理" 
            extra={
              <Space>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => handleExportData('permissions')}
                >
                  匯出權限
                </Button>
                <Button 
                  icon={<UploadOutlined />}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleImportData('permissions', file);
                      }
                    };
                    input.click();
                  }}
                >
                  匯入權限
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
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
              }}
              onChange={(pagination, filters, sorter) => {
                setPagination(pagination);
                setSortField(sorter.field);
                setSortOrder(sorter.order);
              }}
            />
          </Card>
        </TabPane>

        {/* 權限樹狀圖 */}
        <TabPane tab="權限樹狀圖" key="permission-tree">
          <Card title="權限樹狀圖">
            <Tree
              treeData={permissionTreeData}
              defaultExpandAll
              showLine
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 角色新增/編輯模態框 */}
      <Modal
        title={selectedRole ? "編輯角色" : "新增角色"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={roleForm}
          onFinish={handleSaveRole}
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
              <Button type="primary" htmlType="submit" loading={loading}>
                儲存
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 權限新增/編輯模態框 */}
      <Modal
        title={selectedPermission ? "編輯權限" : "新增權限"}
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={permissionForm}
          onFinish={handleSavePermission}
          layout="vertical"
        >
          <Form.Item
            label="權限名稱"
            name="name"
            rules={[{ required: true, message: '請輸入權限名稱' }]}
          >
            <Input placeholder="例如: dashboard:view" />
          </Form.Item>
          <Form.Item
            label="顯示名稱"
            name="display_name"
            rules={[{ required: true, message: '請輸入顯示名稱' }]}
          >
            <Input placeholder="例如: 檢視儀表板" />
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea rows={3} placeholder="請輸入權限描述" />
          </Form.Item>
          <Form.Item
            label="權限分類"
            name="category_id"
            rules={[{ required: true, message: '請選擇權限分類' }]}
          >
            <Select placeholder="請選擇權限分類">
              {permissionCategories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.display_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                儲存
              </Button>
              <Button onClick={() => setPermissionModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 用戶新增/編輯模態框 */}
      <Modal
        title={selectedUser ? "編輯用戶" : "新增用戶"}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={userForm}
          onFinish={handleSaveUser}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="用戶名"
                name="username"
                rules={[{ required: true, message: '請輸入用戶名' }]}
              >
                <Input placeholder="請輸入用戶名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="電子郵件"
                name="email"
                rules={[
                  { required: true, message: '請輸入電子郵件' },
                  { type: 'email', message: '請輸入有效的電子郵件' }
                ]}
              >
                <Input placeholder="請輸入電子郵件" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="角色"
                name="role"
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
            </Col>
            <Col span={12}>
              <Form.Item
                label="部門"
                name="department"
              >
                <Input placeholder="請輸入部門" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="電話"
                name="phone"
              >
                <Input placeholder="請輸入電話" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="狀態"
                name="is_active"
                valuePropName="checked"
              >
                <Switch checkedChildren="啟用" unCheckedChildren="停用" />
              </Form.Item>
            </Col>
          </Row>
          {!selectedUser && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="密碼"
                  name="password"
                  rules={[{ required: true, message: '請輸入密碼' }]}
                >
                  <Input.Password placeholder="請輸入密碼" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="確認密碼"
                  name="confirm_password"
                  rules={[
                    { required: true, message: '請確認密碼' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('兩次輸入的密碼不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="請確認密碼" />
                </Form.Item>
              </Col>
            </Row>
          )}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                儲存
              </Button>
              <Button onClick={() => setUserModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 角色詳情抽屜 */}
      <Drawer
        title="角色詳情"
        placement="right"
        width={600}
        open={roleDetailDrawerVisible}
        onClose={() => setRoleDetailDrawerVisible(false)}
      >
        {selectedRoleForDetail && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="角色名稱">
                {selectedRoleForDetail.name}
              </Descriptions.Item>
              <Descriptions.Item label="顯示名稱">
                {selectedRoleForDetail.display_name}
              </Descriptions.Item>
              <Descriptions.Item label="描述">
                {selectedRoleForDetail.description}
              </Descriptions.Item>
              <Descriptions.Item label="權限等級">
                <Tag color={selectedRoleForDetail.level >= 100 ? 'red' : selectedRoleForDetail.level >= 50 ? 'blue' : 'green'}>
                  {selectedRoleForDetail.level}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="用戶數">
                <Badge count={selectedRoleForDetail.user_count} style={{ backgroundColor: '#52c41a' }} />
              </Descriptions.Item>
              <Descriptions.Item label="系統角色">
                <Tag color={selectedRoleForDetail.is_system ? 'red' : 'green'}>
                  {selectedRoleForDetail.is_system ? '是' : '否'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="狀態">
                <Badge status={selectedRoleForDetail.is_active ? 'success' : 'error'} text={selectedRoleForDetail.is_active ? '啟用' : '停用'} />
              </Descriptions.Item>
              <Descriptions.Item label="創建時間">
                {selectedRoleForDetail.created_at}
              </Descriptions.Item>
              <Descriptions.Item label="更新時間">
                {selectedRoleForDetail.updated_at}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Title level={5}>權限列表</Title>
            <List
              size="small"
              dataSource={selectedRoleForDetail.permissions}
              renderItem={permission => (
                <List.Item>
                  <Tag color="blue">{permission}</Tag>
                </List.Item>
              )}
            />
          </div>
        )}
      </Drawer>

      {/* 用戶詳情抽屜 */}
      <Drawer
        title="用戶詳情"
        placement="right"
        width={600}
        open={userDetailDrawerVisible}
        onClose={() => setUserDetailDrawerVisible(false)}
      >
        {selectedUserForDetail && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="用戶名">
                <Space>
                  <Avatar src={selectedUserForDetail.avatar} icon={<UserOutlined />} />
                  <Text strong>{selectedUserForDetail.username}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="電子郵件">
                {selectedUserForDetail.email}
              </Descriptions.Item>
              <Descriptions.Item label="角色">
                <Tag color={selectedUserForDetail.role === 'admin' ? 'red' : selectedUserForDetail.role === 'operator' ? 'blue' : 'green'}>
                  {selectedUserForDetail.role}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="部門">
                {selectedUserForDetail.department}
              </Descriptions.Item>
              <Descriptions.Item label="電話">
                {selectedUserForDetail.phone}
              </Descriptions.Item>
              <Descriptions.Item label="狀態">
                <Badge status={selectedUserForDetail.is_active ? 'success' : 'error'} text={selectedUserForDetail.is_active ? '啟用' : '停用'} />
              </Descriptions.Item>
              <Descriptions.Item label="最後登入">
                {selectedUserForDetail.last_login || '從未登入'}
              </Descriptions.Item>
              <Descriptions.Item label="登入次數">
                {selectedUserForDetail.login_count}
              </Descriptions.Item>
              <Descriptions.Item label="失敗登入次數">
                {selectedUserForDetail.failed_login_count}
              </Descriptions.Item>
              <Descriptions.Item label="創建時間">
                {selectedUserForDetail.created_at}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Title level={5}>登入統計</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="登入次數"
                  value={selectedUserForDetail.login_count}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="失敗次數"
                  value={selectedUserForDetail.failed_login_count}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Col>
            </Row>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RoleManagement; 