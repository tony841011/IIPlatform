import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Divider, 
  List, 
  Tag, 
  Space, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Upload, 
  Image, 
  message, 
  Switch, 
  Tooltip,
  Carousel,
  Avatar,
  Badge,
  Popconfirm,
  Select,
  InputNumber
} from 'antd';
import { 
  RocketOutlined, 
  SafetyCertificateOutlined, 
  CloudOutlined, 
  ApiOutlined,
  DatabaseOutlined,
  RobotOutlined,
  MonitorOutlined,
  SettingOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  PictureOutlined,
  UploadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PlatformIntro = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [form] = Form.useForm();
  const [imageForm] = Form.useForm();

  // 平台簡介內容狀態
  const [platformContent, setPlatformContent] = useState({
    title: '工業物聯網平台 (IIPlatform)',
    subtitle: '一個整合的工業物聯網解決方案，提供設備管理、數據採集、智能分析和安全監控的完整平台',
    description: 'IIPlatform 是一個現代化的工業物聯網平台，專為製造業、能源管理和智慧城市等領域設計。平台整合了最新的技術，提供完整的 IoT 解決方案。',
    features: [
      {
        icon: <DatabaseOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
        title: '多資料庫支援',
        description: '支援 PostgreSQL、MongoDB、InfluxDB 等多種資料庫，滿足不同數據類型需求'
      },
      {
        icon: <MonitorOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
        title: '即時監控',
        description: '提供設備狀態即時監控、數據可視化和警報管理功能'
      },
      {
        icon: <RobotOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
        title: 'AI 分析',
        description: '整合機器學習算法，提供異常偵測、預測性維護等智能分析功能'
      },
      {
        icon: <ApiOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
        title: '通訊協定',
        description: '支援 MQTT、Modbus TCP、OPC UA 等主流工業通訊協定'
      },
      {
        icon: <SafetyCertificateOutlined style={{ fontSize: '24px', color: '#eb2f96' }} />,
        title: '安全認證',
        description: '提供完整的用戶認證、權限管理和安全防護機制'
      },
      {
        icon: <CloudOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />,
        title: '雲端整合',
        description: '支援雲端部署和邊緣計算，提供靈活的部署方案'
      }
    ],
    techStack: [
      { name: 'React 18', type: 'frontend' },
      { name: 'Ant Design', type: 'frontend' },
      { name: 'FastAPI', type: 'backend' },
      { name: 'SQLAlchemy', type: 'backend' },
      { name: 'PostgreSQL', type: 'database' },
      { name: 'MongoDB', type: 'database' },
      { name: 'InfluxDB', type: 'database' },
      { name: 'MQTT', type: 'protocol' },
      { name: 'Modbus TCP', type: 'protocol' },
      { name: 'OPC UA', type: 'protocol' }
    ],
    modules: [
      {
        title: '設備管理',
        items: ['設備註冊與配置', '設備狀態監控', '設備分組管理', '設備控制命令']
      },
      {
        title: '數據處理',
        items: ['即時數據採集', '歷史數據查詢', '數據清洗與轉換', '數據匯出功能']
      },
      {
        title: '警報系統',
        items: ['警報規則配置', '即時警報通知', '警報歷史記錄', '警報處理流程']
      },
      {
        title: '用戶管理',
        items: ['用戶認證授權', '角色權限管理', '操作日誌記錄', '系統設定管理']
      },
      {
        title: '分析報表',
        items: ['數據可視化', '趨勢分析', '統計報表', '自定義儀表板']
      },
      {
        title: '系統監控',
        items: ['系統健康檢查', '性能監控', '資源使用統計', '故障診斷']
      }
    ],
    quickStart: [
      {
        title: '系統登入',
        description: '使用預設帳號 admin / admin123 登入系統'
      },
      {
        title: '資料庫配置',
        description: '在登入頁面配置遠端資料庫連線，或使用預設的本地資料庫'
      },
      {
        title: '設備管理',
        description: '新增和管理您的 IoT 設備，配置設備參數和通訊設定'
      },
      {
        title: '數據監控',
        description: '查看即時數據、歷史趨勢和系統警報'
      },
      {
        title: '系統設定',
        description: '配置通知偏好、用戶權限和系統參數'
      }
    ],
    images: [
      {
        id: 1,
        name: '平台架構圖',
        url: '/api/images/platform-architecture.jpg',
        alt: 'IIPlatform 系統架構圖',
        category: 'architecture',
        description: '展示平台整體架構和組件關係'
      },
      {
        id: 2,
        name: '儀表板截圖',
        url: '/api/images/dashboard-screenshot.jpg',
        alt: '平台儀表板界面',
        category: 'interface',
        description: '平台主要儀表板界面展示'
      }
    ]
  });

  // 載入平台內容
  useEffect(() => {
    loadPlatformContent();
  }, []);

  const loadPlatformContent = async () => {
    try {
      // 這裡可以從 API 載入客製化內容
      // const response = await fetch('/api/v1/platform-content');
      // const data = await response.json();
      // setPlatformContent(data);
    } catch (error) {
      console.error('載入平台內容失敗:', error);
    }
  };

  // 保存平台內容
  const savePlatformContent = async (content) => {
    try {
      // 這裡可以保存到 API
      // const response = await fetch('/api/v1/platform-content', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(content)
      // });
      setPlatformContent(content);
      message.success('內容保存成功！');
    } catch (error) {
      message.error('保存失敗: ' + error.message);
    }
  };

  // 編輯內容
  const handleEditContent = (section, data) => {
    setCurrentSection(section);
    form.setFieldsValue(data);
    setIsModalVisible(true);
  };

  // 保存編輯內容
  const handleSaveContent = () => {
    form.validateFields().then(values => {
      const updatedContent = { ...platformContent };
      
      if (currentSection === 'basic') {
        updatedContent.title = values.title;
        updatedContent.subtitle = values.subtitle;
        updatedContent.description = values.description;
      } else if (currentSection === 'feature') {
        const featureIndex = values.index;
        updatedContent.features[featureIndex] = {
          ...updatedContent.features[featureIndex],
          title: values.title,
          description: values.description
        };
      } else if (currentSection === 'module') {
        const moduleIndex = values.index;
        updatedContent.modules[moduleIndex] = {
          ...updatedContent.modules[moduleIndex],
          title: values.title,
          items: values.items.split('\n').filter(item => item.trim())
        };
      }

      savePlatformContent(updatedContent);
      setIsModalVisible(false);
    });
  };

  // 圖片上傳
  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', imageForm.getFieldValue('category'));
      formData.append('description', imageForm.getFieldValue('description'));

      // 這裡可以上傳到 API
      // const response = await fetch('/api/v1/platform-images', {
      //   method: 'POST',
      //   body: formData
      // });

      message.success('圖片上傳成功！');
      return false; // 阻止自動上傳
    } catch (error) {
      message.error('圖片上傳失敗: ' + error.message);
      return false;
    }
  };

  // 刪除圖片
  const handleDeleteImage = (imageId) => {
    const updatedImages = platformContent.images.filter(img => img.id !== imageId);
    const updatedContent = { ...platformContent, images: updatedImages };
    savePlatformContent(updatedContent);
    message.success('圖片刪除成功！');
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 編輯模式切換 */}
      <div style={{ marginBottom: '16px', textAlign: 'right' }}>
        <Space>
          <Switch
            checked={isEditMode}
            onChange={setIsEditMode}
            checkedChildren="編輯模式"
            unCheckedChildren="檢視模式"
          />
          {isEditMode && (
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              onClick={() => savePlatformContent(platformContent)}
            >
              保存所有變更
            </Button>
          )}
        </Space>
      </div>

      <Card>
        {/* 標題區域 */}
        <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative' }}>
          {isEditMode && (
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ position: 'absolute', top: 0, right: 0 }}
              onClick={() => handleEditContent('basic', {
                title: platformContent.title,
                subtitle: platformContent.subtitle,
                description: platformContent.description
              })}
            >
              編輯
            </Button>
          )}
          
          <Title level={1}>
            <RocketOutlined style={{ marginRight: '16px', color: '#1890ff' }} />
            {platformContent.title}
          </Title>
          <Paragraph style={{ fontSize: '18px', color: '#666' }}>
            {platformContent.subtitle}
          </Paragraph>
          <Paragraph style={{ fontSize: '16px', color: '#888', maxWidth: '800px', margin: '0 auto' }}>
            {platformContent.description}
          </Paragraph>
        </div>

        <Divider />

        {/* 平台特色 */}
        <div style={{ position: 'relative' }}>
          {isEditMode && (
            <Button
              type="text"
              icon={<PlusOutlined />}
              style={{ position: 'absolute', top: 0, right: 0 }}
              onClick={() => setIsImageModalVisible(true)}
            >
              管理圖片
            </Button>
          )}
          
          <Title level={2}>平台特色</Title>
          
          {/* 圖片輪播 */}
          {platformContent.images.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <Carousel autoplay>
                {platformContent.images.map((image, index) => (
                  <div key={index}>
                    <div style={{ position: 'relative', height: '300px', background: '#f0f0f0' }}>
                      <Image
                        src={image.url}
                        alt={image.alt}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                      />
                      {isEditMode && (
                        <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                          <Space>
                            <Tooltip title="查看詳情">
                              <Button 
                                type="text" 
                                size="small" 
                                icon={<EyeOutlined />}
                                style={{ color: 'white', background: 'rgba(0,0,0,0.5)' }}
                              />
                            </Tooltip>
                            <Popconfirm
                              title="確定要刪除這張圖片嗎？"
                              onConfirm={() => handleDeleteImage(image.id)}
                            >
                              <Button 
                                type="text" 
                                size="small" 
                                danger 
                                icon={<DeleteOutlined />}
                                style={{ color: 'white', background: 'rgba(0,0,0,0.5)' }}
                              />
                            </Popconfirm>
                          </Space>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '8px' }}>
                      <Text strong>{image.name}</Text>
                      <br />
                      <Text type="secondary">{image.description}</Text>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          )}

          <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
            {platformContent.features.map((feature, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card hoverable style={{ height: '100%', position: 'relative' }}>
                  {isEditMode && (
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 1 }}
                      onClick={() => handleEditContent('feature', {
                        index,
                        title: feature.title,
                        description: feature.description
                      })}
                    />
                  )}
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                      {feature.icon}
                    </div>
                    <Title level={4} style={{ textAlign: 'center', margin: 0 }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{ textAlign: 'center', margin: 0 }}>
                      {feature.description}
                    </Paragraph>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <Divider />

        {/* 技術架構 */}
        <Title level={2}>技術架構</Title>
        <Row gutter={[16, 16]} style={{ marginBottom: '40px' }}>
          <Col span={24}>
            <Card>
              <Space wrap>
                {platformContent.techStack.map((tech, index) => (
                  <Tag 
                    key={index} 
                    color={
                      tech.type === 'frontend' ? 'blue' :
                      tech.type === 'backend' ? 'green' :
                      tech.type === 'database' ? 'purple' : 'orange'
                    }
                    style={{ fontSize: '14px', padding: '8px 16px' }}
                  >
                    {tech.name}
                  </Tag>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* 功能模組 */}
        <Title level={2}>功能模組</Title>
        <Row gutter={[24, 24]}>
          {platformContent.modules.map((module, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card title={module.title} hoverable style={{ position: 'relative' }}>
                {isEditMode && (
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 1 }}
                    onClick={() => handleEditContent('module', {
                      index,
                      title: module.title,
                      items: module.items.join('\n')
                    })}
                  />
                )}
                <List
                  size="small"
                  dataSource={module.items}
                  renderItem={item => (
                    <List.Item>
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Divider />

        {/* 快速開始 */}
        <Title level={2}>快速開始</Title>
        <Card>
          <List>
            {platformContent.quickStart.map((item, index) => (
              <List.Item key={index}>
                <Text strong>{index + 1}. {item.title}</Text>
                <br />
                <Text type="secondary">{item.description}</Text>
              </List.Item>
            ))}
          </List>
        </Card>
      </Card>

      {/* 編輯內容模態框 */}
      <Modal
        title="編輯內容"
        open={isModalVisible}
        onOk={handleSaveContent}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          {currentSection === 'basic' && (
            <>
              <Form.Item
                name="title"
                label="平台標題"
                rules={[{ required: true, message: '請輸入平台標題' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="subtitle"
                label="副標題"
                rules={[{ required: true, message: '請輸入副標題' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="description"
                label="詳細描述"
                rules={[{ required: true, message: '請輸入詳細描述' }]}
              >
                <TextArea rows={4} />
              </Form.Item>
            </>
          )}
          
          {currentSection === 'feature' && (
            <>
              <Form.Item name="index" hidden>
                <Input />
              </Form.Item>
              <Form.Item
                name="title"
                label="功能標題"
                rules={[{ required: true, message: '請輸入功能標題' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="description"
                label="功能描述"
                rules={[{ required: true, message: '請輸入功能描述' }]}
              >
                <TextArea rows={3} />
              </Form.Item>
            </>
          )}
          
          {currentSection === 'module' && (
            <>
              <Form.Item name="index" hidden>
                <Input />
              </Form.Item>
              <Form.Item
                name="title"
                label="模組標題"
                rules={[{ required: true, message: '請輸入模組標題' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="items"
                label="功能項目（每行一個）"
                rules={[{ required: true, message: '請輸入功能項目' }]}
              >
                <TextArea rows={6} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {/* 圖片管理模態框 */}
      <Modal
        title="圖片管理"
        open={isImageModalVisible}
        onCancel={() => setIsImageModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={imageForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="圖片分類"
                rules={[{ required: true, message: '請選擇圖片分類' }]}
              >
                <Select placeholder="選擇分類">
                  <Option value="architecture">架構圖</Option>
                  <Option value="interface">界面截圖</Option>
                  <Option value="demo">演示圖</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="description"
                label="圖片描述"
                rules={[{ required: true, message: '請輸入圖片描述' }]}
              >
                <Input placeholder="描述圖片內容" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item label="上傳圖片">
            <Upload
              beforeUpload={handleImageUpload}
              accept="image/*"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>選擇圖片</Button>
            </Upload>
            <Text type="secondary" style={{ marginLeft: '8px' }}>
              支援 JPG、PNG、GIF 格式，最大 5MB
            </Text>
          </Form.Item>
        </Form>

        <Divider />

        <Title level={4}>現有圖片</Title>
        <Row gutter={[16, 16]}>
          {platformContent.images.map((image) => (
            <Col span={8} key={image.id}>
              <Card
                hoverable
                cover={
                  <Image
                    src={image.url}
                    alt={image.alt}
                    style={{ height: '120px', objectFit: 'cover' }}
                  />
                }
                actions={[
                  <Tooltip title="查看">
                    <EyeOutlined />
                  </Tooltip>,
                  <Popconfirm
                    title="確定要刪除這張圖片嗎？"
                    onConfirm={() => handleDeleteImage(image.id)}
                  >
                    <DeleteOutlined style={{ color: '#ff4d4f' }} />
                  </Popconfirm>
                ]}
              >
                <Card.Meta
                  title={image.name}
                  description={image.description}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>
    </div>
  );
};

export default PlatformIntro; 