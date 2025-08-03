import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu, theme, Dropdown, Space, Avatar, Button, Modal, Form, Input, message } from 'antd';
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
  EnvironmentOutlined,
  GatewayOutlined,
  ControlOutlined,
  BarChartOutlined,
  ClusterOutlined,
  ToolOutlined,
  MonitorOutlined,
  SecurityScanOutlined,
  AppstoreOutlined,
  BranchesOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  CloudServerOutlined,
  EyeOutlined,
  FileSearchOutlined,
  CompressOutlined,
  SyncOutlined,
  PartitionOutlined,
  BugOutlined,
  SafetyOutlined,
  RocketOutlined,
  BulbOutlined,
  HeartOutlined,
  FireOutlined,
  StarOutlined,
  TrophyOutlined,
  CrownOutlined,
  BankOutlined,
  HomeOutlined,
  ShopOutlined,
  CarOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined as LabOutlined,
  RocketOutlined as LaunchOutlined,
  ThunderboltOutlined as FlashOutlined,
  GlobalOutlined as WorldOutlined,
  CloudOutlined,
  DatabaseOutlined as StorageOutlined,
  ApiOutlined as CodeOutlined,
  SafetyCertificateOutlined as ShieldOutlined,
  TeamOutlined as GroupOutlined,
  SettingOutlined as ConfigOutlined,
  BellOutlined as NotifyOutlined,
  FileTextOutlined as ReportOutlined,
  EnvironmentOutlined as MapOutlined,
  GatewayOutlined as EdgeOutlined,
  VideoCameraOutlined as CameraOutlined,
  RobotOutlined as AIOutlined,
  HistoryOutlined as TimelineOutlined,
  AlertOutlined as WarningOutlined,
  DashboardOutlined as ChartOutlined,
  DesktopOutlined as DeviceOutlined,
  ControlOutlined as RemoteOutlined,
  CloudUploadOutlined as UpdateOutlined,
  BranchesOutlined as WorkflowOutlined,
  AuditOutlined as LogOutlined,
  KeyOutlined as PermissionOutlined,
  DatabaseOutlined as DBOutlined,
  TableOutlined as SchemaOutlined,
  ExperimentOutlined as MLOpsOutlined,
  BellOutlined as NotificationOutlined,
  FileTextOutlined as DocumentOutlined,
  EnvironmentOutlined as GISOutlined,
  GatewayOutlined as EdgeGatewayOutlined,
  PhoneOutlined as SupportOutlined,
  InfoCircleOutlined as AboutOutlined
} from '@ant-design/icons';
import Dashboard from './components/Dashboard';
import DeviceManagement from './components/DeviceManagement';
import AlertCenter from './components/AlertCenter';
import HistoryAnalysis from './components/HistoryAnalysis';
import AIAnalysis from './components/AIAnalysis';
import Settings from './components/Settings';
import Login from './components/Login';
import PlatformIntro from './components/PlatformIntro';
import SystemSupport from './components/SystemSupport';

// 新增的進階功能組件
import DeviceControl from './components/DeviceControl';
import OTAUpdate from './components/OTAUpdate';
import RuleEngine from './components/RuleEngine';
import WorkflowAutomation from './components/WorkflowAutomation';
import AuditTrail from './components/AuditTrail';
import RoleManagement from './components/RoleManagement';
import CommunicationProtocols from './components/CommunicationProtocols';
import DatabaseConnectionManagement from './components/DatabaseConnectionManagement';
import TableSchemaManagement from './components/TableSchemaManagement';
import VideoRecognition from './components/VideoRecognition';

// 新增的五個功能模組
import MLOps from './components/MLOps';
import NotificationPreferences from './components/NotificationPreferences';
import ReportingSystem from './components/ReportingSystem';
import GISIntegration from './components/GISIntegration';
import EdgeGateway from './components/EdgeGateway';

import './App.css';

const { Header, Sider, Content } = Layout;

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [currentUser, setCurrentUser] = useState({
    username: 'admin',
    role: 'admin',
    avatar: 'https://joeschmoe.io/api/v1/admin'
  });
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [switchUserModalVisible, setSwitchUserModalVisible] = useState(false);
  const [loginForm] = Form.useForm();

  // 先定義所有處理函數
  const handleSwitchUser = () => {
    setSwitchUserModalVisible(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    message.success('已成功登出');
  };

  const handleLogin = async (values) => {
    try {
      // 模擬登入 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentUser({
        username: values.username,
        role: 'admin',
        avatar: `https://joeschmoe.io/api/v1/${values.username}`
      });
      setIsLoggedIn(true);
      setSwitchUserModalVisible(false);
      message.success('登入成功');
    } catch (error) {
      message.error('登入失敗');
    }
  };

  // 重新組織的功能選單 - 分組結構
  const groupedMenuItems = [
    {
      key: 'dashboard',
      icon: <ChartOutlined />,
      label: '儀表板',
      children: [
        {
          key: '/',
          icon: <DashboardOutlined />,
          label: <Link to="/">總覽儀表板</Link>,
        },
        {
          key: '/platform-intro',
          icon: <AboutOutlined />,
          label: <Link to="/platform-intro">平台簡介</Link>,
        }
      ]
    },
    {
      key: 'device-management',
      icon: <DeviceOutlined />,
      label: '設備管理',
      children: [
        {
          key: '/devices',
          icon: <DesktopOutlined />,
          label: <Link to="/devices">設備管理</Link>,
        },
        {
          key: '/device-control',
          icon: <RemoteOutlined />,
          label: <Link to="/device-control">設備控制</Link>,
        },
        {
          key: '/ota-update',
          icon: <UpdateOutlined />,
          label: <Link to="/ota-update">OTA 更新</Link>,
        },
        {
          key: '/communication',
          icon: <CodeOutlined />,
          label: <Link to="/communication">通訊協定</Link>,
        }
      ]
    },
    {
      key: 'monitoring-analysis',
      icon: <MonitorOutlined />,
      label: '監控分析',
      children: [
        {
          key: '/alerts',
          icon: <WarningOutlined />,
          label: <Link to="/alerts">告警中心</Link>,
        },
        {
          key: '/history',
          icon: <TimelineOutlined />,
          label: <Link to="/history">歷史分析</Link>,
        },
        {
          key: '/ai',
          icon: <AIOutlined />,
          label: <Link to="/ai">AI 分析</Link>,
        },
        {
          key: '/mlops',
          icon: <MLOpsOutlined />,
          label: <Link to="/mlops">MLOps</Link>,
        }
      ]
    },
    {
      key: 'data-processing',
      icon: <StorageOutlined />,
      label: '數據處理',
      children: [
        {
          key: '/database-connections',
          icon: <DBOutlined />,
          label: <Link to="/database-connections">資料庫連線</Link>,
        },
        {
          key: '/table-schemas',
          icon: <SchemaOutlined />,
          label: <Link to="/table-schemas">資料表結構</Link>,
        },
        {
          key: '/etl-processing',
          icon: <CompressOutlined />,
          label: <Link to="/etl-processing">ETL 處理</Link>,
        }
      ]
    },
    {
      key: 'automation-workflow',
      icon: <WorkflowOutlined />,
      label: '自動化工作流',
      children: [
        {
          key: '/rule-engine',
          icon: <ShieldOutlined />,
          label: <Link to="/rule-engine">規則引擎</Link>,
        },
        {
          key: '/workflow',
          icon: <BranchesOutlined />,
          label: <Link to="/workflow">工作流程</Link>,
        },
        {
          key: '/audit',
          icon: <LogOutlined />,
          label: <Link to="/audit">審計日誌</Link>,
        }
      ]
    },
    {
      key: 'security-permissions',
      icon: <SecurityScanOutlined />,
      label: '安全權限',
      children: [
        {
          key: '/roles',
          icon: <PermissionOutlined />,
          label: <Link to="/roles">角色管理</Link>,
        },
        {
          key: '/user-management',
          icon: <GroupOutlined />,
          label: <Link to="/user-management">用戶管理</Link>,
        }
      ]
    },
    {
      key: 'advanced-features',
      icon: <RocketOutlined />,
      label: '進階功能',
      children: [
        {
          key: '/video-recognition',
          icon: <CameraOutlined />,
          label: <Link to="/video-recognition">串流影像辨識</Link>,
        },
        {
          key: '/notifications',
          icon: <NotificationOutlined />,
          label: <Link to="/notifications">通知偏好</Link>,
        },
        {
          key: '/reporting',
          icon: <DocumentOutlined />,
          label: <Link to="/reporting">報表系統</Link>,
        },
        {
          key: '/gis',
          icon: <MapOutlined />,
          label: <Link to="/gis">地理資訊</Link>,
        },
        {
          key: '/edge-gateway',
          icon: <EdgeGatewayOutlined />,
          label: <Link to="/edge-gateway">邊緣閘道</Link>,
        }
      ]
    },
    {
      key: 'system',
      icon: <ConfigOutlined />,
      label: '系統管理',
      children: [
        {
          key: '/settings',
          icon: <SettingOutlined />,
          label: <Link to="/settings">系統設定</Link>,
        },
        {
          key: '/system-support',
          icon: <SupportOutlined />,
          label: <Link to="/system-support">系統維運聯絡</Link>,
        }
      ]
    }
  ];

  // 快速功能選單 - 彈出式設計
  const quickActions = [
    {
      key: 'quick-dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">儀表板</Link>,
    },
    {
      key: 'quick-devices',
      icon: <DesktopOutlined />,
      label: <Link to="/devices">設備管理</Link>,
    },
    {
      key: 'quick-alerts',
      icon: <AlertOutlined />,
      label: <Link to="/alerts">告警中心</Link>,
    },
    {
      key: 'quick-ai',
      icon: <RobotOutlined />,
      label: <Link to="/ai">AI 分析</Link>,
    },
    {
      key: 'quick-settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">系統設定</Link>,
    }
  ];

  // 用戶操作選單
  const userMenuItems = [
    {
      key: 'switch-user',
      icon: <SwapOutlined />,
      label: '切換角色',
      onClick: () => setSwitchUserModalVisible(true)
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '個人資料'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: handleLogout
    }
  ];

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          style={{
            background: colorBgContainer,
          }}
        >
          <div style={{ 
            height: 32, 
            margin: 16, 
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1890ff',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            IIPlatform
          </div>
          
          {/* 主要功能選單 - 分組展開式 */}
          <Menu
            mode="inline"
            defaultSelectedKeys={['/']}
            defaultOpenKeys={['dashboard']}
            style={{ height: 'calc(100vh - 80px)', borderRight: 0 }}
            items={groupedMenuItems}
          />
        </Sider>
        
        <Layout>
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: 16,
              paddingRight: 16
            }}
          >
            {/* 左側：快速功能按鈕 */}
            <Space>
              <Dropdown
                menu={{
                  items: quickActions,
                  style: { minWidth: 200 }
                }}
                placement="bottomLeft"
                trigger={['click']}
              >
                <Button 
                  type="primary" 
                  icon={<AppstoreOutlined />}
                  style={{ borderRadius: '6px' }}
                >
                  快速功能
                </Button>
              </Dropdown>
              
              <Button 
                icon={<BellOutlined />}
                style={{ borderRadius: '6px' }}
                onClick={() => window.location.href = '/alerts'}
              >
                告警
              </Button>
              
              <Button 
                icon={<RobotOutlined />}
                style={{ borderRadius: '6px' }}
                onClick={() => window.location.href = '/ai'}
              >
                AI
              </Button>
            </Space>

            {/* 右側：用戶資訊和操作 */}
            <Space>
              <span style={{ color: '#666' }}>
                歡迎，{currentUser.username}
              </span>
              
              <Dropdown
                menu={{
                  items: userMenuItems
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Avatar 
                  src={currentUser.avatar} 
                  style={{ cursor: 'pointer' }}
                />
              </Dropdown>
            </Space>
          </Header>
          
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/platform-intro" element={<PlatformIntro />} />
              <Route path="/devices" element={<DeviceManagement />} />
              <Route path="/device-control" element={<DeviceControl />} />
              <Route path="/ota-update" element={<OTAUpdate />} />
              <Route path="/communication" element={<CommunicationProtocols />} />
              <Route path="/alerts" element={<AlertCenter />} />
              <Route path="/history" element={<HistoryAnalysis />} />
              <Route path="/ai" element={<AIAnalysis />} />
              <Route path="/mlops" element={<MLOps />} />
              <Route path="/rule-engine" element={<RuleEngine />} />
              <Route path="/workflow" element={<WorkflowAutomation />} />
              <Route path="/audit" element={<AuditTrail />} />
              <Route path="/roles" element={<RoleManagement />} />
              <Route path="/database-connections" element={<DatabaseConnectionManagement />} />
              <Route path="/table-schemas" element={<TableSchemaManagement />} />
              <Route path="/video-recognition" element={<VideoRecognition />} />
              <Route path="/notifications" element={<NotificationPreferences />} />
              <Route path="/reporting" element={<ReportingSystem />} />
              <Route path="/gis" element={<GISIntegration />} />
              <Route path="/edge-gateway" element={<EdgeGateway />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/system-support" element={<SystemSupport />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>

      {/* 角色切換模態框 */}
      <Modal
        title="切換用戶角色"
        open={switchUserModalVisible}
        onCancel={() => setSwitchUserModalVisible(false)}
        footer={null}
        width={400}
      >
        <Form
          form={loginForm}
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item
            label="用戶名"
            name="username"
            rules={[{ required: true, message: '請輸入用戶名' }]}
          >
            <Input placeholder="請輸入用戶名" />
          </Form.Item>

          <Form.Item
            label="密碼"
            name="password"
            rules={[{ required: true, message: '請輸入密碼' }]}
          >
            <Input.Password placeholder="請輸入密碼" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                切換
              </Button>
              <Button onClick={() => setSwitchUserModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Router>
  );
}

export default App; 