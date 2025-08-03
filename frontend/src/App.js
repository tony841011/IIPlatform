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
  SwapOutlined
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

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">儀表板</Link>,
    },
    {
      key: '/platform-intro',
      icon: <InfoCircleOutlined />,
      label: <Link to="/platform-intro">平台簡介</Link>,
    },
    {
      key: '/devices',
      icon: <DesktopOutlined />,
      label: <Link to="/devices">設備管理</Link>,
    },
    {
      key: '/device-control',
      icon: <ApiOutlined />,
      label: <Link to="/device-control">設備控制</Link>,
    },
    {
      key: '/ota-update',
      icon: <CloudUploadOutlined />,
      label: <Link to="/ota-update">OTA 更新</Link>,
    },
    {
      key: '/communication',
      icon: <ApiOutlined />,
      label: <Link to="/communication">通訊協定</Link>,
    },
    {
      key: '/video-recognition',
      icon: <VideoCameraOutlined />,
      label: <Link to="/video-recognition">串流影像辨識</Link>,
    },
    {
      key: '/alerts',
      icon: <AlertOutlined />,
      label: <Link to="/alerts">告警中心</Link>,
    },
    {
      key: '/history',
      icon: <HistoryOutlined />,
      label: <Link to="/history">歷史分析</Link>,
    },
    {
      key: '/ai',
      icon: <RobotOutlined />,
      label: <Link to="/ai">AI 分析</Link>,
    },
    {
      key: '/rule-engine',
      icon: <SafetyCertificateOutlined />,
      label: <Link to="/rule-engine">規則引擎</Link>,
    },
    {
      key: '/workflow',
      icon: <ProjectOutlined />,
      label: <Link to="/workflow">工作流程</Link>,
    },
    {
      key: '/audit',
      icon: <AuditOutlined />,
      label: <Link to="/audit">審計日誌</Link>,
    },
    {
      key: '/roles',
      icon: <KeyOutlined />,
      label: <Link to="/roles">角色管理</Link>,
    },
    {
      key: '/database-connections',
      icon: <DatabaseOutlined />,
      label: <Link to="/database-connections">資料庫連線</Link>,
    },
    {
      key: '/table-schemas',
      icon: <TableOutlined />,
      label: <Link to="/table-schemas">資料表結構</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">系統設定</Link>,
    },
    {
      key: '/system-support',
      icon: <PhoneOutlined />,
      label: <Link to="/system-support">系統維運聯絡</Link>,
    }
  ];

  const handleSwitchUser = () => {
    setSwitchUserModalVisible(true);
  };

  const handleLogout = () => {
    Modal.confirm({
      title: '確認登出',
      content: '確定要登出系統嗎？',
      onOk: () => {
        setIsLoggedIn(false);
        message.success('已成功登出');
      }
    });
  };

  const handleLogin = async (values) => {
    try {
      // 這裡應該調用登入 API
      setCurrentUser({
        username: values.username,
        role: values.username === 'admin' ? 'admin' : 'operator',
        avatar: `https://joeschmoe.io/api/v1/${values.username}`
      });
      setIsLoggedIn(true);
      setSwitchUserModalVisible(false);
      message.success('登入成功');
    } catch (error) {
      message.error('登入失敗');
    }
  };

  const userMenuItems = [
    {
      key: 'switch-user',
      icon: <SwapOutlined />,
      label: '切換使用者',
      onClick: handleSwitchUser
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
          onBreakpoint={(broken) => {
            console.log(broken);
          }}
        >
          <div className="demo-logo-vertical" />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['/']}
            items={menuItems}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingRight: 24
            }}
          >
            <div style={{ paddingLeft: 24 }}>
              <h2 style={{ margin: 0, color: '#1890ff' }}>
                工業物聯網平台
              </h2>
            </div>
            <Dropdown
              menu={{
                items: userMenuItems
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar src={currentUser.avatar} />
                <span>{currentUser.username}</span>
                <span style={{ color: '#666' }}>({currentUser.role})</span>
              </Space>
            </Dropdown>
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
              <Route path="/video-recognition" element={<VideoRecognition />} />
              <Route path="/alerts" element={<AlertCenter />} />
              <Route path="/history" element={<HistoryAnalysis />} />
              <Route path="/ai" element={<AIAnalysis />} />
              <Route path="/rule-engine" element={<RuleEngine />} />
              <Route path="/workflow" element={<WorkflowAutomation />} />
              <Route path="/audit" element={<AuditTrail />} />
              <Route path="/roles" element={<RoleManagement />} />
              <Route path="/database-connections" element={<DatabaseConnectionManagement />} />
              <Route path="/table-schemas" element={<TableSchemaManagement />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/system-support" element={<SystemSupport />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>

      {/* 切換使用者模態框 */}
      <Modal
        title="切換使用者"
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
            label="使用者名稱"
            name="username"
            rules={[{ required: true, message: '請輸入使用者名稱' }]}
          >
            <Input placeholder="請輸入使用者名稱" />
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
                登入
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