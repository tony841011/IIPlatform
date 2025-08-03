import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Spin,
  Alert,
  Progress,
  Tag,
  Tooltip,
  Timeline,
  Descriptions,
  Divider,
  List,
  Avatar,
  Steps,
  Badge,
  Popconfirm,
  Drawer,
  Tabs,
  Upload,
  DatePicker,
  Switch,
  Slider,
  Statistic,
  Checkbox,
  Radio,
  TimePicker
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  SettingOutlined,
  HistoryOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
  MailOutlined,
  ScheduleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  TeamOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Step } = Steps;
const { TabPane } = Tabs;

const ReportingSystem = () => {
  const [loading, setLoading] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [templateForm] = Form.useForm();
  const [scheduleForm] = Form.useForm();

  // 報表模板數據
  const [reportTemplates, setReportTemplates] = useState([
    {
      id: 1,
      name: '設備效能月報',
      description: '每月設備效能與維護狀況報告',
      category: 'performance',
      frequency: 'monthly',
      format: ['pdf', 'excel'],
      metrics: ['uptime', 'efficiency', 'maintenance'],
      time_range: 'last_month',
      recipients: ['management@company.com', 'tech-team@company.com'],
      is_active: true,
      created_at: '2024-01-10 10:00:00',
      last_generated: '2024-01-01 09:00:00',
      next_generation: '2024-02-01 09:00:00'
    },
    {
      id: 2,
      name: 'AI 分析週報',
      description: 'AI 模型效能與預測結果週報',
      category: 'ai_analysis',
      frequency: 'weekly',
      format: ['pdf', 'excel'],
      metrics: ['accuracy', 'predictions', 'anomalies'],
      time_range: 'last_week',
      recipients: ['ai-team@company.com', 'data-science@company.com'],
      is_active: true,
      created_at: '2024-01-12 14:30:00',
      last_generated: '2024-01-15 09:00:00',
      next_generation: '2024-01-22 09:00:00'
    },
    {
      id: 3,
      name: '告警統計日報',
      description: '每日告警統計與處理狀況報告',
      category: 'alerts',
      frequency: 'daily',
      format: ['pdf'],
      metrics: ['alert_count', 'response_time', 'resolution_rate'],
      time_range: 'last_day',
      recipients: ['operations@company.com'],
      is_active: true,
      created_at: '2024-01-15 09:15:00',
      last_generated: '2024-01-15 09:00:00',
      next_generation: '2024-01-16 09:00:00'
    }
  ]);

  // 報表歷史
  const [reportHistory, setReportHistory] = useState([
    {
      id: 1,
      template_name: '設備效能月報',
      generated_at: '2024-01-01 09:00:00',
      status: 'completed',
      file_size: '2.5 MB',
      format: 'pdf',
      recipients: 5,
      download_count: 3,
      generation_time: '45秒'
    },
    {
      id: 2,
      template_name: 'AI 分析週報',
      generated_at: '2024-01-15 09:00:00',
      status: 'completed',
      file_size: '1.8 MB',
      format: 'excel',
      recipients: 3,
      download_count: 2,
      generation_time: '30秒'
    },
    {
      id: 3,
      template_name: '告警統計日報',
      generated_at: '2024-01-15 09:00:00',
      status: 'in_progress',
      file_size: null,
      format: 'pdf',
      recipients: 2,
      download_count: 0,
      generation_time: null
    }
  ]);

  // 報表統計
  const [reportStats, setReportStats] = useState({
    total_templates: 3,
    active_templates: 3,
    total_reports: 1250,
    this_month_reports: 45,
    total_downloads: 890,
    avg_generation_time: '35秒',
    success_rate: 98.5
  });

  const handleCreateTemplate = async (values) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTemplate = {
        id: reportTemplates.length + 1,
        ...values,
        is_active: true,
        created_at: new Date().toLocaleString(),
        last_generated: null,
        next_generation: null
      };
      
      setReportTemplates([newTemplate, ...reportTemplates]);
      message.success('報表模板創建成功');
      setTemplateModalVisible(false);
      templateForm.resetFields();
    } catch (error) {
      message.error('創建失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleReport = async (values) => {
    try {
      setLoading(true);
      // 模擬排程設定
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      message.success('報表排程設定成功');
      setScheduleModalVisible(false);
      scheduleForm.resetFields();
    } catch (error) {
      message.error('設定失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (templateId) => {
    try {
      setLoading(true);
      // 模擬報表生成
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      message.success('報表生成成功');
    } catch (error) {
      message.error('生成失敗');
    } finally {
      setLoading(false);
    }
  };

  const templateColumns = [
    {
      title: '模板名稱',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space direction="vertical">
          <Text strong>{name}</Text>
          <Text type="secondary">{record.description}</Text>
        </Space>
      )
    },
    {
      title: '類別',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        const categoryNames = {
          performance: '效能',
          ai_analysis: 'AI 分析',
          alerts: '告警',
          maintenance: '維護',
          energy: '能源'
        };
        return <Tag color="blue">{categoryNames[category]}</Tag>;
      }
    },
    {
      title: '頻率',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (frequency) => {
        const frequencyNames = {
          daily: '每日',
          weekly: '每週',
          monthly: '每月',
          quarterly: '每季',
          yearly: '每年'
        };
        return <Tag color="green">{frequencyNames[frequency]}</Tag>;
      }
    },
    {
      title: '格式',
      dataIndex: 'format',
      key: 'format',
      render: (formats) => (
        <Space>
          {formats.map(format => (
            <Tag key={format} color="orange">{format.toUpperCase()}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Switch checked={active} size="small" />
      )
    },
    {
      title: '最後生成',
      dataIndex: 'last_generated',
      key: 'last_generated',
      render: (time) => time || '-'
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<FileTextOutlined />}
            onClick={() => handleGenerateReport(record.id)}
          >
            生成
          </Button>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => setSelectedReport(record)}
          >
            預覽
          </Button>
          <Button 
            size="small" 
            icon={<EditOutlined />}
          >
            編輯
          </Button>
          <Button 
            size="small" 
            icon={<ScheduleOutlined />}
            onClick={() => setScheduleModalVisible(true)}
          >
            排程
          </Button>
        </Space>
      )
    }
  ];

  const historyColumns = [
    {
      title: '模板名稱',
      dataIndex: 'template_name',
      key: 'template_name'
    },
    {
      title: '生成時間',
      dataIndex: 'generated_at',
      key: 'generated_at'
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' : 
          status === 'in_progress' ? 'orange' : 'red'
        }>
          {status === 'completed' ? '已完成' : 
           status === 'in_progress' ? '生成中' : '失敗'}
        </Tag>
      )
    },
    {
      title: '檔案大小',
      dataIndex: 'file_size',
      key: 'file_size',
      render: (size) => size || '-'
    },
    {
      title: '格式',
      dataIndex: 'format',
      key: 'format',
      render: (format) => (
        <Tag color="blue">{format.toUpperCase()}</Tag>
      )
    },
    {
      title: '下載次數',
      dataIndex: 'download_count',
      key: 'download_count'
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<DownloadOutlined />}
            disabled={record.status !== 'completed'}
          >
            下載
          </Button>
          <Button 
            size="small" 
            icon={<MailOutlined />}
          >
            寄送
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <FileTextOutlined /> 報表系統
      </Title>

      <Row gutter={[16, 16]}>
        {/* 報表統計 */}
        <Col span={24}>
          <Card title="報表統計概覽">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="總模板數"
                  value={reportStats.total_templates}
                  prefix={<FileTextOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="本月報表"
                  value={reportStats.this_month_reports}
                  prefix={<CalendarOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="總下載數"
                  value={reportStats.total_downloads}
                  prefix={<DownloadOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="成功率"
                  value={reportStats.success_rate}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 報表模板 */}
        <Col span={24}>
          <Card 
            title="報表模板"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setTemplateModalVisible(true)}
              >
                新增模板
              </Button>
            }
          >
            <Table
              dataSource={reportTemplates}
              columns={templateColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>

        {/* 報表歷史 */}
        <Col span={24}>
          <Card title="報表歷史">
            <Table
              dataSource={reportHistory}
              columns={historyColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 新增模板模態框 */}
      <Modal
        title="新增報表模板"
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={templateForm}
          onFinish={handleCreateTemplate}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="模板名稱"
                name="name"
                rules={[{ required: true, message: '請輸入模板名稱' }]}
              >
                <Input placeholder="請輸入模板名稱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="類別"
                name="category"
                rules={[{ required: true, message: '請選擇類別' }]}
              >
                <Select placeholder="請選擇類別">
                  <Option value="performance">效能</Option>
                  <Option value="ai_analysis">AI 分析</Option>
                  <Option value="alerts">告警</Option>
                  <Option value="maintenance">維護</Option>
                  <Option value="energy">能源</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '請輸入描述' }]}
          >
            <TextArea rows={3} placeholder="請輸入模板描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="生成頻率"
                name="frequency"
                rules={[{ required: true, message: '請選擇頻率' }]}
              >
                <Select placeholder="請選擇頻率">
                  <Option value="daily">每日</Option>
                  <Option value="weekly">每週</Option>
                  <Option value="monthly">每月</Option>
                  <Option value="quarterly">每季</Option>
                  <Option value="yearly">每年</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="時間範圍"
                name="time_range"
                rules={[{ required: true, message: '請選擇時間範圍' }]}
              >
                <Select placeholder="請選擇時間範圍">
                  <Option value="last_day">最近一天</Option>
                  <Option value="last_week">最近一週</Option>
                  <Option value="last_month">最近一個月</Option>
                  <Option value="last_quarter">最近一季</Option>
                  <Option value="last_year">最近一年</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="包含指標"
            name="metrics"
            rules={[{ required: true, message: '請選擇指標' }]}
          >
            <Checkbox.Group>
              <Row>
                <Col span={8}>
                  <Checkbox value="uptime">設備運行時間</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="efficiency">效能指標</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="maintenance">維護記錄</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="alerts">告警統計</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="ai_predictions">AI 預測</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="energy_consumption">能源消耗</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item
            label="輸出格式"
            name="format"
            rules={[{ required: true, message: '請選擇輸出格式' }]}
          >
            <Checkbox.Group>
              <Checkbox value="pdf">PDF</Checkbox>
              <Checkbox value="excel">Excel</Checkbox>
              <Checkbox value="csv">CSV</Checkbox>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item
            label="收件人"
            name="recipients"
            rules={[{ required: true, message: '請輸入收件人' }]}
          >
            <Select
              mode="tags"
              placeholder="請輸入收件人 Email"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
              >
                創建模板
              </Button>
              <Button onClick={() => setTemplateModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 排程設定模態框 */}
      <Modal
        title="報表排程設定"
        open={scheduleModalVisible}
        onCancel={() => setScheduleModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={scheduleForm}
          onFinish={handleScheduleReport}
          layout="vertical"
        >
          <Form.Item
            label="選擇模板"
            name="template_id"
            rules={[{ required: true, message: '請選擇模板' }]}
          >
            <Select placeholder="請選擇要排程的模板">
              {reportTemplates.map(template => (
                <Option key={template.id} value={template.id}>
                  {template.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="生成時間"
            name="generation_time"
            rules={[{ required: true, message: '請選擇生成時間' }]}
          >
            <TimePicker format="HH:mm" placeholder="請選擇時間" />
          </Form.Item>

          <Form.Item
            label="自動寄送"
            name="auto_send"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
              >
                設定排程
              </Button>
              <Button onClick={() => setScheduleModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 報表預覽抽屜 */}
      <Drawer
        title="報表預覽"
        placement="right"
        width={800}
        open={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
      >
        {selectedReport && (
          <div>
            <Descriptions title="模板資訊" column={1}>
              <Descriptions.Item label="模板名稱">{selectedReport.name}</Descriptions.Item>
              <Descriptions.Item label="描述">{selectedReport.description}</Descriptions.Item>
              <Descriptions.Item label="類別">{selectedReport.category}</Descriptions.Item>
              <Descriptions.Item label="頻率">{selectedReport.frequency}</Descriptions.Item>
              <Descriptions.Item label="格式">
                {selectedReport.format.map(f => f.toUpperCase()).join(', ')}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="指標配置" column={1}>
              <Descriptions.Item label="包含指標">
                {selectedReport.metrics.map(metric => (
                  <Tag key={metric} color="blue">{metric}</Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="時間範圍">{selectedReport.time_range}</Descriptions.Item>
              <Descriptions.Item label="收件人">
                {selectedReport.recipients.map(email => (
                  <Tag key={email} color="green">{email}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">報表預覽功能開發中...</Text>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ReportingSystem; 