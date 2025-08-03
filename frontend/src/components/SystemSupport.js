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
  Table,
  Radio,
  Checkbox,
  DatePicker,
  TimePicker,
  Rate
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
  UserOutlined,
  MessageOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
  SwapOutlined,
  SendOutlined,
  PaperClipOutlined,
  BellOutlined,
  SkypeOutlined,
  WechatOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const SystemSupport = () => {
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactForm] = Form.useForm();
  const [form] = Form.useForm();

  // 聯絡資訊數據
  const [contactInfo, setContactInfo] = useState({
    technical_support: {
      phone: '+886-2-1234-5678',
      email: 'tech-support@company.com',
      hours: '週一至週五 9:00-18:00',
      response_time: '4小時內'
    },
    emergency_support: {
      phone: '+886-2-1234-9999',
      email: 'emergency@company.com',
      hours: '24/7',
      response_time: '30分鐘內'
    },
    sales_inquiry: {
      phone: '+886-2-1234-8888',
      email: 'sales@company.com',
      hours: '週一至週五 9:00-18:00',
      response_time: '2小時內'
    }
  });

  // 支援團隊數據
  const [supportTeam, setSupportTeam] = useState([
    {
      id: 1,
      name: '張工程師',
      role: '技術支援工程師',
      phone: '+886-912-345-678',
      email: 'zhang.engineer@company.com',
      expertise: ['設備管理', '數據分析', '系統整合'],
      availability: '週一至週五 9:00-18:00',
      avatar: 'https://joeschmoe.io/api/v1/1'
    },
    {
      id: 2,
      name: '李經理',
      role: '客戶成功經理',
      phone: '+886-912-345-679',
      email: 'li.manager@company.com',
      expertise: ['專案管理', '客戶關係', '需求分析'],
      availability: '週一至週五 9:00-18:00',
      avatar: 'https://joeschmoe.io/api/v1/2'
    },
    {
      id: 3,
      name: '王顧問',
      role: '資深技術顧問',
      phone: '+886-912-345-680',
      email: 'wang.consultant@company.com',
      expertise: ['AI 分析', '系統架構', '效能優化'],
      availability: '週一至週五 9:00-18:00',
      avatar: 'https://joeschmoe.io/api/v1/3'
    }
  ]);

  // 服務等級協議 (SLA)
  const [slaData, setSlaData] = useState([
    {
      level: 'P1 - 緊急',
      description: '系統完全無法使用',
      response_time: '30分鐘',
      resolution_time: '4小時',
      examples: ['系統當機', '數據丟失', '安全漏洞']
    },
    {
      level: 'P2 - 高',
      description: '重要功能無法使用',
      response_time: '2小時',
      resolution_time: '8小時',
      examples: ['關鍵功能異常', '性能嚴重下降']
    },
    {
      level: 'P3 - 中',
      description: '部分功能受影響',
      response_time: '4小時',
      resolution_time: '24小時',
      examples: ['非關鍵功能異常', '使用體驗問題']
    },
    {
      level: 'P4 - 低',
      description: '一般諮詢或建議',
      response_time: '24小時',
      resolution_time: '72小時',
      examples: ['功能建議', '使用諮詢', '文檔需求']
    }
  ]);

  // 常見問題解決方案
  const [solutions, setSolutions] = useState([
    {
      id: 1,
      title: '設備連線問題',
      category: 'connectivity',
      description: '設備無法連接到平台',
      solution: '檢查網路設定、確認設備 IP 地址、驗證通訊協定設定',
      steps: [
        '檢查設備網路連線',
        '確認設備 IP 地址設定',
        '驗證通訊協定參數',
        '檢查防火牆設定'
      ]
    },
    {
      id: 2,
      title: '數據顯示異常',
      category: 'data',
      description: '儀表板數據顯示不正確',
      solution: '檢查數據源設定、確認數據格式、驗證計算邏輯',
      steps: [
        '檢查數據源連線',
        '確認數據格式正確',
        '驗證計算公式',
        '檢查時間範圍設定'
      ]
    },
    {
      id: 3,
      title: 'AI 模型訓練失敗',
      category: 'ai',
      description: 'AI 模型訓練過程中出現錯誤',
      solution: '檢查訓練數據品質、確認模型參數、驗證硬體資源',
      steps: [
        '檢查訓練數據完整性',
        '確認模型參數設定',
        '驗證 GPU 資源可用性',
        '檢查記憶體使用情況'
      ]
    }
  ]);

  // 聯絡記錄
  const [contactHistory, setContactHistory] = useState([
    {
      id: 1,
      subject: '設備連線問題諮詢',
      priority: 'high',
      status: 'resolved',
      contact_method: 'email',
      created_at: '2024-01-15 14:30:00',
      resolved_at: '2024-01-15 16:45:00',
      response_time: '2小時15分鐘'
    },
    {
      id: 2,
      subject: '系統效能優化建議',
      priority: 'medium',
      status: 'in_progress',
      contact_method: 'teams',
      created_at: '2024-01-14 09:15:00',
      resolved_at: null,
      response_time: null
    },
    {
      id: 3,
      subject: '新功能需求討論',
      priority: 'low',
      status: 'pending',
      contact_method: 'email',
      created_at: '2024-01-13 11:20:00',
      resolved_at: null,
      response_time: null
    }
  ]);

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    form.setFieldsValue(contact);
    setEditModalVisible(true);
  };

  const handleSaveContact = async (values) => {
    try {
      // 這裡應該調用 API 儲存聯絡資訊
      message.success('聯絡資訊更新成功');
      setEditModalVisible(false);
    } catch (error) {
      message.error('儲存失敗');
    }
  };

  const handleSubmitContact = async (values) => {
    setLoading(true);
    try {
      // 模擬發送聯絡訊息
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 根據選擇的聯絡方式發送訊息
      if (values.contact_method === 'teams') {
        // 發送到 Teams
        message.success('聯絡訊息已發送到 Teams 頻道');
      } else if (values.contact_method === 'email') {
        // 發送到 Email
        message.success('聯絡訊息已發送到指定 Email');
      }

      // 新增到聯絡記錄
      const newContact = {
        id: contactHistory.length + 1,
        subject: values.subject,
        priority: values.priority,
        status: 'pending',
        contact_method: values.contact_method,
        created_at: new Date().toLocaleString(),
        resolved_at: null,
        response_time: null
      };
      setContactHistory([newContact, ...contactHistory]);

      setContactModalVisible(false);
      contactForm.resetFields();
    } catch (error) {
      message.error('發送失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const slaColumns = [
    {
      title: '等級',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Tag color={
          level.includes('P1') ? 'red' : 
          level.includes('P2') ? 'orange' : 
          level.includes('P3') ? 'yellow' : 'green'
        }>
          {level}
        </Tag>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '回應時間',
      dataIndex: 'response_time',
      key: 'response_time'
    },
    {
      title: '解決時間',
      dataIndex: 'resolution_time',
      key: 'resolution_time'
    },
    {
      title: '範例',
      dataIndex: 'examples',
      key: 'examples',
      render: (examples) => (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {examples.map((example, index) => (
            <li key={index}>{example}</li>
          ))}
        </ul>
      )
    }
  ];

  const contactHistoryColumns = [
    {
      title: '主旨',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: '優先級',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={
          priority === 'high' ? 'red' : 
          priority === 'medium' ? 'orange' : 'green'
        }>
          {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
        </Tag>
      )
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={
            status === 'resolved' ? 'success' : 
            status === 'in_progress' ? 'processing' : 'default'
          } 
          text={
            status === 'resolved' ? '已解決' : 
            status === 'in_progress' ? '處理中' : '待處理'
          }
        />
      )
    },
    {
      title: '聯絡方式',
      dataIndex: 'contact_method',
      key: 'contact_method',
      render: (method) => (
        <Tag color={method === 'teams' ? 'blue' : 'green'}>
          {method === 'teams' ? 'Teams' : 'Email'}
        </Tag>
      )
    },
    {
      title: '建立時間',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '回應時間',
      dataIndex: 'response_time',
      key: 'response_time',
      render: (time) => time || '-'
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <TeamOutlined /> 系統維運聯絡
      </Title>

      <Row gutter={[16, 16]}>
        {/* 聯絡區塊 */}
        <Col span={24}>
          <Card 
            title={
              <Space>
                <MessageOutlined />
                聯絡我們
              </Space>
            }
            extra={
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                onClick={() => setContactModalVisible(true)}
              >
                發送聯絡訊息
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card size="small" title="技術支援" style={{ borderColor: '#1890ff' }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="電話">
                      <PhoneOutlined /> {contactInfo.technical_support.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="電子郵件">
                      <MailOutlined /> {contactInfo.technical_support.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="服務時間">
                      <ClockCircleOutlined /> {contactInfo.technical_support.hours}
                    </Descriptions.Item>
                    <Descriptions.Item label="回應時間">
                      {contactInfo.technical_support.response_time}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="緊急支援" style={{ borderColor: '#f5222d' }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="電話">
                      <PhoneOutlined /> {contactInfo.emergency_support.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="電子郵件">
                      <MailOutlined /> {contactInfo.emergency_support.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="服務時間">
                      <ClockCircleOutlined /> {contactInfo.emergency_support.hours}
                    </Descriptions.Item>
                    <Descriptions.Item label="回應時間">
                      {contactInfo.emergency_support.response_time}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="銷售諮詢" style={{ borderColor: '#52c41a' }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="電話">
                      <PhoneOutlined /> {contactInfo.sales_inquiry.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="電子郵件">
                      <MailOutlined /> {contactInfo.sales_inquiry.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="服務時間">
                      <ClockCircleOutlined /> {contactInfo.sales_inquiry.hours}
                    </Descriptions.Item>
                    <Descriptions.Item label="回應時間">
                      {contactInfo.sales_inquiry.response_time}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 聯絡記錄 */}
        <Col span={24}>
          <Card title="聯絡記錄">
            <Table
              dataSource={contactHistory}
              columns={contactHistoryColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>

        {/* 支援團隊 */}
        <Col span={24}>
          <Card title="支援團隊">
            <List
              itemLayout="horizontal"
              dataSource={supportTeam}
              renderItem={(item) => (
                <List.Item
                  actions={editMode ? [
                    <Button type="link" icon={<EditOutlined />}>編輯</Button>,
                    <Button type="link" danger icon={<DeleteOutlined />}>刪除</Button>
                  ] : []}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={item.name}
                    description={
                      <Space direction="vertical" size="small">
                        <Text strong>{item.role}</Text>
                        <Space>
                          <PhoneOutlined /> {item.phone}
                          <MailOutlined /> {item.email}
                        </Space>
                        <Space>
                          <Text type="secondary">專長：</Text>
                          {item.expertise.map((skill, index) => (
                            <Tag key={index} color="blue">{skill}</Tag>
                          ))}
                        </Space>
                        <Text type="secondary">
                          <ClockCircleOutlined /> {item.availability}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 服務等級協議 */}
        <Col span={24}>
          <Card title="服務等級協議 (SLA)">
            <Table
              dataSource={slaData}
              columns={slaColumns}
              rowKey="level"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>

        {/* 常見問題解決方案 */}
        <Col span={24}>
          <Card title="常見問題解決方案">
            <Collapse defaultActiveKey={['1']}>
              {solutions.map((solution) => (
                <Collapse.Panel 
                  header={solution.title} 
                  key={solution.id}
                  extra={
                    editMode && (
                      <Space>
                        <Button type="link" size="small" icon={<EditOutlined />}>
                          編輯
                        </Button>
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                          刪除
                        </Button>
                      </Space>
                    )
                  }
                >
                  <Paragraph><Text strong>問題描述：</Text> {solution.description}</Paragraph>
                  <Paragraph><Text strong>解決方案：</Text> {solution.solution}</Paragraph>
                  <Paragraph><Text strong>解決步驟：</Text></Paragraph>
                  <Steps direction="vertical" size="small">
                    {solution.steps.map((step, index) => (
                      <Steps.Step key={index} title={step} />
                    ))}
                  </Steps>
                  <Tag color="blue">{solution.category}</Tag>
                </Collapse.Panel>
              ))}
            </Collapse>
          </Card>
        </Col>
      </Row>

      {/* 聯絡訊息模態框 */}
      <Modal
        title="發送聯絡訊息"
        open={contactModalVisible}
        onCancel={() => setContactModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={contactForm}
          onFinish={handleSubmitContact}
          layout="vertical"
        >
          <Form.Item
            label="聯絡方式"
            name="contact_method"
            rules={[{ required: true, message: '請選擇聯絡方式' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="teams">
                  <Space>
                    <SkypeOutlined />
                    Microsoft Teams
                  </Space>
                </Radio>
                <Radio value="email">
                  <Space>
                    <MailOutlined />
                    Email
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="優先級"
            name="priority"
            rules={[{ required: true, message: '請選擇優先級' }]}
          >
            <Radio.Group>
              <Radio value="low">低</Radio>
              <Radio value="medium">中</Radio>
              <Radio value="high">高</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="主旨"
            name="subject"
            rules={[{ required: true, message: '請輸入主旨' }]}
          >
            <Input placeholder="請輸入聯絡主旨" />
          </Form.Item>

          <Form.Item
            label="聯絡人"
            name="contact_person"
            rules={[{ required: true, message: '請輸入聯絡人姓名' }]}
          >
            <Input placeholder="請輸入聯絡人姓名" />
          </Form.Item>

          <Form.Item
            label="聯絡電話"
            name="contact_phone"
          >
            <Input placeholder="請輸入聯絡電話" />
          </Form.Item>

          <Form.Item
            label="電子郵件"
            name="contact_email"
            rules={[{ required: true, message: '請輸入電子郵件' }]}
          >
            <Input placeholder="請輸入電子郵件" />
          </Form.Item>

          <Form.Item
            label="問題描述"
            name="description"
            rules={[{ required: true, message: '請輸入問題描述' }]}
          >
            <TextArea rows={4} placeholder="請詳細描述您的問題或需求" />
          </Form.Item>

          <Form.Item
            label="期望回應時間"
            name="expected_response"
          >
            <Select placeholder="請選擇期望回應時間">
              <Option value="urgent">緊急 (2小時內)</Option>
              <Option value="normal">一般 (24小時內)</Option>
              <Option value="flexible">彈性 (72小時內)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="附件"
            name="attachments"
          >
            <Upload
              listType="text"
              maxCount={5}
              beforeUpload={() => false}
            >
              <Button icon={<PaperClipOutlined />}>上傳附件</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SendOutlined />}
              >
                發送訊息
              </Button>
              <Button onClick={() => setContactModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 編輯模態框 */}
      <Modal
        title="編輯聯絡資訊"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          onFinish={handleSaveContact}
          layout="vertical"
        >
          <Form.Item
            label="聯絡類型"
            name="type"
            rules={[{ required: true, message: '請選擇聯絡類型' }]}
          >
            <Select placeholder="請選擇聯絡類型">
              <Option value="technical_support">技術支援</Option>
              <Option value="emergency_support">緊急支援</Option>
              <Option value="sales_inquiry">銷售諮詢</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="電話"
            name="phone"
            rules={[{ required: true, message: '請輸入電話號碼' }]}
          >
            <Input placeholder="請輸入電話號碼" />
          </Form.Item>
          <Form.Item
            label="電子郵件"
            name="email"
            rules={[{ required: true, message: '請輸入電子郵件' }]}
          >
            <Input placeholder="請輸入電子郵件" />
          </Form.Item>
          <Form.Item
            label="服務時間"
            name="hours"
            rules={[{ required: true, message: '請輸入服務時間' }]}
          >
            <Input placeholder="例如：週一至週五 9:00-18:00" />
          </Form.Item>
          <Form.Item
            label="回應時間"
            name="response_time"
            rules={[{ required: true, message: '請輸入回應時間' }]}
          >
            <Input placeholder="例如：4小時內" />
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

export default SystemSupport; 