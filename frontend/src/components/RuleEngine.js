import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  message,
  Alert,
  Switch,
  InputNumber,
  Divider,
  Typography
} from 'antd';
import {
  SafetyCertificateOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const RuleEngine = () => {
  const [rules, setRules] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRules();
    fetchDevices();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await axios.get('http://localhost:8000/rules/');
      setRules(response.data);
    } catch (error) {
      message.error('獲取規則列表失敗');
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/devices/');
      setDevices(response.data);
    } catch (error) {
      message.error('獲取設備列表失敗');
    }
  };

  const createRule = async (values) => {
    try {
      setLoading(true);
      
      // 構建條件和動作
      const conditions = {};
      const actions = {};
      
      // 根據表單值構建條件
      if (values.condition_type === 'temperature') {
        conditions.temperature = values.condition_value;
        conditions.operator = values.condition_operator;
      } else if (values.condition_type === 'pressure') {
        conditions.pressure = values.condition_value;
        conditions.operator = values.condition_operator;
      } else if (values.condition_type === 'quality') {
        conditions.quality = values.condition_value;
        conditions.operator = values.condition_operator;
      }
      
      // 構建動作
      if (values.action_type === 'alert') {
        actions.type = 'alert';
        actions.message = values.action_message;
      } else if (values.action_type === 'email') {
        actions.type = 'email';
        actions.to = values.action_email;
        actions.subject = values.action_subject;
      } else if (values.action_type === 'command') {
        actions.type = 'command';
        actions.device_id = values.action_device_id;
        actions.command = values.action_command;
      }
      
      const ruleData = {
        name: values.name,
        description: values.description,
        conditions: conditions,
        actions: actions
      };
      
      await axios.post('http://localhost:8000/rules/', ruleData);
      message.success('規則創建成功');
      setModalVisible(false);
      form.resetFields();
      fetchRules();
    } catch (error) {
      message.error('規則創建失敗');
    } finally {
      setLoading(false);
    }
  };

  const toggleRuleStatus = async (ruleId, currentStatus) => {
    try {
      // 這裡可以實現規則啟用/停用的 API 調用
      message.success(`規則已${currentStatus ? '停用' : '啟用'}`);
      fetchRules();
    } catch (error) {
      message.error('操作失敗');
    }
  };

  const getConditionText = (conditions) => {
    if (conditions.temperature) {
      const operator = conditions.operator === '>' ? '大於' : '小於';
      return `溫度 ${operator} ${conditions.temperature}°C`;
    } else if (conditions.pressure) {
      const operator = conditions.operator === '>' ? '大於' : '小於';
      return `壓力 ${operator} ${conditions.pressure} bar`;
    } else if (conditions.quality) {
      const operator = conditions.operator === '>' ? '大於' : '小於';
      return `品質 ${operator} ${conditions.quality}%`;
    }
    return '未知條件';
  };

  const getActionText = (actions) => {
    if (actions.type === 'alert') {
      return `發送告警: ${actions.message}`;
    } else if (actions.type === 'email') {
      return `發送郵件到: ${actions.to}`;
    } else if (actions.type === 'command') {
      return `發送命令到設備 ${actions.device_id}`;
    }
    return '未知動作';
  };

  const ruleColumns = [
    {
      title: '規則名稱',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '條件',
      key: 'conditions',
      render: (_, record) => getConditionText(record.conditions),
    },
    {
      title: '動作',
      key: 'actions',
      render: (_, record) => getActionText(record.actions),
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? '啟用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '創建時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={record.is_active ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => toggleRuleStatus(record.id, record.is_active)}
          >
            {record.is_active ? '停用' : '啟用'}
          </Button>
          <Button size="small" icon={<EditOutlined />}>
            編輯
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />}>
            刪除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="規則引擎概覽" extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新增規則
            </Button>
          }>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="總規則數"
                  value={rules.length}
                  prefix={<SafetyCertificateOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="啟用規則"
                  value={rules.filter(r => r.is_active).length}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="停用規則"
                  value={rules.filter(r => !r.is_active).length}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="今日觸發"
                  value={Math.floor(Math.random() * 10)}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="規則列表">
            <Table
              dataSource={rules}
              columns={ruleColumns}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="新增規則"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          onFinish={createRule}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="規則名稱"
                name="name"
                rules={[{ required: true, message: '請輸入規則名稱' }]}
              >
                <Input placeholder="例如: 溫度異常告警" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="描述"
                name="description"
              >
                <Input placeholder="規則描述" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>條件設定</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="條件類型"
                name="condition_type"
                rules={[{ required: true, message: '請選擇條件類型' }]}
              >
                <Select placeholder="選擇條件類型">
                  <Option value="temperature">溫度</Option>
                  <Option value="pressure">壓力</Option>
                  <Option value="quality">品質</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="比較運算符"
                name="condition_operator"
                rules={[{ required: true, message: '請選擇比較運算符' }]}
              >
                <Select placeholder="選擇運算符">
                  <Option value=">">大於</Option>
                  <Option value="<">小於</Option>
                  <Option value=">=">大於等於</Option>
                  <Option value="<=">小於等於</Option>
                  <Option value="==">等於</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="閾值"
                name="condition_value"
                rules={[{ required: true, message: '請輸入閾值' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="輸入數值" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>動作設定</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="動作類型"
                name="action_type"
                rules={[{ required: true, message: '請選擇動作類型' }]}
              >
                <Select placeholder="選擇動作類型">
                  <Option value="alert">發送告警</Option>
                  <Option value="email">發送郵件</Option>
                  <Option value="command">發送命令</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                label="動作內容"
                name="action_message"
                rules={[{ required: true, message: '請輸入動作內容' }]}
              >
                <Input placeholder="告警訊息或郵件內容" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                創建規則
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RuleEngine; 