import React, { useState } from 'react';
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
import Dashboard from './components/Dashboard';
import DeviceManagement from './components/DeviceManagement';
import AlertCenter from './components/AlertCenter';
import HistoryAnalysis from './components/HistoryAnalysis';
import AIAnalysis from './components/AIAnalysis';
import Settings from './components/Settings';
import RoleManagement from './components/RoleManagement';
import CommunicationProtocols from './components/CommunicationProtocols';
import DatabaseConnectionManagement from './components/DatabaseConnectionManagement';
import TableSchemaManagement from './components/TableSchemaManagement';
import VideoRecognition from './components/VideoRecognition';
import MLOps from './components/MLOps';
import OTAUpdate from './components/OTAUpdate';
import EdgeGateway from './components/EdgeGateway';
import GISIntegration from './components/GISIntegration';
import RuleEngine from './components/RuleEngine';
import WorkflowAutomation from './components/WorkflowAutomation';
import AuditTrail from './components/AuditTrail';
import ReportingSystem from './components/ReportingSystem';
import NotificationPreferences from './components/NotificationPreferences';
import SystemSupport from './components/SystemSupport';
import PlatformIntro from './components/PlatformIntro';
import DeviceCategories from './components/DeviceCategories';

const { Header, Content, Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    displayName: '系統管理員',
    role: 'admin'
  });
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [roleSwitchModalVisible, setRoleSwitchModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogin = (values) => {
    console.log('登入資訊:', values);
    setCurrentUser({
      displayName: values.username,
      role: 'admin'
    });
    setIsLoggedIn(true);
    setLoginModalVisible(false);
    form.resetFields();
    message.success('登入成功');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    message.success('登出成功');
  };

  const handleRoleSwitch = (values) => {
    console.log('角色切換:', values);
    setCurrentUser(prev => ({
      ...prev,
      role: values.role
    }));
    setRoleSwitchModalVisible(false);
    roleForm.resetFields();
    message.success('角色切換成功');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '個人資料',
    },
    {
      key: 'role-switch',
      icon: <SwapOutlined />,
      label: '切換角色',
      onClick: () => setRoleSwitchModalVisible(true)
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: handleLogout
    },
  ];

  if (!isLoggedIn) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '400px'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>IIPlatform 登入</h2>
          <Form form={form} onFinish={handleLogin}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: '請輸入用戶名' }]}
            >
              <Input placeholder="用戶名" prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '請輸入密碼' }]}
            >
              <Input.Password placeholder="密碼" prefix={<KeyOutlined />} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                登入
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          style={{
            background: '#001529',
          }}
        >
          {/* Logo 區域 */}
          <div style={{ 
            height: 64, 
            margin: 16, 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            {collapsed ? (
              <img 
                src="/logo-icon.png" 
                alt="IIPlatform" 
                style={{ 
                  width: 32, 
                  height: 32,
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  // 如果圖片載入失敗，顯示預設圖標
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <img 
                src="/logo.png" 
                alt="IIPlatform" 
                style={{ 
                  height: 40,
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  // 如果圖片載入失敗，顯示預設文字
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            )}
            {/* 預設內容 - 當圖片載入失敗時顯示 */}
            <div style={{ 
              display: 'none',
              color: 'white',
              fontSize: collapsed ? '16px' : '18px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {collapsed ? 'II' : 'IIPlatform'}
            </div>
          </div>

          <Menu
            theme="dark"
            defaultSelectedKeys={['dashboard']}
            mode="inline"
          >
            {/* 平台簡介 */}
            <Menu.Item key="platform-intro" icon={<InfoCircleOutlined />}>
              <Link to="/platform-intro">平台簡介</Link>
            </Menu.Item>

            {/* 總覽儀表板 */}
            <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
              <Link to="/">總覽儀表板</Link>
            </Menu.Item>

            {/* 監控分析 */}
            <Menu.SubMenu key="monitoring-analysis" icon={<MonitorOutlined />} title="監控分析">
              <Menu.Item key="history-analysis" icon={<HistoryOutlined />}>
                <Link to="/history-analysis">歷史分析</Link>
              </Menu.Item>
              <Menu.Item key="ai-analysis" icon={<RobotOutlined />}>
                <Link to="/ai-analysis">AI 分析</Link>
              </Menu.Item>
              <Menu.Item key="alert-center" icon={<AlertOutlined />}>
                <Link to="/alert-center">告警中心</Link>
              </Menu.Item>
            </Menu.SubMenu>

            {/* 數據處理 */}
            <Menu.SubMenu key="data-processing" icon={<DatabaseOutlined />} title="數據處理">
              <Menu.Item key="communication-protocols" icon={<ApiOutlined />}>
                <Link to="/communication-protocols">通訊協定</Link>
              </Menu.Item>
              <Menu.Item key="table-schema" icon={<TableOutlined />}>
                <Link to="/table-schema">資料表結構</Link>
              </Menu.Item>
            </Menu.SubMenu>

            {/* AI 應用 */}
            <Menu.SubMenu key="ai-applications" icon={<ExperimentOutlined />} title="AI 應用">
              <Menu.Item key="ai-analysis" icon={<RobotOutlined />}>
                <Link to="/ai-analysis">AI 異常偵測系統</Link>
              </Menu.Item>
              <Menu.Item key="video-recognition" icon={<VideoCameraOutlined />}>
                <Link to="/video-recognition">串流影像辨識</Link>
              </Menu.Item>
              <Menu.Item key="mlops" icon={<ExperimentOutlined />}>
                <Link to="/mlops">MLOPs</Link>
              </Menu.Item>
            </Menu.SubMenu>

            {/* 設備管理 */}
            <Menu.SubMenu key="device-management" icon={<DesktopOutlined />} title="設備管理">
              <Menu.Item key="device-management" icon={<DesktopOutlined />}>
                <Link to="/device-management">設備管理</Link>
              </Menu.Item>
              <Menu.Item key="device-categories" icon={<TagOutlined />}>
                <Link to="/device-categories">設備類別管理</Link>
              </Menu.Item>
              <Menu.Item key="ota-update" icon={<CloudUploadOutlined />}>
                <Link to="/ota-update">OTA更新</Link>
              </Menu.Item>
              <Menu.Item key="edge-gateway" icon={<GatewayOutlined />}>
                <Link to="/edge-gateway">邊緣閘道</Link>
              </Menu.Item>
              <Menu.Item key="gis-integration" icon={<GlobalOutlined />}>
                <Link to="/gis-integration">地理資訊</Link>
              </Menu.Item>
            </Menu.SubMenu>

            {/* 自動化工作流 */}
            <Menu.SubMenu key="automation-workflow" icon={<BranchesOutlined />} title="自動化工作流">
              <Menu.Item key="rule-engine" icon={<ToolOutlined />}>
                <Link to="/rule-engine">規則引擎</Link>
              </Menu.Item>
              <Menu.Item key="workflow-automation" icon={<BranchesOutlined />}>
                <Link to="/workflow-automation">工作流程</Link>
              </Menu.Item>
              <Menu.Item key="audit-trail" icon={<AuditOutlined />}>
                <Link to="/audit-trail">審計日誌</Link>
              </Menu.Item>
              <Menu.Item key="reporting-system" icon={<FileTextOutlined />}>
                <Link to="/reporting-system">報表系統</Link>
              </Menu.Item>
            </Menu.SubMenu>

            {/* 系統管理 */}
            <Menu.SubMenu key="system-management" icon={<SettingOutlined />} title="系統管理">
              <Menu.Item key="settings" icon={<SettingOutlined />}>
                <Link to="/settings">系統設定</Link>
              </Menu.Item>
              <Menu.Item key="notification-preferences" icon={<BellOutlined />}>
                <Link to="/notification-preferences">通知偏好</Link>
              </Menu.Item>
              <Menu.Item key="role-management" icon={<TeamOutlined />}>
                <Link to="/role-management">角色管理</Link>
              </Menu.Item>
              <Menu.Item key="database-connection" icon={<DatabaseOutlined />}>
                <Link to="/database-connection">資料庫連線</Link>
              </Menu.Item>
              <Menu.Item key="system-support" icon={<PhoneOutlined />}>
                <Link to="/system-support">系統維護聯絡</Link>
              </Menu.Item>
            </Menu.SubMenu>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
              <h2 style={{ margin: 0 }}>IIPlatform 工業物聯網平台</h2>
              <Space>
                <span>歡迎，{currentUser?.displayName}</span>
                <Dropdown
                  menu={{
                    items: userMenuItems
                  }}
                  placement="bottomRight"
                >
                  <Avatar icon={<UserOutlined />} />
                </Dropdown>
              </Space>
            </div>
          </Header>
          <Content style={{ margin: '0 16px' }}>
            <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/platform-intro" element={<PlatformIntro />} />
                <Route path="/device-management" element={<DeviceManagement />} />
                <Route path="/device-categories" element={<DeviceCategories />} />
                <Route path="/alert-center" element={<AlertCenter />} />
                <Route path="/history-analysis" element={<HistoryAnalysis />} />
                <Route path="/ai-analysis" element={<AIAnalysis />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/role-management" element={<RoleManagement />} />
                <Route path="/communication-protocols" element={<CommunicationProtocols />} />
                <Route path="/database-connection" element={<DatabaseConnectionManagement />} />
                <Route path="/table-schema" element={<TableSchemaManagement />} />
                <Route path="/video-recognition" element={<VideoRecognition />} />
                <Route path="/mlops" element={<MLOps />} />
                <Route path="/ota-update" element={<OTAUpdate />} />
                <Route path="/edge-gateway" element={<EdgeGateway />} />
                <Route path="/gis-integration" element={<GISIntegration />} />
                <Route path="/rule-engine" element={<RuleEngine />} />
                <Route path="/workflow-automation" element={<WorkflowAutomation />} />
                <Route path="/audit-trail" element={<AuditTrail />} />
                <Route path="/reporting-system" element={<ReportingSystem />} />
                <Route path="/notification-preferences" element={<NotificationPreferences />} />
                <Route path="/system-support" element={<SystemSupport />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* 登入模態框 */}
      <Modal
        title="登入"
        open={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleLogin}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '請輸入用戶名' }]}
          >
            <Input placeholder="用戶名" prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '請輸入密碼' }]}
          >
            <Input.Password placeholder="密碼" prefix={<KeyOutlined />} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              登入
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 角色切換模態框 */}
      <Modal
        title="切換角色"
        open={roleSwitchModalVisible}
        onCancel={() => setRoleSwitchModalVisible(false)}
        footer={null}
      >
        <Form form={roleForm} onFinish={handleRoleSwitch}>
          <Form.Item
            name="role"
            rules={[{ required: true, message: '請選擇角色' }]}
          >
            <Select placeholder="選擇角色">
              <Select.Option value="admin">系統管理員</Select.Option>
              <Select.Option value="operator">操作員</Select.Option>
              <Select.Option value="viewer">檢視者</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              切換
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Router>
  );
};

export default App;