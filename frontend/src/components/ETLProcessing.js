import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Space,
  Tag,
  Progress,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tabs,
  Statistic,
  Timeline,
  Descriptions,
  Badge,
  Tooltip,
  Popconfirm,
  Drawer,
  Steps,
  Alert,
  Divider,
  List,
  Avatar,
  Switch,
  TimePicker,
  DatePicker,
  Slider,
  Upload,
  Tree,
  Transfer,
  Cascader,
  Radio,
  Checkbox,
  Rate,
  InputNumber,
  Mentions,
  AutoComplete,
  TreeSelect,
  Image,
  Skeleton,
  Empty,
  Result,
  PageHeader,
  Breadcrumb,
  Dropdown,
  Menu,
  Affix,
  Anchor,
  BackTop,
  ConfigProvider,
  LocaleProvider,
  theme,
  App,
  FloatButton,
  Watermark,
  QRCode,
  Tour,
  Segmented,
  Flex,
  Grid,
  Carousel,
  Collapse,
  ColorPicker
} from 'antd';
import {
  CompressOutlined,
  SyncOutlined,
  DatabaseOutlined,
  TableOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  SendOutlined,
  StopOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  BarChartOutlined,
  SettingOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  FilterOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ExportOutlined,
  ImportOutlined,
  CopyOutlined,
  ScissorOutlined,
  SnippetsOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  FileSearchOutlined,
  FileProtectOutlined,
  FileSyncOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileMarkdownOutlined,
  FileUnknownOutlined,
  FileTextOutlined as FileTextIcon,
  FileOutlined,
  FolderOutlined,
  FolderViewOutlined,
  FolderAddOutlined as FolderAddIcon,
  FolderOpenOutlined as FolderOpenIcon,
  FileSearchOutlined as FileSearchIcon,
  FileProtectOutlined as FileProtectIcon,
  FileSyncOutlined as FileSyncIcon,
  FileExcelOutlined as FileExcelIcon,
  FilePdfOutlined as FilePdfIcon,
  FileWordOutlined as FileWordIcon,
  FileImageOutlined as FileImageIcon,
  FileZipOutlined as FileZipIcon,
  FileMarkdownOutlined as FileMarkdownIcon,
  FileUnknownOutlined as FileUnknownIcon,
  FileOutlined as FileIcon,
  FolderOutlined as FolderIcon,
  FolderViewOutlined as FolderViewIcon,
  FolderAddOutlined as FolderAddIcon2,
  FolderOpenOutlined as FolderOpenIcon2,
  FileSearchOutlined as FileSearchIcon2,
  FileProtectOutlined as FileProtectIcon2,
  FileSyncOutlined as FileSyncIcon2,
  FileExcelOutlined as FileExcelIcon2,
  FilePdfOutlined as FilePdfIcon2,
  FileWordOutlined as FileWordIcon2,
  FileImageOutlined as FileImageIcon2,
  FileZipOutlined as FileZipIcon2,
  FileMarkdownOutlined as FileMarkdownIcon2,
  FileUnknownOutlined as FileUnknownIcon2,
  FileOutlined as FileIcon2,
  FolderOutlined as FolderIcon2,
  FolderViewOutlined as FolderViewIcon2,
  FolderAddOutlined as FolderAddIcon3,
  FolderOpenOutlined as FolderOpenIcon3,
  FileSearchOutlined as FileSearchIcon3,
  FileProtectOutlined as FileProtectIcon3,
  FileSyncOutlined as FileSyncIcon3,
  FileExcelOutlined as FileExcelIcon3,
  FilePdfOutlined as FilePdfIcon3,
  FileWordOutlined as FileWordIcon3,
  FileImageOutlined as FileImageIcon3,
  FileZipOutlined as FileZipIcon3,
  FileMarkdownOutlined as FileMarkdownIcon3,
  FileUnknownOutlined as FileUnknownIcon3,
  FileOutlined as FileIcon3,
  FolderOutlined as FolderIcon3,
  FolderViewOutlined as FolderViewIcon3,
  FolderAddOutlined as FolderAddIcon4,
  FolderOpenOutlined as FolderOpenIcon4,
  FileSearchOutlined as FileSearchIcon4,
  FileProtectOutlined as FileProtectIcon4,
  FileSyncOutlined as FileSyncIcon4,
  FileExcelOutlined as FileExcelIcon4,
  FilePdfOutlined as FilePdfIcon4,
  FileWordOutlined as FileWordIcon4,
  FileImageOutlined as FileImageIcon4,
  FileZipOutlined as FileZipIcon4,
  FileMarkdownOutlined as FileMarkdownIcon4,
  FileUnknownOutlined as FileUnknownIcon4,
  FileOutlined as FileIcon4,
  FolderOutlined as FolderIcon4,
  FolderViewOutlined as FolderViewIcon4,
  FolderAddOutlined as FolderAddIcon5,
  FolderOpenOutlined as FolderOpenIcon5,
  FileSearchOutlined as FileSearchIcon5,
  FileProtectOutlined as FileProtectIcon5,
  FileSyncOutlined as FileSyncIcon5,
  FileExcelOutlined as FileExcelIcon5,
  FilePdfOutlined as FilePdfIcon5,
  FileWordOutlined as FileWordIcon5,
  FileImageOutlined as FileImageIcon5,
  FileZipOutlined as FileZipIcon5,
  FileMarkdownOutlined as FileMarkdownIcon5,
  FileUnknownOutlined as FileUnknownIcon5,
  FileOutlined as FileIcon5,
  FolderOutlined as FolderIcon5,
  FolderViewOutlined as FolderViewIcon5,
  FolderAddOutlined as FolderAddIcon6,
  FolderOpenOutlined as FolderOpenIcon6,
  FileSearchOutlined as FileSearchIcon6,
  FileProtectOutlined as FileProtectIcon6,
  FileSyncOutlined as FileSyncIcon6,
  FileExcelOutlined as FileExcelIcon6,
  FilePdfOutlined as FilePdfIcon6,
  FileWordOutlined as FileWordIcon6,
  FileImageOutlined as FileImageIcon6,
  FileZipOutlined as FileZipIcon6,
  FileMarkdownOutlined as FileMarkdownIcon6,
  FileUnknownOutlined as FileUnknownIcon6,
  FileOutlined as FileIcon6,
  FolderOutlined as FolderIcon6,
  FolderViewOutlined as FolderViewIcon6,
  FolderAddOutlined as FolderAddIcon7,
  FolderOpenOutlined as FolderOpenIcon7,
  FileSearchOutlined as FileSearchIcon7,
  FileProtectOutlined as FileProtectIcon7,
  FileSyncOutlined as FileSyncIcon7,
  FileExcelOutlined as FileExcelIcon7,
  FilePdfOutlined as FilePdfIcon7,
  FileWordOutlined as FileWordIcon7,
  FileImageOutlined as FileImageIcon7,
  FileZipOutlined as FileZipIcon7,
  FileMarkdownOutlined as FileMarkdownIcon7,
  FileUnknownOutlined as FileUnknownIcon7,
  FileOutlined as FileIcon7,
  FolderOutlined as FolderIcon7,
  FolderViewOutlined as FolderViewIcon7,
  FolderAddOutlined as FolderAddIcon8,
  FolderOpenOutlined as FolderOpenIcon8,
  FileSearchOutlined as FileSearchIcon8,
  FileProtectOutlined as FileProtectIcon8,
  FileSyncOutlined as FileSyncIcon8,
  FileExcelOutlined as FileExcelIcon8,
  FilePdfOutlined as FilePdfIcon8,
  FileWordOutlined as FileWordIcon8,
  FileImageOutlined as FileImageIcon8,
  FileZipOutlined as FileZipIcon8,
  FileMarkdownOutlined as FileMarkdownIcon8,
  FileUnknownOutlined as FileUnknownIcon8,
  FileOutlined as FileIcon8,
  FolderOutlined as FolderIcon8,
  FolderViewOutlined as FolderViewIcon8,
  FolderAddOutlined as FolderAddIcon9,
  FolderOpenOutlined as FolderOpenIcon9,
  FileSearchOutlined as FileSearchIcon9,
  FileProtectOutlined as FileProtectIcon9,
  FileSyncOutlined as FileSyncIcon9,
  FileExcelOutlined as FileExcelIcon9,
  FilePdfOutlined as FilePdfIcon9,
  FileWordOutlined as FileWordIcon9,
  FileImageOutlined as FileImageIcon9,
  FileZipOutlined as FileZipIcon9,
  FileMarkdownOutlined as FileMarkdownIcon9,
  FileUnknownOutlined as FileUnknownIcon9,
  FileOutlined as FileIcon9,
  FolderOutlined as FolderIcon9,
  FolderViewOutlined as FolderViewIcon9,
  FolderAddOutlined as FolderAddIcon10,
  FolderOpenOutlined as FolderOpenIcon10,
  FileSearchOutlined as FileSearchIcon10,
  FileProtectOutlined as FileProtectIcon10,
  FileSyncOutlined as FileSyncIcon10,
  FileExcelOutlined as FileExcelIcon10,
  FilePdfOutlined as FilePdfIcon10,
  FileWordOutlined as FileWordIcon10,
  FileImageOutlined as FileImageIcon10,
  FileZipOutlined as FileZipIcon10,
  FileMarkdownOutlined as FileMarkdownIcon10,
  FileUnknownOutlined as FileUnknownIcon10,
  FileOutlined as FileIcon10,
  FolderOutlined as FolderIcon10,
  FolderViewOutlined as FolderViewIcon10,
  FolderAddOutlined as FolderAddIcon11,
  FolderOpenOutlined as FolderOpenIcon11,
  FileSearchOutlined as FileSearchIcon11,
  FileProtectOutlined as FileProtectIcon11,
  FileSyncOutlined as FileSyncIcon11,
  FileExcelOutlined as FileExcelIcon11,
  FilePdfOutlined as FilePdfIcon11,
  FileWordOutlined as FileWordIcon11,
  FileImageOutlined as FileImageIcon11,
  FileZipOutlined as FileZipIcon11,
  FileMarkdownOutlined as FileMarkdownIcon11,
  FileUnknownOutlined as FileUnknownIcon11,
  FileOutlined as FileIcon11,
  FolderOutlined as FolderIcon11,
  FolderViewOutlined as FolderViewIcon11,
  FolderAddOutlined as FolderAddIcon12,
  FolderOpenOutlined as FolderOpenIcon12,
  FileSearchOutlined as FileSearchIcon12,
  FileProtectOutlined as FileProtectIcon12,
  FileSyncOutlined as FileSyncIcon12,
  FileExcelOutlined as FileExcelIcon12,
  FilePdfOutlined as FilePdfIcon12,
  FileWordOutlined as FileWordIcon12,
  FileImageOutlined as FileImageIcon12,
  FileZipOutlined as FileZipIcon12,
  FileMarkdownOutlined as FileMarkdownIcon12,
  FileUnknownOutlined as FileUnknownIcon12,
  FileOutlined as FileIcon12,
  FolderOutlined as FolderIcon12,
  FolderViewOutlined as FolderViewIcon12,
  FolderAddOutlined as FolderAddIcon13,
  FolderOpenOutlined as FolderOpenIcon13,
  FileSearchOutlined as FileSearchIcon13,
  FileProtectOutlined as FileProtectIcon13,
  FileSyncOutlined as FileSyncIcon13,
  FileExcelOutlined as FileExcelIcon13,
  FilePdfOutlined as FilePdfIcon13,
  FileWordOutlined as FileWordIcon13,
  FileImageOutlined as FileImageIcon13,
  FileZipOutlined as FileZipIcon13,
  FileMarkdownOutlined as FileMarkdownIcon13,
  FileUnknownOutlined as FileUnknownIcon13,
  FileOutlined as FileIcon13,
  FolderOutlined as FolderIcon13,
  FolderViewOutlined as FolderViewIcon13,
  FolderAddOutlined as FolderAddIcon14,
  FolderOpenOutlined as FolderOpenIcon14,
  FileSearchOutlined as FileSearchIcon14,
  FileProtectOutlined as FileProtectIcon14,
  FileSyncOutlined as FileSyncIcon14,
  FileExcelOutlined as FileExcelIcon14,
  FilePdfOutlined as FilePdfIcon14,
  FileWordOutlined as FileWordIcon14,
  FileImageOutlined as FileImageIcon14,
  FileZipOutlined as FileZipIcon14,
  FileMarkdownOutlined as FileMarkdownIcon14,
  FileUnknownOutlined as FileUnknownIcon14,
  FileOutlined as FileIcon14,
  FolderOutlined as FolderIcon14,
  FolderViewOutlined as FolderViewIcon14,
  FolderAddOutlined as FolderAddIcon15,
  FolderOpenOutlined as FolderOpenIcon15,
  FileSearchOutlined as FileSearchIcon15,
  FileProtectOutlined as FileProtectIcon15,
  FileSyncOutlined as FileSyncIcon15,
  FileExcelOutlined as FileExcelIcon15,
  FilePdfOutlined as FilePdfIcon15,
  FileWordOutlined as FileWordIcon15,
  FileImageOutlined as FileImageIcon15,
  FileZipOutlined as FileZipIcon15,
  FileMarkdownOutlined as FileMarkdownIcon15,
  FileUnknownOutlined as FileUnknownIcon15,
  FileOutlined as FileIcon15,
  FolderOutlined as FolderIcon15,
  FolderViewOutlined as FolderViewIcon15,
  FolderAddOutlined as FolderAddIcon16,
  FolderOpenOutlined as FolderOpenIcon16,
  FileSearchOutlined as FileSearchIcon16,
  FileProtectOutlined as FileProtectIcon16,
  FileSyncOutlined as FileSyncIcon16,
  FileExcelOutlined as FileExcelIcon16,
  FilePdfOutlined as FilePdfIcon16,
  FileWordOutlined as FileWordIcon16,
  FileImageOutlined as FileImageIcon16,
  FileZipOutlined as FileZipIcon16,
  FileMarkdownOutlined as FileMarkdownIcon16,
  FileUnknownOutlined as FileUnknownIcon16,
  FileOutlined as FileIcon16,
  FolderOutlined as FolderIcon16,
  FolderViewOutlined as FolderViewIcon16,
  FolderAddOutlined as FolderAddIcon17,
  FolderOpenOutlined as FolderOpenIcon17,
  FileSearchOutlined as FileSearchIcon17,
  FileProtectOutlined as FileProtectIcon17,
  FileSyncOutlined as FileSyncIcon17,
  FileExcelOutlined as FileExcelIcon17,
  FilePdfOutlined as FilePdfIcon17,
  FileWordOutlined as FileWordIcon17,
  FileImageOutlined as FileImageIcon17,
  FileZipOutlined as FileZipIcon17,
  FileMarkdownOutlined as FileMarkdownIcon17,
  FileUnknownOutlined as FileUnknownIcon17,
  FileOutlined as FileIcon17,
  FolderOutlined as FolderIcon17,
  FolderViewOutlined as FolderViewIcon17,
  FolderAddOutlined as FolderAddIcon18,
  FolderOpenOutlined as FolderOpenIcon18,
  FileSearchOutlined as FileSearchIcon18,
  FileProtectOutlined as FileProtectIcon18,
  FileSyncOutlined as FileSyncIcon18,
  FileExcelOutlined as FileExcelIcon18,
  FilePdfOutlined as FilePdfIcon18,
  FileWordOutlined as FileWordIcon18,
  FileImageOutlined as FileImageIcon18,
  FileZipOutlined as FileZipIcon18,
  FileMarkdownOutlined as FileMarkdownIcon18,
  FileUnknownOutlined as FileUnknownIcon18,
  FileOutlined as FileIcon18,
  FolderOutlined as FolderIcon18,
  FolderViewOutlined as FolderViewIcon18,
  FolderAddOutlined as FolderAddIcon19,
  FolderOpenOutlined as FolderOpenIcon19,
  FileSearchOutlined as FileSearchIcon19,
  FileProtectOutlined as FileProtectIcon19,
  FileSyncOutlined as FileSyncIcon19,
  FileExcelOutlined as FileExcelIcon19,
  FilePdfOutlined as FilePdfIcon19,
  FileWordOutlined as FileWordIcon19,
  FileImageOutlined as FileImageIcon19,
  FileZipOutlined as FileZipIcon19,
  FileMarkdownOutlined as FileMarkdownIcon19,
  FileUnknownOutlined as FileUnknownIcon19,
  FileOutlined as FileIcon19,
  FolderOutlined as FolderIcon19,
  FolderViewOutlined as FolderViewIcon19,
  FolderAddOutlined as FolderAddIcon20,
  FolderOpenOutlined as FolderOpenIcon20,
  FileSearchOutlined as FileSearchIcon20,
  FileProtectOutlined as FileProtectIcon20,
  FileSyncOutlined as FileSyncIcon20,
  FileExcelOutlined as FileExcelIcon20,
  FilePdfOutlined as FilePdfIcon20,
  FileWordOutlined as FileWordIcon20,
  FileImageOutlined as FileImageIcon20,
  FileZipOutlined as FileZipIcon20,
  FileMarkdownOutlined as FileMarkdownIcon20,
  FileUnknownOutlined as FileUnknownIcon20,
  FileOutlined as FileIcon20,
  FolderOutlined as FolderIcon20,
  FolderViewOutlined as FolderViewIcon20,
  FolderAddOutlined as FolderAddIcon21,
  FolderOpenOutlined as FolderOpenIcon21,
  FileSearchOutlined as FileSearchIcon21,
  FileProtectOutlined as FileProtectIcon21,
  FileSyncOutlined as FileSyncIcon21,
  FileExcelOutlined as FileExcelIcon21,
  FilePdfOutlined as FilePdfIcon21,
  FileWordOutlined as FileWordIcon21,
  FileImageOutlined as FileImageIcon21,
  FileZipOutlined as FileZipIcon21,
  FileMarkdownOutlined as FileMarkdownIcon21,
  FileUnknownOutlined as FileUnknownIcon21,
  FileOutlined as FileIcon21,
  FolderOutlined as FolderIcon21,
  FolderViewOutlined as FolderViewIcon21,
  FolderAddOutlined as FolderAddIcon22,
  FolderOpenOutlined as FolderOpenIcon22,
  FileSearchOutlined as FileSearchIcon22,
  FileProtectOutlined as FileProtectIcon22,
  FileSyncOutlined as FileSyncIcon22,
  FileExcelOutlined as FileExcelIcon22,
  FilePdfOutlined as FilePdfIcon22,
  FileWordOutlined as FileWordIcon22,
  FileImageOutlined as FileImageIcon22,
  FileZipOutlined as FileZipIcon22,
  FileMarkdownOutlined as FileMarkdownIcon22,
  FileUnknownOutlined as FileUnknownIcon22,
  FileOutlined as FileIcon22,
  FolderOutlined as FolderIcon22,
  FolderViewOutlined as FolderViewIcon22,
  FolderAddOutlined as FolderAddIcon23,
  FolderOpenOutlined as FolderOpenIcon23,
  FileSearchOutlined as FileSearchIcon23,
  FileProtectOutlined as FileProtectIcon23,
  FileSyncOutlined as FileSyncIcon23,
  FileExcelOutlined as FileExcelIcon23,
  FilePdfOutlined as FilePdfIcon23,
  FileWordOutlined as FileWordIcon23,
  FileImageOutlined as FileImageIcon23,
  FileZipOutlined as FileZipIcon23,
  FileMarkdownOutlined as FileMarkdownIcon23,
  FileUnknownOutlined as FileUnknownIcon23,
  FileOutlined as FileIcon23,
  FolderOutlined as FolderIcon23,
  FolderViewOutlined as FolderViewIcon23,
  FolderAddOutlined as FolderAddIcon24,
  FolderOpenOutlined as FolderOpenIcon24,
  FileSearchOutlined as FileSearchIcon24,
  FileProtectOutlined as FileProtectIcon24,
  FileSyncOutlined as FileSyncIcon24,
  FileExcelOutlined as FileExcelIcon24,
  FilePdfOutlined as FilePdfIcon24,
  FileWordOutlined as FileWordIcon24,
  FileImageOutlined as FileImageIcon24,
  FileZipOutlined as FileZipIcon24,
  FileMarkdownOutlined as FileMarkdownIcon24,
  FileUnknownOutlined as FileUnknownIcon24,
  FileOutlined as FileIcon24,
  FolderOutlined as FolderIcon24,
  FolderViewOutlined as FolderViewIcon24,
  FolderAddOutlined as FolderAddIcon25,
  FolderOpenOutlined as FolderOpenIcon25,
  FileSearchOutlined as FileSearchIcon25,
  FileProtectOutlined as FileProtectIcon25,
  FileSyncOutlined as FileSyncIcon25,
  FileExcelOutlined as FileExcelIcon25,
  FilePdfOutlined as FilePdfIcon25,
  FileWordOutlined as FileWordIcon25,
  FileImageOutlined as FileImageIcon25,
  FileZipOutlined as FileZipIcon25,
  FileMarkdownOutlined as FileMarkdownIcon25,
  FileUnknownOutlined as FileUnknownIcon25,
  FileOutlined as FileIcon25,
  FolderOutlined as FolderIcon25,
  FolderViewOutlined as FolderViewIcon25,
  FolderAddOutlined as FolderAddIcon26,
  FolderOpenOutlined as FolderOpenIcon26,
  FileSearchOutlined as FileSearchIcon26,
  FileProtectOutlined as FileProtectIcon26,
  FileSyncOutlined as FileSyncIcon26,
  FileExcelOutlined as FileExcelIcon26,
  FilePdfOutlined as FilePdfIcon26,
  FileWordOutlined as FileWordIcon26,
  FileImageOutlined as FileImageIcon26,
  FileZipOutlined as FileZipIcon26,
  FileMarkdownOutlined as FileMarkdownIcon26,
  FileUnknownOutlined as FileUnknownIcon26,
  FileOutlined as FileIcon26,
  FolderOutlined as FolderIcon26,
  FolderViewOutlined as FolderViewIcon26,
  FolderAddOutlined as FolderAddIcon27,
  FolderOpenOutlined as FolderOpenIcon27,
  FileSearchOutlined as FileSearchIcon27,
  FileProtectOutlined as FileProtectIcon27,
  FileSyncOutlined as FileSyncIcon27,
  FileExcelOutlined as FileExcelIcon27,
  FilePdfOutlined as FilePdfIcon27,
  FileWordOutlined as FileWordIcon27,
  FileImageOutlined as FileImageIcon27,
  FileZipOutlined as FileZipIcon27,
  FileMarkdownOutlined as FileMarkdownIcon27,
  FileUnknownOutlined as FileUnknownIcon27,
  FileOutlined as FileIcon27,
  FolderOutlined as FolderIcon27,
  FolderViewOutlined as FolderViewIcon27,
  FolderAddOutlined as FolderAddIcon28,
  FolderOpenOutlined as FolderOpenIcon28,
  FileSearchOutlined as FileSearchIcon28,
  FileProtectOutlined as FileProtectIcon28,
  FileSyncOutlined as FileSyncIcon28,
  FileExcelOutlined as FileExcelIcon28,
  FilePdfOutlined as FilePdfIcon28,
  FileWordOutlined as FileWordIcon28,
  FileImageOutlined as FileImageIcon28,
  FileZipOutlined as FileZipIcon28,
  FileMarkdownOutlined as FileMarkdownIcon28,
  FileUnknownOutlined as FileUnknownIcon28,
  FileOutlined as FileIcon28,
  FolderOutlined as FolderIcon28,
  FolderViewOutlined as FolderViewIcon28,
  FolderAddOutlined as FolderAddIcon29,
  FolderOpenOutlined as FolderOpenIcon29,
  FileSearchOutlined as FileSearchIcon29,
  FileProtectOutlined as FileProtectIcon29,
  FileSyncOutlined as FileSyncIcon29,
  FileExcelOutlined as FileExcelIcon29,
  FilePdfOutlined as FilePdfIcon29,
  FileWordOutlined as FileWordIcon29,
  FileImageOutlined as FileImageIcon29,
  FileZipOutlined as FileZipIcon29,
  FileMarkdownOutlined as FileMarkdownIcon29,
  FileUnknownOutlined as FileUnknownIcon29,
  FileOutlined as FileIcon29,
  FolderOutlined as FolderIcon29,
  FolderViewOutlined as FolderViewIcon29,
  FolderAddOutlined as FolderAddIcon30,
  FolderOpenOutlined as FolderOpenIcon30,
  FileSearchOutlined as FileSearchIcon30,
  FileProtectOutlined as FileProtectIcon30,
  FileSyncOutlined as FileSyncIcon30,
  FileExcelOutlined as FileExcelIcon30,
  FilePdfOutlined as FilePdfIcon30,
  FileWordOutlined as FileWordIcon30,
  FileImageOutlined as FileImageIcon30,
  FileZipOutlined as FileZipIcon30,
  FileMarkdownOutlined as FileMarkdownIcon30,
  FileUnknownOutlined as FileUnknownIcon30,
  FileOutlined as FileIcon30,
  FolderOutlined as FolderIcon30,
  FolderViewOutlined as FolderViewIcon30,
  FolderAddOutlined as FolderAddIcon31,
  FolderOpenOutlined as FolderOpenIcon31,
  FileSearchOutlined as FileSearchIcon31,
  FileProtectOutlined as FileProtectIcon31,
  FileSyncOutlined as FileSyncIcon31,
  FileExcelOutlined as FileExcelIcon31,
  FilePdfOutlined as FilePdfIcon31,
  FileWordOutlined as FileWordIcon31,
  FileImageOutlined as FileImageIcon31,
  FileZipOutlined as FileZipIcon31,
  FileMarkdownOutlined as FileMarkdownIcon31,
  FileUnknownOutlined as FileUnknownIcon31,
  FileOutlined as FileIcon31,
  FolderOutlined as FolderIcon31,
  FolderViewOutlined as FolderViewIcon31,
  FolderAddOutlined as FolderAddIcon32,
  FolderOpenOutlined as FolderOpenIcon32,
  FileSearchOutlined as FileSearchIcon32,
  FileProtectOutlined as FileProtectIcon32,
  FileSyncOutlined as FileSyncIcon32,
  FileExcelOutlined as FileExcelIcon32,
  FilePdfOutlined as FilePdfIcon32,
  FileWordOutlined as FileWordIcon32,
  FileImageOutlined as FileImageIcon32,
  FileZipOutlined as FileZipIcon32,
  FileMarkdownOutlined as FileMarkdownIcon32,
  FileUnknownOutlined as FileUnknownIcon32,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
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