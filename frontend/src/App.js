import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu, theme, Dropdown, Space, Avatar, Button, Modal, Form, Input, Select, message } from 'antd';
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
  TagOutlined
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

const { Header, Content, Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [roleSwitchModalVisible, setRoleSwitchModalVisible] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogin = (values) => {
    // 模擬登入驗證
    if (values.username === 'admin' && values.password === 'admin123') {
      setIsLoggedIn(true);
      setCurrentUser({
        username: 'admin',
        displayName: '系統管理員',
        role: 'admin'
      });
      setLoginModalVisible(false);
      message.success('登入成功！');
    } else {
      message.error('用戶名或密碼錯誤！');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
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
      displayName: roleNames[values.role]
    });
    setRoleSwitchModalVisible(false);
    message.success(`已切換到 ${roleNames[values.role]} 角色！`);
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

  const menuItems = [
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
      ],
    },
    {
      key: 'ai-applications',
      icon: <RobotOutlined />,
      label: 'AI 應用',
      children: [
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

  return (
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
            items={menuItems}
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
                {isLoggedIn ? (
                  <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                  >
                    <Button type="text" icon={<UserOutlined />}>
                      {currentUser?.displayName || currentUser?.username}
                    </Button>
                  </Dropdown>
                ) : (
                  <Button 
                    type="primary" 
                    icon={<LoginOutlined />}
                    onClick={() => setLoginModalVisible(true)}
                  >
                    登入
                  </Button>
                )}
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
              <Routes>
                <Route path="/" element={<div>總覽儀表板</div>} />
                <Route path="/platform-intro" element={<PlatformIntro />} />
                <Route path="/dashboard" element={<div>總覽儀表板</div>} />
                <Route path="/device-management" element={<DeviceManagement />} />
                <Route path="/device-categories" element={<DeviceCategories />} />
                <Route path="/notification-preferences" element={<NotificationPreferences />} />
                <Route path="/role-management" element={<RoleManagement />} />
                <Route path="/database-connections" element={<DatabaseConnectionManagement />} />
                <Route path="/system-support" element={<SystemSupport />} />
                <Route path="/usage-analytics" element={<UsageAnalytics />} />
                <Route path="/developer-portal" element={<div>開發者平台</div>} />
                <Route path="/historical-analysis" element={<div>歷史分析</div>} />
                <Route path="/ai-analysis" element={<div>AI 分析</div>} />
                <Route path="/alert-center" element={<div>告警中心</div>} />
                <Route path="/communication-protocols" element={<div>通訊協定</div>} />
                <Route path="/table-schema" element={<div>資料表結構</div>} />
                <Route path="/ai-anomaly-detection" element={<div>AI 異常偵測系統</div>} />
                <Route path="/stream-video-recognition" element={<div>串流影像辨識</div>} />
                <Route path="/mlops" element={<div>MLOPs</div>} />
                <Route path="/ota-update" element={<div>OTA更新</div>} />
                <Route path="/edge-gateway" element={<div>邊緣閘道</div>} />
                <Route path="/gis-integration" element={<div>地理資訊</div>} />
                <Route path="/rule-engine" element={<div>規則引擎</div>} />
                <Route path="/workflow" element={<div>工作流程</div>} />
                <Route path="/audit-logs" element={<div>審計日誌</div>} />
                <Route path="/report-system" element={<div>報表系統</div>} />
                <Route path="/system-settings" element={<div>系統設定</div>} />
                <Route path="/user-management" element={<div>用戶管理</div>} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* 登入模態框 */}
      <Modal
        title="用戶登入"
        open={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleLogin}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '請輸入用戶名！' }]}
          >
            <Input placeholder="用戶名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '請輸入密碼！' }]}
          >
            <Input.Password placeholder="密碼" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登入
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center', color: '#666' }}>
            預設帳號：admin / admin123
          </div>
        </Form>
      </Modal>

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
  );
};

export default App;