import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, theme, Dropdown, Space, Avatar, Button, Modal, Form, Input, Select, message, Badge } from 'antd';
import {
  DashboardOutlined,
  DesktopOutlined,
  AlertOutlined,
  HistoryOutlined,
  RobotOutlined,
  SettingOutlined,
  UserOutlined,
  ApiOutlined,
  CloudUploadOutlined,
  SafetyCertificateOutlined,
  ProjectOutlined,
  AuditOutlined,
  KeyOutlined,
  TeamOutlined,
  DatabaseOutlined,
  TableOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  LogoutOutlined,
  LoginOutlined,
  SwapOutlined,
  ExperimentOutlined,
  BellOutlined,
  FileTextOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  HeatMapOutlined,
  PartitionOutlined,
  MonitorOutlined,
  ControlOutlined,
  RocketOutlined,
  BugOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  CloudServerOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  CompassOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  BranchesOutlined,
  NodeIndexOutlined,
  ApartmentOutlined,
  GatewayOutlined,
  CloudOutlined,
  SyncOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
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
  TagOutlined,
  DatabaseOutlined as DatabaseIcon
} from '@ant-design/icons';

// 導入組件
import PlatformIntro from './components/PlatformIntro';
import DeviceManagement from './components/DeviceManagement';
import DeviceCategories from './components/DeviceCategories';
import NotificationPreferences from './components/NotificationPreferences';
import RoleManagement from './components/RoleManagement';
import DatabaseConnectionManagement from './components/DatabaseConnectionManagement';
import SystemSupport from './components/SystemSupport';
import UsageAnalytics from './components/UsageAnalytics';
import Dashboard from './components/Dashboard';
import AlertCenter from './components/AlertCenter';
import HistoricalAnalysis from './components/HistoricalAnalysis';
import AIAnalysis from './components/AIAnalysis';
import CommunicationProtocols from './components/CommunicationProtocols';
import TableSchema from './components/TableSchema';
import DataProcessing from './components/DataProcessing';
import DataTransformation from './components/DataTransformation';
import VideoRecognition from './components/VideoRecognition';
import MLOps from './components/MLOps';
import GPUMonitoring from './components/GPUMonitoring';
import EdgeGateway from './components/EdgeGateway';
import GISIntegration from './components/GISIntegration';
import RuleEngine from './components/RuleEngine';
import WorkflowAutomation from './components/WorkflowAutomation';
import AuditTrail from './components/AuditTrail';
import ReportingSystem from './components/ReportingSystem';
import OTAUpdate from './components/OTAUpdate';
import CustomDashboard from './components/CustomDashboard';
import AIModelManagement from './components/AIModelManagement';
import Login from './components/Login';
import TestDataTable from './components/TestDataTable';
import TableErrorTest from './components/TableErrorTest';
import RawDataErrorTest from './components/RawDataErrorTest';
import DatabaseConnectionTest from './components/DatabaseConnectionTest';

// 導入錯誤邊界
import ErrorBoundary from './components/ErrorBoundary';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

// 導入工具
import { getAuthToken, removeAuthToken } from './utils/authUtils';
import { handleButtonClick } from './utils/buttonHandlers';

const { Header, Content, Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    username: 'admin',
    displayName: '系統管理員',
    role: 'admin',
    permissions: ['all']
  });
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [roleSwitchModalVisible, setRoleSwitchModalVisible] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState({});

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 檢查用戶權限 - 暫時繞過登入檢查
  const hasPermission = (permission) => {
    // 暫時返回 true，繞過權限檢查
    return true;
  };

  // 根據權限過濾選單項目
  const getFilteredMenuItems = () => {
    const allMenuItems = [
      {
        key: 'platform-intro',
        icon: <InfoCircleOutlined />,
        label: <Link to="/platform-intro">平台簡介</Link>,
      },
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard">總覽儀表板</Link>,
      },
      {
        key: 'monitoring',
        icon: <MonitorOutlined />,
        label: '監控分析',
        children: [
          {
            key: 'historical-analysis',
            icon: <HistoryOutlined />,
            label: <Link to="/historical-analysis">歷史分析</Link>,
          },
          {
            key: 'ai-analysis',
            icon: <RobotOutlined />,
            label: <Link to="/ai-analysis">AI 分析</Link>,
          },
          {
            key: 'alert-center',
            icon: <AlertOutlined />,
            label: <Link to="/alert-center">告警中心</Link>,
          },
        ],
      },
      {
        key: 'data-processing',
        icon: <DatabaseOutlined />,
        label: '數據處理',
        children: [
          {
            key: 'communication-protocols',
            icon: <ApiOutlined />,
            label: <Link to="/communication-protocols">通訊協定</Link>,
          },
          {
            key: 'table-schema',
            icon: <TableOutlined />,
            label: <Link to="/table-schema">資料表結構</Link>,
          },
          {
            key: 'data-processing',
            icon: <DatabaseOutlined />,
            label: <Link to="/data-processing">數據處理</Link>,
          },
          {
            key: 'data-transformation',
            icon: <SyncOutlined />,
            label: <Link to="/data-transformation">數據轉換</Link>,
          },
        ],
      },
      {
        key: 'ai-applications',
        icon: <RobotOutlined />,
        label: 'AI 應用',
        children: [
          {
            key: 'ai-model-management',
            icon: <RocketOutlined />,
            label: <Link to="/ai-model-management">AI Model 管理</Link>,
          },
          {
            key: 'ai-anomaly-detection',
            icon: <BugOutlined />,
            label: <Link to="/ai-anomaly-detection">AI 異常偵測系統</Link>,
          },
          {
            key: 'stream-video-recognition',
            icon: <VideoCameraOutlined />,
            label: <Link to="/stream-video-recognition">串流影像辨識</Link>,
          },
          {
            key: 'mlops',
            icon: <ExperimentOutlined />,
            label: <Link to="/mlops">MLOPs</Link>,
          },
        ],
      },
      {
        key: 'device-management',
        icon: <DesktopOutlined />,
        label: '設備管理',
        children: [
          {
            key: 'device-management',
            icon: <DesktopOutlined />,
            label: <Link to="/device-management">設備管理</Link>,
          },
          {
            key: 'device-categories',
            icon: <TagOutlined />,
            label: <Link to="/device-categories">設備類別管理</Link>,
          },
          {
            key: 'ota-update',
            icon: <CloudUploadOutlined />,
            label: <Link to="/ota-update">OTA更新</Link>,
          },
          {
            key: 'edge-gateway',
            icon: <GatewayOutlined />,
            label: <Link to="/edge-gateway">邊緣閘道</Link>,
          },
          {
            key: 'gis-integration',
            icon: <GlobalOutlined />,
            label: <Link to="/gis-integration">地理資訊</Link>,
          },
        ],
      },
      {
        key: 'automation-workflow',
        icon: <PartitionOutlined />,
        label: '自動化工作流',
        children: [
          {
            key: 'rule-engine',
            icon: <ToolOutlined />,
            label: <Link to="/rule-engine">規則引擎</Link>,
          },
          {
            key: 'workflow',
            icon: <BranchesOutlined />,
            label: <Link to="/workflow">工作流程</Link>,
          },
          {
            key: 'audit-logs',
            icon: <AuditOutlined />,
            label: <Link to="/audit-logs">審計日誌</Link>,
          },
          {
            key: 'report-system',
            icon: <FileTextOutlined />,
            label: <Link to="/report-system">報表系統</Link>,
          },
        ],
      },
      {
        key: 'system-management',
        icon: <SettingOutlined />,
        label: '系統管理',
        children: [
          {
            key: 'system-settings',
            icon: <SettingOutlined />,
            label: <Link to="/system-settings">系統設定</Link>,
          },
          {
            key: 'notification-preferences',
            icon: <BellOutlined />,
            label: <Link to="/notification-preferences">通知偏好</Link>,
          },
          {
            key: 'role-management',
            icon: <SafetyCertificateOutlined />,
            label: <Link to="/role-management">角色管理</Link>,
          },
          {
            key: 'user-management',
            icon: <UserOutlined />,
            label: <Link to="/user-management">用戶管理</Link>,
          },
          {
            key: 'database-connections',
            icon: <DatabaseOutlined />,
            label: <Link to="/database-connections">資料庫連線</Link>,
          },
          {
            key: 'system-support',
            icon: <PhoneOutlined />,
            label: <Link to="/system-support">系統維護聯絡</Link>,
          },
          {
            key: 'usage-analytics',
            icon: <BarChartOutlined />,
            label: <Link to="/usage-analytics">使用者行為分析</Link>,
          },
          {
            key: 'developer-portal',
            icon: <ApiOutlined />,
            label: <Link to="/developer-portal">開發者平台</Link>,
          },
        ],
      },
    ];

    // 根據權限過濾選單
    return allMenuItems.filter(item => {
      if (item.children) {
        item.children = item.children.filter(child => {
          const permission = getPermissionByKey(child.key);
          return hasPermission(permission);
        });
        return item.children.length > 0;
      } else {
        const permission = getPermissionByKey(item.key);
        return hasPermission(permission);
      }
    });
  };

  // 根據選單鍵值獲取對應權限
  const getPermissionByKey = (key) => {
    const permissionMap = {
      'platform-intro': 'platform_view',
      'dashboard': 'dashboard_view',
      'device-management': 'device_management',
      'device-categories': 'device_management',
      'notification-preferences': 'notification_management',
      'role-management': 'user_management',
      'database-connections': 'system_management',
      'system-support': 'system_management',
      'usage-analytics': 'analytics_view',
      'developer-portal': 'developer_access'
    };
    return permissionMap[key] || 'data_view';
  };

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    setLoginModalVisible(false);
    
    // 更新資料庫狀態
    if (userData.selectedDatabases) {
      setDatabaseStatus(userData.selectedDatabases);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setDatabaseStatus({});
    message.success('已登出！');
  };

  const handleRoleSwitch = (values) => {
    const roleNames = {
      'admin': '系統管理員',
      'operator': '操作員',
      'viewer': '檢視者'
    };
    
    setCurrentUser({
      ...currentUser,
      role: values.role,
      displayName: roleNames[values.role],
      permissions: getPermissionsByRole(values.role)
    });
    setRoleSwitchModalVisible(false);
    message.success(`已切換到 ${roleNames[values.role]} 角色！`);
  };

  const getPermissionsByRole = (role) => {
    const permissions = {
      admin: ['all'],
      operator: ['device_management', 'data_view', 'alert_management', 'dashboard_view'],
      viewer: ['data_view', 'report_view', 'dashboard_view']
    };
    return permissions[role] || permissions.viewer;
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '個人資料',
    },
    {
      key: 'switch-role',
      icon: <SwapOutlined />,
      label: '切換角色',
      onClick: () => setRoleSwitchModalVisible(true),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: handleLogout,
    },
  ];

  // 如果未登入，顯示登入頁面
  // 暫時繞過登入檢查，直接進入系統
  // if (!isLoggedIn) {
  //   return <Login onLoginSuccess={handleLoginSuccess} />;
  // }

  return (
    <GlobalErrorBoundary>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
            <div style={{ 
              height: 32, 
              margin: 16, 
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: borderRadiusLG,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              {collapsed ? 'IIP' : 'IIPlatform'}
            </div>
            <Menu
              theme="dark"
              defaultSelectedKeys={['dashboard']}
              mode="inline"
              items={getFilteredMenuItems()}
            />
          </Sider>
          <Layout>
            <Header style={{ padding: 0, background: colorBgContainer }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0 24px'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  工業物聯網平台
                </div>
                <Space>
                  {/* 資料庫狀態指示器 */}
                  <Space>
                    {Object.entries(databaseStatus).map(([db, status]) => (
                      <Badge
                        key={db}
                        status={status ? 'success' : 'error'}
                        text={
                          <span style={{ fontSize: '12px' }}>
                            {db.toUpperCase()}
                          </span>
                        }
                      />
                    ))}
                  </Space>
                  
                  <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                  >
                    <Button type="text" icon={<UserOutlined />}>
                      {currentUser?.displayName || currentUser?.username}
                    </Button>
                  </Dropdown>
                </Space>
              </div>
            </Header>
            <Content style={{ margin: '0 16px' }}>
              <div style={{
                padding: 24,
                minHeight: 360,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}>
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/platform-intro" element={<PlatformIntro />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/custom-dashboard" element={<CustomDashboard />} />
                    <Route path="/ai-model-management" element={<AIModelManagement />} />
                    <Route path="/device-management" element={<DeviceManagement />} />
                    <Route path="/device-categories" element={<DeviceCategories />} />
                    <Route path="/notification-preferences" element={<NotificationPreferences />} />
                    <Route path="/role-management" element={<RoleManagement />} />
                    <Route path="/database-connections" element={<DatabaseConnectionManagement />} />
                    <Route path="/system-support" element={<SystemSupport />} />
                    <Route path="/usage-analytics" element={<UsageAnalytics />} />
                    <Route path="/developer-portal" element={<div>開發者平台</div>} />
                    <Route path="/historical-analysis" element={<HistoricalAnalysis />} />
                    <Route path="/ai-analysis" element={<AIAnalysis />} />
                    <Route path="/alert-center" element={<AlertCenter />} />
                    <Route path="/communication-protocols" element={<CommunicationProtocols />} />
                    <Route path="/table-schema" element={<TableSchema />} />
                    <Route path="/data-processing" element={<DataProcessing />} />
                    <Route path="/data-transformation" element={<DataTransformation />} />
                    <Route path="/ai-anomaly-detection" element={<GPUMonitoring />} />
                    <Route path="/stream-video-recognition" element={<VideoRecognition />} />
                    <Route path="/mlops" element={<MLOps />} />
                    <Route path="/ota-update" element={<OTAUpdate />} />
                    <Route path="/edge-gateway" element={<EdgeGateway />} />
                    <Route path="/gis-integration" element={<GISIntegration />} />
                    <Route path="/rule-engine" element={<RuleEngine />} />
                    <Route path="/workflow" element={<WorkflowAutomation />} />
                    <Route path="/audit-logs" element={<AuditTrail />} />
                    <Route path="/report-system" element={<ReportingSystem />} />
                    <Route path="/system-settings" element={<div>系統設定</div>} />
                    <Route path="/user-management" element={<div>用戶管理</div>} />
                    <Route path="/test-data-table" element={<TestDataTable />} />
                    <Route path="/table-error-test" element={<TableErrorTest />} />
                    <Route path="/rawdata-error-test" element={<RawDataErrorTest />} />
                    <Route path="/database-connection-test" element={<DatabaseConnectionTest />} />
                  </Routes>
                </ErrorBoundary>
              </div>
            </Content>
          </Layout>
        </Layout>

        {/* 角色切換模態框 */}
        <Modal
          title="切換角色"
          open={roleSwitchModalVisible}
          onCancel={() => setRoleSwitchModalVisible(false)}
          footer={null}
        >
          <Form onFinish={handleRoleSwitch}>
            <Form.Item
              name="role"
              rules={[{ required: true, message: '請選擇角色！' }]}
            >
              <Select placeholder="選擇角色">
                <Select.Option value="admin">系統管理員</Select.Option>
                <Select.Option value="operator">操作員</Select.Option>
                <Select.Option value="viewer">檢視者</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                切換
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Router>
    </GlobalErrorBoundary>
  );
};

export default App;