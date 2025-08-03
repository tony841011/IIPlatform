import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Collapse,
  Tree,
  Descriptions,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Spin,
  Alert,
  Divider,
  List,
  Avatar,
  Timeline,
  Steps,
  Progress,
  Statistic,
  Badge,
  Tooltip,
  Popconfirm,
  Drawer,
  Tabs,
  Image,
  Upload,
  Carousel,
  Table,
  Switch,
  DatePicker,
  TimePicker,
  Radio,
  Checkbox,
  Slider,
  Rate,
  Cascader,
  Transfer,
  TreeSelect,
  Mentions,
  AutoComplete,
  InputNumber,
  Upload as AntUpload
} from 'antd';
import {
  InfoCircleOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  EditOutlined,
  SaveOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  TeamOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  StarOutlined,
  HeartOutlined,
  TrophyOutlined,
  ApiOutlined,
  RobotOutlined,
  DashboardOutlined,
  SafetyCertificateOutlined,
  DesktopOutlined,
  PictureOutlined,
  CameraOutlined,
  EnvironmentOutlined,
  BankOutlined,
  UserOutlined,
  LockOutlined,
  KeyOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  BranchesOutlined,
  AuditOutlined,
  FileTextOutlined,
  BellOutlined,
  GatewayOutlined,
  GlobalOutlined as GlobalIcon,
  MonitorOutlined,
  ControlOutlined,
  RocketOutlined,
  BugOutlined,
  ExperimentOutlined,
  BarChartOutlined,
  CodeOutlined,
  DownloadOutlined,
  UploadOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  ScheduleOutlined,
  NotificationOutlined,
  SoundOutlined,
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
  FileSvgOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const PlatformIntro = () => {
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [form] = Form.useForm();
  const [photoUploadModalVisible, setPhotoUploadModalVisible] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [fileList, setFileList] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({
    platformName: 'IIPlatform 工業物聯網平台',
    version: 'v2.0.0',
    description: '完整的工業物聯網解決方案，支援設備管理、數據分析、AI 預測等功能',
    companyName: '智慧製造科技有限公司',
    contactEmail: 'support@smartmanufacturing.com',
    website: 'https://www.smartmanufacturing.com',
    logoUrl: '/logo.png',
    themeConfig: {
      primaryColor: '#1890ff',
      secondaryColor: '#52c41a',
      darkMode: false,
      fontFamily: 'Arial, sans-serif',
      borderRadius: '6px'
    },
    features: {
      deviceManagement: true,
      dataAnalysis: true,
      aiPrediction: true,
      gpuMonitoring: true,
      ruleEngine: true,
      workflowAutomation: true,
      auditTrail: true,
      roleManagement: true,
      communicationProtocols: true
    }
  });

  // 公司照片數據
  const [companyPhotos, setCompanyPhotos] = useState([
    {
      id: 1,
      title: '公司大樓',
      description: '位於台北市信義區的總部大樓',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      category: 'building',
      is_active: true
    },
    {
      id: 2,
      title: '研發中心',
      description: '專注於工業物聯網技術研發',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      category: 'rd',
      is_active: true
    },
    {
      id: 3,
      title: '會議室',
      description: '現代化的會議設施',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      category: 'meeting',
      is_active: true
    }
  ]);

  // 系統照片數據
  const [systemPhotos, setSystemPhotos] = useState([
    {
      id: 1,
      title: '儀表板介面',
      description: '直觀的數據視覺化介面',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      category: 'dashboard',
      is_active: true
    },
    {
      id: 2,
      title: '設備監控',
      description: '即時設備狀態監控',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      category: 'monitoring',
      is_active: true
    },
    {
      id: 3,
      title: 'AI 分析',
      description: '智能異常檢測系統',
      imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop',
      category: 'ai',
      is_active: true
    }
  ]);

  // Q&A 數據
  const [qaData, setQaData] = useState([
    {
      id: 1,
      question: '如何新增設備到平台？',
      answer: '您可以透過設備管理頁面，點擊「新增設備」按鈕，填寫設備資訊並選擇通訊協定即可完成設備註冊。',
      category: 'basic',
      is_active: true
    },
    {
      id: 2,
      question: '支援哪些通訊協定？',
      answer: '平台支援 MQTT、RESTful API、Modbus TCP、OPC UA 等多種工業通訊協定。',
      category: 'communication',
      is_active: true
    },
    {
      id: 3,
      question: '如何設定告警規則？',
      answer: '在規則引擎頁面，您可以建立自定義的告警規則，設定觸發條件和通知方式。',
      category: 'alert',
      is_active: true
    }
  ]);

  // 平台架構數據
  const platformArchitecture = [
    {
      title: '前端層 (Frontend)',
      key: 'frontend',
      icon: <DesktopOutlined />,
      children: [
        {
          title: 'React 18',
          key: 'react',
          icon: <CodeOutlined />
        },
        {
          title: 'Ant Design',
          key: 'antd',
          icon: <ToolOutlined />
        },
        {
          title: 'ECharts',
          key: 'echarts',
          icon: <BarChartOutlined />
        }
      ]
    },
    {
      title: '後端層 (Backend)',
      key: 'backend',
      icon: <ApiOutlined />,
      children: [
        {
          title: 'FastAPI',
          key: 'fastapi',
          icon: <RocketOutlined />
        },
        {
          title: 'SQLAlchemy',
          key: 'sqlalchemy',
          icon: <DatabaseOutlined />
        },
        {
          title: 'Celery',
          key: 'celery',
          icon: <ThunderboltOutlined />
        }
      ]
    },
    {
      title: '數據層 (Data Layer)',
      key: 'data',
      icon: <DatabaseOutlined />,
      children: [
        {
          title: 'PostgreSQL',
          key: 'postgresql',
          icon: <DatabaseOutlined />
        },
        {
          title: 'Redis',
          key: 'redis',
          icon: <DatabaseOutlined />
        }
      ]
    },
    {
      title: '設備層 (Device Layer)',
      key: 'device',
      icon: <DesktopOutlined />,
      children: [
        {
          title: 'MQTT',
          key: 'mqtt',
          icon: <ApiOutlined />
        },
        {
          title: 'Modbus TCP',
          key: 'modbus',
          icon: <ApiOutlined />
        },
        {
          title: 'OPC UA',
          key: 'opcua',
          icon: <ApiOutlined />
        }
      ]
    }
  ];

  // 平台特色數據
  const platformFeatures = [
    {
      title: '設備管理',
      description: '完整的設備生命週期管理，支援設備註冊、分組、標籤等功能',
      icon: <DesktopOutlined />,
      color: '#1890ff'
    },
    {
      title: '數據分析',
      description: '即時數據監控與歷史趨勢分析，提供多維度數據統計',
      icon: <BarChartOutlined />,
      color: '#52c41a'
    },
    {
      title: 'AI 智能分析',
      description: '異常檢測與預測性維護，機器學習模型管理',
      icon: <RobotOutlined />,
      color: '#722ed1'
    },
    {
      title: '告警系統',
      description: '即時告警通知，多管道通知整合',
      icon: <BellOutlined />,
      color: '#fa8c16'
    },
    {
      title: '安全權限',
      description: '角色基礎存取控制，用戶權限管理',
      icon: <SafetyCertificateOutlined />,
      color: '#eb2f96'
    },
    {
      title: '自動化工作流',
      description: '規則引擎配置，工作流程自動化',
      icon: <BranchesOutlined />,
      color: '#13c2c2'
    }
  ];

  // 處理編輯內容
  const handleEditContent = (content) => {
    setSelectedContent(content);
    if (content) {
      form.setFieldsValue({
        question: content.question,
        answer: content.answer,
        category: content.category
      });
    } else {
      form.resetFields();
    }
    setEditModalVisible(true);
  };

  // 處理儲存內容
  const handleSaveContent = async (values) => {
    try {
      setLoading(true);
      
      if (selectedContent) {
        // 更新現有內容
        const updatedQa = qaData.map(item => 
          item.id === selectedContent.id 
            ? { ...item, ...values }
            : item
        );
        setQaData(updatedQa);
        message.success('問題更新成功');
      } else {
        // 新增內容
        const newQa = {
          id: Date.now(),
          ...values,
          is_active: true
        };
        setQaData([...qaData, newQa]);
        message.success('問題新增成功');
      }
      
      setEditModalVisible(false);
      form.resetFields();
      setSelectedContent(null);
    } catch (error) {
      message.error('操作失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理新增照片
  const handleAddPhoto = (type) => {
    setUploadType(type);
    setPhotoUploadModalVisible(true);
  };

  // 處理刪除照片
  const handleDeletePhoto = (id, type) => {
    Modal.confirm({
      title: '確認刪除',
      content: '確定要刪除這張照片嗎？',
      onOk: () => {
        if (type === 'company') {
          setCompanyPhotos(companyPhotos.filter(photo => photo.id !== id));
        } else if (type === 'system') {
          setSystemPhotos(systemPhotos.filter(photo => photo.id !== id));
        }
        message.success('照片刪除成功');
      }
    });
  };

  // 處理照片上傳
  const handlePhotoUpload = async (values) => {
    try {
      setLoading(true);
      
      const newPhoto = {
        id: Date.now(),
        title: values.title,
        description: values.description,
        imageUrl: values.imageUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
        category: values.category,
        is_active: true
      };

      if (uploadType === 'company') {
        setCompanyPhotos([...companyPhotos, newPhoto]);
      } else if (uploadType === 'system') {
        setSystemPhotos([...systemPhotos, newPhoto]);
      }

      message.success('照片新增成功');
      setPhotoUploadModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('上傳失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理平台設定更新
  const handlePlatformSettingsUpdate = async (values) => {
    try {
      setLoading(true);
      setPlatformSettings({ ...platformSettings, ...values });
      message.success('平台設定更新成功');
    } catch (error) {
      message.error('更新失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理功能開關
  const handleFeatureToggle = (feature, checked) => {
    const updatedFeatures = {
      ...platformSettings.features,
      [feature]: checked
    };
    setPlatformSettings({
      ...platformSettings,
      features: updatedFeatures
    });
    message.success(`${checked ? '啟用' : '停用'} ${feature} 功能`);
  };

  // 處理主題設定
  const handleThemeUpdate = (themeKey, value) => {
    const updatedTheme = {
      ...platformSettings.themeConfig,
      [themeKey]: value
    };
    setPlatformSettings({
      ...platformSettings,
      themeConfig: updatedTheme
    });
    message.success('主題設定更新成功');
  };

  // 處理 Q&A 刪除
  const handleDeleteQa = (id) => {
    Modal.confirm({
      title: '確認刪除',
      content: '確定要刪除這個問題嗎？',
      onOk: () => {
        setQaData(qaData.filter(item => item.id !== id));
        message.success('問題刪除成功');
      }
    });
  };

  // 處理 Q&A 狀態切換
  const handleQaStatusToggle = (id) => {
    const updatedQa = qaData.map(item =>
      item.id === id ? { ...item, is_active: !item.is_active } : item
    );
    setQaData(updatedQa);
    message.success('狀態更新成功');
  };

  // 處理照片狀態切換
  const handlePhotoStatusToggle = (id, type) => {
    if (type === 'company') {
      const updatedPhotos = companyPhotos.map(photo =>
        photo.id === id ? { ...photo, is_active: !photo.is_active } : photo
      );
      setCompanyPhotos(updatedPhotos);
    } else if (type === 'system') {
      const updatedPhotos = systemPhotos.map(photo =>
        photo.id === id ? { ...photo, is_active: !photo.is_active } : photo
      );
      setSystemPhotos(updatedPhotos);
    }
    message.success('照片狀態更新成功');
  };

  // 處理批量操作
  const handleBatchOperation = (operation, ids) => {
    Modal.confirm({
      title: '確認批量操作',
      content: `確定要${operation}選中的項目嗎？`,
      onOk: () => {
        if (operation === 'delete') {
          setQaData(qaData.filter(item => !ids.includes(item.id)));
          message.success('批量刪除成功');
        } else if (operation === 'activate') {
          const updatedQa = qaData.map(item =>
            ids.includes(item.id) ? { ...item, is_active: true } : item
          );
          setQaData(updatedQa);
          message.success('批量啟用成功');
        } else if (operation === 'deactivate') {
          const updatedQa = qaData.map(item =>
            ids.includes(item.id) ? { ...item, is_active: false } : item
          );
          setQaData(updatedQa);
          message.success('批量停用成功');
        }
      }
    });
  };

  // 處理匯出功能
  const handleExport = (type) => {
    let data = '';
    let filename = '';

    if (type === 'qa') {
      data = JSON.stringify(qaData, null, 2);
      filename = 'platform_qa.json';
    } else if (type === 'photos') {
      data = JSON.stringify([...companyPhotos, ...systemPhotos], null, 2);
      filename = 'platform_photos.json';
    } else if (type === 'settings') {
      data = JSON.stringify(platformSettings, null, 2);
      filename = 'platform_settings.json';
    }

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    message.success('匯出成功');
  };

  // 處理匯入功能
  const handleImport = (type, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (type === 'qa') {
          setQaData(data);
          message.success('Q&A 匯入成功');
        } else if (type === 'photos') {
          const companyPhotos = data.filter(photo => photo.category === 'company');
          const systemPhotos = data.filter(photo => photo.category === 'system');
          setCompanyPhotos(companyPhotos);
          setSystemPhotos(systemPhotos);
          message.success('照片匯入成功');
        } else if (type === 'settings') {
          setPlatformSettings(data);
          message.success('設定匯入成功');
        }
      } catch (error) {
        message.error('匯入失敗：檔案格式錯誤');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* 頁面標題和操作按鈕 */}
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={2}>
                  <InfoCircleOutlined /> 平台簡介
                </Title>
              </Col>
              <Col>
                <Space>
                  <Button 
                    type={editMode ? 'primary' : 'default'}
                    icon={<EditOutlined />}
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? '退出編輯' : '編輯模式'}
                  </Button>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setLoading(true);
                      setTimeout(() => {
                        setLoading(false);
                        message.success('頁面重新載入成功');
                      }, 1000);
                    }}
                  >
                    重新載入
                  </Button>
                  <Button 
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => handleExport('settings')}
                  >
                    匯出設定
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 平台概覽 */}
        <Col span={24}>
          <Card 
            title={
              <Space>
                <DashboardOutlined />
                平台概覽
              </Space>
            }
            extra={
              editMode && (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: '編輯平台概覽',
                      content: (
                        <Form layout="vertical">
                          <Form.Item label="平台名稱">
                            <Input defaultValue={platformSettings.platformName} />
                          </Form.Item>
                          <Form.Item label="版本">
                            <Input defaultValue={platformSettings.version} />
                          </Form.Item>
                          <Form.Item label="描述">
                            <TextArea rows={3} defaultValue={platformSettings.description} />
                          </Form.Item>
                        </Form>
                      ),
                      onOk: () => message.success('平台概覽更新成功')
                    });
                  }}
                >
                  編輯概覽
                </Button>
              )
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={16}>
                <Title level={4}>{platformSettings.platformName}</Title>
                <Paragraph>
                  {platformSettings.description}
                </Paragraph>
                <Descriptions column={2}>
                  <Descriptions.Item label="版本">{platformSettings.version}</Descriptions.Item>
                  <Descriptions.Item label="公司">{platformSettings.companyName}</Descriptions.Item>
                  <Descriptions.Item label="聯絡信箱">{platformSettings.contactEmail}</Descriptions.Item>
                  <Descriptions.Item label="網站">{platformSettings.website}</Descriptions.Item>
                </Descriptions>
                <Paragraph>
                  平台採用現代化的微服務架構，提供高可用性、高可擴展性和安全性，能夠滿足不同規模企業的需求。
                </Paragraph>
              </Col>
              <Col span={8}>
                <Statistic
                  title="支援協定"
                  value={5}
                  suffix="種"
                  prefix={<ApiOutlined />}
                />
                <Statistic
                  title="AI 模型"
                  value={12}
                  suffix="個"
                  prefix={<RobotOutlined />}
                />
                <Statistic
                  title="活躍設備"
                  value={156}
                  suffix="台"
                  prefix={<DesktopOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 公司照片展示 */}
        <Col span={24}>
          <Card 
            title={
              <Space>
                <BankOutlined />
                公司環境
              </Space>
            }
            extra={
              <Space>
                {editMode && (
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => handleAddPhoto('company')}
                  >
                    新增照片
                  </Button>
                )}
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => handleExport('photos')}
                >
                  匯出照片
                </Button>
              </Space>
            }
          >
            <Carousel autoplay dots={{ position: 'bottom' }}>
              {companyPhotos.filter(photo => photo.is_active).map((photo) => (
                <div key={photo.id}>
                  <div style={{ position: 'relative', height: 400 }}>
                    <Image
                      src={photo.imageUrl}
                      alt={photo.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      preview={{
                        mask: (
                          <div style={{ textAlign: 'center' }}>
                            <EyeOutlined />
                            <div>點擊預覽</div>
                          </div>
                        )
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      color: 'white',
                      padding: '20px'
                    }}>
                      <Title level={4} style={{ color: 'white', margin: 0 }}>
                        {photo.title}
                      </Title>
                      <Text style={{ color: 'white' }}>
                        {photo.description}
                      </Text>
                      {editMode && (
                        <Space style={{ position: 'absolute', top: 10, right: 10 }}>
                          <Switch
                            size="small"
                            checked={photo.is_active}
                            onChange={() => handlePhotoStatusToggle(photo.id, 'company')}
                          />
                          <Button 
                            type="primary" 
                            danger 
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeletePhoto(photo.id, 'company')}
                          >
                            刪除
                          </Button>
                        </Space>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </Card>
        </Col>

        {/* 系統照片展示 */}
        <Col span={24}>
          <Card 
            title={
              <Space>
                <DesktopOutlined />
                系統展示
              </Space>
            }
            extra={
              editMode && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => handleAddPhoto('system')}
                >
                  新增照片
                </Button>
              )
            }
          >
            <Row gutter={[16, 16]}>
              {systemPhotos.filter(photo => photo.is_active).map((photo) => (
                <Col span={12} key={photo.id}>
                  <Card
                    hoverable
                    cover={
                      <div style={{ position: 'relative', height: 200 }}>
                        <Image
                          src={photo.imageUrl}
                          alt={photo.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          preview={{
                            mask: (
                              <div style={{ textAlign: 'center' }}>
                                <EyeOutlined />
                                <div>點擊預覽</div>
                              </div>
                            )
                          }}
                        />
                        {editMode && (
                          <Space style={{ position: 'absolute', top: 10, right: 10 }}>
                            <Switch
                              size="small"
                              checked={photo.is_active}
                              onChange={() => handlePhotoStatusToggle(photo.id, 'system')}
                            />
                            <Button 
                              type="primary" 
                              danger 
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeletePhoto(photo.id, 'system')}
                            >
                              刪除
                            </Button>
                          </Space>
                        )}
                      </div>
                    }
                  >
                    <Card.Meta
                      title={photo.title}
                      description={photo.description}
                    />
                    <Tag color="blue" style={{ marginTop: 8 }}>
                      {photo.category}
                    </Tag>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* 平台架構 */}
        <Col span={24}>
          <Card 
            title="平台架構圖"
            extra={
              <Button 
                icon={<DownloadOutlined />}
                onClick={() => {
                  // 匯出架構圖
                  message.success('架構圖匯出成功');
                }}
              >
                匯出架構圖
              </Button>
            }
          >
            <Tree
              treeData={platformArchitecture}
              defaultExpandAll
              showLine
              showIcon
            />
          </Card>
        </Col>

        {/* 平台特色 */}
        <Col span={24}>
          <Card 
            title="平台特色"
            extra={
              editMode && (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: '編輯平台特色',
                      content: '您可以在此編輯平台特色描述',
                      onOk: () => message.success('平台特色更新成功')
                    });
                  }}
                >
                  編輯特色
                </Button>
              )
            }
          >
            <Row gutter={[16, 16]}>
              {platformFeatures.map((feature, index) => (
                <Col span={8} key={index}>
                  <Card size="small">
                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                      <div style={{ fontSize: 24, color: feature.color }}>
                        {feature.icon}
                      </div>
                      <Title level={5}>{feature.title}</Title>
                      <Text type="secondary" style={{ textAlign: 'center' }}>
                        {feature.description}
                      </Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Q&A */}
        <Col span={24}>
          <Card 
            title="常見問題 (Q&A)" 
            extra={
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => handleEditContent({ type: 'qa' })}
                >
                  新增問題
                </Button>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => handleExport('qa')}
                >
                  匯出 Q&A
                </Button>
                {editMode && (
                  <Button 
                    icon={<UploadOutlined />}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleImport('qa', file);
                        }
                      };
                      input.click();
                    }}
                  >
                    匯入 Q&A
                  </Button>
                )}
              </Space>
            }
          >
            <Collapse defaultActiveKey={['1']}>
              {qaData.filter(item => item.is_active).map((item) => (
                <Panel 
                  header={item.question} 
                  key={item.id}
                  extra={
                    editMode && (
                      <Space>
                        <Switch
                          size="small"
                          checked={item.is_active}
                          onChange={() => handleQaStatusToggle(item.id)}
                        />
                        <Button 
                          type="link" 
                          size="small" 
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditContent(item);
                          }}
                        >
                          編輯
                        </Button>
                        <Popconfirm
                          title="確定要刪除這個問題嗎？"
                          onConfirm={() => handleDeleteQa(item.id)}
                        >
                          <Button 
                            type="link" 
                            size="small" 
                            danger 
                            icon={<DeleteOutlined />}
                            onClick={(e) => e.stopPropagation()}
                          >
                            刪除
                          </Button>
                        </Popconfirm>
                      </Space>
                    )
                  }
                >
                  <Paragraph>{item.answer}</Paragraph>
                  <Tag color="blue">{item.category}</Tag>
                </Panel>
              ))}
            </Collapse>
          </Card>
        </Col>

        {/* 平台設定 */}
        {editMode && (
          <Col span={24}>
            <Card title="平台設定">
              <Tabs defaultActiveKey="basic">
                <Tabs.TabPane tab="基本設定" key="basic">
                  <Form layout="vertical">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="平台名稱">
                          <Input 
                            defaultValue={platformSettings.platformName}
                            onChange={(e) => handlePlatformSettingsUpdate({ platformName: e.target.value })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="版本">
                          <Input 
                            defaultValue={platformSettings.version}
                            onChange={(e) => handlePlatformSettingsUpdate({ version: e.target.value })}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item label="描述">
                      <TextArea 
                        rows={3}
                        defaultValue={platformSettings.description}
                        onChange={(e) => handlePlatformSettingsUpdate({ description: e.target.value })}
                      />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="公司名稱">
                          <Input 
                            defaultValue={platformSettings.companyName}
                            onChange={(e) => handlePlatformSettingsUpdate({ companyName: e.target.value })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="聯絡信箱">
                          <Input 
                            defaultValue={platformSettings.contactEmail}
                            onChange={(e) => handlePlatformSettingsUpdate({ contactEmail: e.target.value })}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Tabs.TabPane>
                <Tabs.TabPane tab="功能開關" key="features">
                  <Row gutter={16}>
                    {Object.entries(platformSettings.features).map(([key, value]) => (
                      <Col span={8} key={key}>
                        <Form.Item label={key}>
                          <Switch
                            checked={value}
                            onChange={(checked) => handleFeatureToggle(key, checked)}
                          />
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>
                </Tabs.TabPane>
                <Tabs.TabPane tab="主題設定" key="theme">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="主要顏色">
                        <Input 
                          type="color"
                          defaultValue={platformSettings.themeConfig.primaryColor}
                          onChange={(e) => handleThemeUpdate('primaryColor', e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="次要顏色">
                        <Input 
                          type="color"
                          defaultValue={platformSettings.themeConfig.secondaryColor}
                          onChange={(e) => handleThemeUpdate('secondaryColor', e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="字體">
                    <Select
                      defaultValue={platformSettings.themeConfig.fontFamily}
                      onChange={(value) => handleThemeUpdate('fontFamily', value)}
                    >
                      <Option value="Arial, sans-serif">Arial</Option>
                      <Option value="Helvetica, sans-serif">Helvetica</Option>
                      <Option value="Times New Roman, serif">Times New Roman</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="深色模式">
                    <Switch
                      checked={platformSettings.themeConfig.darkMode}
                      onChange={(checked) => handleThemeUpdate('darkMode', checked)}
                    />
                  </Form.Item>
                </Tabs.TabPane>
              </Tabs>
            </Card>
          </Col>
        )}
      </Row>

      {/* 編輯模態框 */}
      <Modal
        title="編輯內容"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          onFinish={handleSaveContent}
          layout="vertical"
        >
          <Form.Item
            label="問題"
            name="question"
            rules={[{ required: true, message: '請輸入問題' }]}
          >
            <Input placeholder="請輸入問題" />
          </Form.Item>
          <Form.Item
            label="答案"
            name="answer"
            rules={[{ required: true, message: '請輸入答案' }]}
          >
            <TextArea rows={4} placeholder="請輸入答案" />
          </Form.Item>
          <Form.Item
            label="分類"
            name="category"
            rules={[{ required: true, message: '請選擇分類' }]}
          >
            <Select placeholder="請選擇分類">
              <Option value="basic">基礎問題</Option>
              <Option value="communication">通訊協定</Option>
              <Option value="device">設備管理</Option>
              <Option value="ai">AI 分析</Option>
              <Option value="alert">告警設定</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                儲存
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 照片上傳模態框 */}
      <Modal
        title="新增照片"
        open={photoUploadModalVisible}
        onCancel={() => setPhotoUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          onFinish={handlePhotoUpload}
          layout="vertical"
        >
          <Form.Item
            label="照片標題"
            name="title"
            rules={[{ required: true, message: '請輸入標題' }]}
          >
            <Input placeholder="請輸入照片標題" />
          </Form.Item>
          <Form.Item
            label="照片描述"
            name="description"
            rules={[{ required: true, message: '請輸入描述' }]}
          >
            <TextArea rows={3} placeholder="請輸入照片描述" />
          </Form.Item>
          <Form.Item
            label="照片 URL"
            name="imageUrl"
            rules={[{ required: true, message: '請輸入照片 URL' }]}
          >
            <Input placeholder="請輸入照片 URL" />
          </Form.Item>
          <Form.Item
            label="分類"
            name="category"
            rules={[{ required: true, message: '請選擇分類' }]}
          >
            <Select placeholder="請選擇分類">
              <Option value="building">建築</Option>
              <Option value="rd">研發</Option>
              <Option value="meeting">會議</Option>
              <Option value="dashboard">儀表板</Option>
              <Option value="monitoring">監控</Option>
              <Option value="ai">AI 分析</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                新增
              </Button>
              <Button onClick={() => setPhotoUploadModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PlatformIntro; 