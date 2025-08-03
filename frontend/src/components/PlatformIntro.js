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
  Carousel
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
  BankOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
const { TextArea } = Input;

const PlatformIntro = () => {
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [form] = Form.useForm();

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
      title: '生產線',
      description: '智能製造生產線展示',
      imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop',
      category: 'production',
      is_active: true
    },
    {
      id: 4,
      title: '團隊合照',
      description: '專業的技術團隊',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
      category: 'team',
      is_active: true
    }
  ]);

  // 系統照片數據
  const [systemPhotos, setSystemPhotos] = useState([
    {
      id: 1,
      title: '控制中心',
      description: '工業物聯網平台控制中心',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      category: 'control',
      is_active: true
    },
    {
      id: 2,
      title: '數據中心',
      description: '高性能數據處理中心',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
      category: 'data',
      is_active: true
    },
    {
      id: 3,
      title: '監控螢幕',
      description: '實時監控系統介面',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      category: 'monitoring',
      is_active: true
    },
    {
      id: 4,
      title: '設備展示',
      description: '工業設備連接展示',
      imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop',
      category: 'equipment',
      is_active: true
    }
  ]);

  // 平台架構樹狀圖數據
  const platformArchitecture = [
    {
      title: '工業物聯網平台 (IIoT Platform)',
      key: 'platform',
      children: [
        {
          title: '前端層 (Frontend Layer)',
          key: 'frontend',
          children: [
            {
              title: 'React 用戶介面',
              key: 'react-ui',
              children: [
                { title: '儀表板', key: 'dashboard' },
                { title: '設備管理', key: 'device-management' },
                { title: '數據分析', key: 'data-analysis' },
                { title: 'AI 分析', key: 'ai-analysis' },
                { title: '告警中心', key: 'alert-center' },
                { title: '系統設定', key: 'system-settings' }
              ]
            },
            {
              title: 'Ant Design 組件庫',
              key: 'antd-components'
            }
          ]
        },
        {
          title: '後端層 (Backend Layer)',
          key: 'backend',
          children: [
            {
              title: 'FastAPI 服務',
              key: 'fastapi-service',
              children: [
                { title: 'RESTful API', key: 'rest-api' },
                { title: 'WebSocket', key: 'websocket' },
                { title: '認證授權', key: 'auth' },
                { title: '數據處理', key: 'data-processing' }
              ]
            },
            {
              title: 'Python 核心',
              key: 'python-core',
              children: [
                { title: '設備通訊', key: 'device-communication' },
                { title: '數據分析', key: 'data-analytics' },
                { title: 'AI 模型', key: 'ai-models' },
                { title: '規則引擎', key: 'rule-engine' }
              ]
            }
          ]
        },
        {
          title: '數據層 (Data Layer)',
          key: 'data-layer',
          children: [
            {
              title: 'PostgreSQL',
              key: 'postgresql',
              children: [
                { title: '用戶數據', key: 'user-data' },
                { title: '設備數據', key: 'device-data' },
                { title: '系統配置', key: 'system-config' }
              ]
            },
            {
              title: 'InfluxDB',
              key: 'influxdb',
              children: [
                { title: '時序數據', key: 'time-series' },
                { title: '監控數據', key: 'monitoring-data' }
              ]
            },
            {
              title: 'Redis',
              key: 'redis',
              children: [
                { title: '快取', key: 'cache' },
                { title: '會話管理', key: 'session' }
              ]
            }
          ]
        },
        {
          title: '通訊層 (Communication Layer)',
          key: 'communication',
          children: [
            { title: 'MQTT', key: 'mqtt' },
            { title: 'RESTful API', key: 'rest' },
            { title: 'Modbus TCP', key: 'modbus-tcp' },
            { title: 'OPC UA', key: 'opc-ua' },
            { title: 'ONVIF', key: 'onvif' }
          ]
        },
        {
          title: '設備層 (Device Layer)',
          key: 'device-layer',
          children: [
            { title: '感測器', key: 'sensors' },
            { title: '控制器', key: 'controllers' },
            { title: '攝影機', key: 'cameras' },
            { title: 'PLC', key: 'plc' },
            { title: 'SCADA', key: 'scada' }
          ]
        }
      ]
    }
  ];

  // Q&A 數據
  const [qaData, setQaData] = useState([
    {
      id: 1,
      question: '什麼是工業物聯網平台？',
      answer: '工業物聯網平台是一個整合了設備管理、數據收集、分析和可視化的綜合性平台，專為工業環境設計，提供實時監控、預測性維護和智能決策支援。',
      category: 'basic',
      is_active: true
    },
    {
      id: 2,
      question: '平台支援哪些通訊協定？',
      answer: '平台支援多種工業通訊協定，包括 MQTT、RESTful API、Modbus TCP、OPC UA 和 ONVIF，確保與各種工業設備的兼容性。',
      category: 'communication',
      is_active: true
    },
    {
      id: 3,
      question: '如何進行設備註冊？',
      answer: '設備註冊可以通過 API 自動註冊或手動註冊兩種方式。自動註冊適用於支援自動發現的設備，手動註冊則需要輸入設備的基本資訊和通訊參數。',
      category: 'device',
      is_active: true
    },
    {
      id: 4,
      question: 'AI 分析功能包含哪些？',
      answer: 'AI 分析功能包括異常檢測、預測性維護、圖像識別、自然語言處理等，支援自定義模型訓練和部署。',
      category: 'ai',
      is_active: true
    },
    {
      id: 5,
      question: '如何設定告警規則？',
      answer: '可以通過規則引擎設定告警規則，支援複雜的邏輯條件和 AI 評分，可以設定多種告警方式和自動化動作。',
      category: 'alert',
      is_active: true
    }
  ]);

  // 平台特色數據
  const platformFeatures = [
    {
      title: '多協定支援',
      description: '支援 MQTT、RESTful、Modbus TCP、OPC UA、ONVIF 等多種工業通訊協定',
      icon: <ApiOutlined />,
      color: '#1890ff'
    },
    {
      title: 'AI 驅動分析',
      description: '整合機器學習和深度學習，提供智能異常檢測和預測性維護',
      icon: <RobotOutlined />,
      color: '#52c41a'
    },
    {
      title: '實時監控',
      description: '提供實時數據監控和可視化，支援多種圖表類型',
      icon: <DashboardOutlined />,
      color: '#faad14'
    },
    {
      title: '安全可靠',
      description: '多重安全機制，包括身份驗證、授權、數據加密和審計日誌',
      icon: <SafetyCertificateOutlined />,
      color: '#f5222d'
    },
    {
      title: '可擴展架構',
      description: '微服務架構設計，支援水平擴展和模組化部署',
      icon: <GlobalOutlined />,
      color: '#722ed1'
    },
    {
      title: '易於使用',
      description: '直觀的用戶介面和豐富的配置選項，降低學習成本',
      icon: <StarOutlined />,
      color: '#eb2f96'
    }
  ];

  const handleEditContent = (content) => {
    setSelectedContent(content);
    form.setFieldsValue(content);
    setEditModalVisible(true);
  };

  const handleSaveContent = async (values) => {
    try {
      // 這裡應該調用 API 儲存內容
      message.success('內容更新成功');
      setEditModalVisible(false);
      // 重新載入數據
    } catch (error) {
      message.error('儲存失敗');
    }
  };

  const handleAddPhoto = (type) => {
    // 新增照片邏輯
    message.info(`新增${type === 'company' ? '公司' : '系統'}照片功能`);
  };

  const handleDeletePhoto = (id, type) => {
    // 刪除照片邏輯
    message.success(`刪除${type === 'company' ? '公司' : '系統'}照片成功`);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <InfoCircleOutlined /> 平台簡介
      </Title>

      <Row gutter={[16, 16]}>
        {/* 平台概覽 */}
        <Col span={24}>
          <Card 
            title="平台概覽" 
            extra={
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? '檢視模式' : '編輯模式'}
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={16}>
                <Paragraph>
                  工業物聯網平台是一個專為工業環境設計的綜合性物聯網解決方案。
                  平台整合了設備管理、數據收集、實時分析、AI 智能分析、告警管理等功能，
                  為工業企業提供完整的數位化轉型支援。
                </Paragraph>
                <Paragraph>
                  平台採用現代化的微服務架構，支援多種工業通訊協定，具備高可用性、
                  可擴展性和安全性，能夠滿足不同規模企業的需求。
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
              editMode && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => handleAddPhoto('company')}
                >
                  新增照片
                </Button>
              )
            }
          >
            <Carousel autoplay dots={{ position: 'bottom' }}>
              {companyPhotos.map((photo) => (
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
                        <Button 
                          type="primary" 
                          danger 
                          size="small"
                          icon={<DeleteOutlined />}
                          style={{ position: 'absolute', top: 10, right: 10 }}
                          onClick={() => handleDeletePhoto(photo.id, 'company')}
                        >
                          刪除
                        </Button>
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
              {systemPhotos.map((photo) => (
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
                          <Button 
                            type="primary" 
                            danger 
                            size="small"
                            icon={<DeleteOutlined />}
                            style={{ position: 'absolute', top: 10, right: 10 }}
                            onClick={() => handleDeletePhoto(photo.id, 'system')}
                          >
                            刪除
                          </Button>
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
          <Card title="平台架構圖">
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
          <Card title="平台特色">
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
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => handleEditContent({ type: 'qa' })}
              >
                新增問題
              </Button>
            }
          >
            <Collapse defaultActiveKey={['1']}>
              {qaData.map((item) => (
                <Panel 
                  header={item.question} 
                  key={item.id}
                  extra={
                    editMode && (
                      <Space>
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
                          onConfirm={() => {
                            // 刪除邏輯
                          }}
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
              <Button type="primary" htmlType="submit">
                儲存
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
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