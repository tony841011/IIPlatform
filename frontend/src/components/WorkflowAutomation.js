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
  Steps,
  Timeline,
  Typography,
  Divider
} from 'antd';
import {
  BranchesOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Step } = Steps;

const WorkflowAutomation = () => {
  const [workflows, setWorkflows] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchWorkflows();
    fetchExecutions();
    fetchDevices();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await axios.get('http://localhost:8000/workflows/');
      setWorkflows(response.data);
    } catch (error) {
      message.error('獲取工作流程列表失敗');
    }
  };

  const fetchExecutions = async () => {
    try {
      // 這裡應該調用獲取工作流程執行的 API
      setExecutions([]);
    } catch (error) {
      console.log('獲取執行記錄失敗');
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

  const createWorkflow = async (values) => {
    try {
      setLoading(true);
      
      // 構建觸發條件
      const triggerConditions = {};
      if (values.trigger_type === 'event') {
        triggerConditions.event_type = values.event_type;
        triggerConditions.device_id = values.trigger_device_id;
      } else if (values.trigger_type === 'schedule') {
        triggerConditions.cron_expression = values.cron_expression;
      }
      
      // 構建工作流程步驟
      const steps = [];
      if (values.step1_action) {
        steps.push({
          step: 1,
          action: values.step1_action,
          params: values.step1_params ? JSON.parse(values.step1_params) : {}
        });
      }
      if (values.step2_action) {
        steps.push({
          step: 2,
          action: values.step2_action,
          params: values.step2_params ? JSON.parse(values.step2_params) : {}
        });
      }
      if (values.step3_action) {
        steps.push({
          step: 3,
          action: values.step3_action,
          params: values.step3_params ? JSON.parse(values.step3_params) : {}
        });
      }
      
      const workflowData = {
        name: values.name,
        description: values.description,
        trigger_type: values.trigger_type,
        trigger_conditions: triggerConditions,
        steps: steps
      };
      
      await axios.post('http://localhost:8000/workflows/', workflowData);
      message.success('工作流程創建成功');
      setModalVisible(false);
      form.resetFields();
      fetchWorkflows();
    } catch (error) {
      message.error('工作流程創建失敗');
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId) => {
    try {
      await axios.post(`http://localhost:8000/workflows/${workflowId}/execute`);
      message.success('工作流程執行成功');
      fetchExecutions();
    } catch (error) {
      message.error('工作流程執行失敗');
    }
  };

  const getTriggerTypeText = (type) => {
    switch (type) {
      case 'event': return '事件觸發';
      case 'schedule': return '排程觸發';
      case 'manual': return '手動觸發';
      default: return type;
    }
  };

  const getTriggerColor = (type) => {
    switch (type) {
      case 'event': return 'blue';
      case 'schedule': return 'green';
      case 'manual': return 'orange';
      default: return 'default';
    }
  };

  const getExecutionStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'running': return 'blue';
      default: return 'default';
    }
  };

  const workflowColumns = [
    {
      title: '工作流程名稱',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '觸發類型',
      dataIndex: 'trigger_type',
      key: 'trigger_type',
      render: (type) => (
        <Tag color={getTriggerColor(type)}>
          {getTriggerTypeText(type)}
        </Tag>
      ),
    },
    {
      title: '步驟數',
      key: 'steps_count',
      render: (_, record) => record.steps?.length || 0,
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
            icon={<PlayCircleOutlined />}
            onClick={() => executeWorkflow(record.id)}
          >
            執行
          </Button>
          <Button size="small" icon={<EyeOutlined />}>
            查看
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

  const executionColumns = [
    {
      title: '工作流程',
      dataIndex: 'workflow_id',
      key: 'workflow_id',
      render: (workflowId) => {
        const workflow = workflows.find(w => w.id === workflowId);
        return workflow ? workflow.name : `工作流程 ${workflowId}`;
      }
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getExecutionStatusColor(status)}>
          {status === 'completed' ? '已完成' : 
           status === 'failed' ? '失敗' : 
           status === 'running' ? '執行中' : status}
        </Tag>
      ),
    },
    {
      title: '開始時間',
      dataIndex: 'started_at',
      key: 'started_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '完成時間',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="工作流程概覽" extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新增工作流程
            </Button>
          }>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="總工作流程"
                  value={workflows.length}
                  prefix={<BranchesOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="啟用工作流程"
                  value={workflows.filter(w => w.is_active).length}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="今日執行"
                  value={Math.floor(Math.random() * 20)}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="成功執行"
                  value={Math.floor(Math.random() * 15)}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="工作流程列表">
            <Table
              dataSource={workflows}
              columns={workflowColumns}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="執行記錄">
            <Table
              dataSource={executions}
              columns={executionColumns}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="新增工作流程"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Form
          form={form}
          onFinish={createWorkflow}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="工作流程名稱"
                name="name"
                rules={[{ required: true, message: '請輸入工作流程名稱' }]}
              >
                <Input placeholder="例如: 設備維護流程" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="描述"
                name="description"
              >
                <Input placeholder="工作流程描述" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="觸發類型"
                name="trigger_type"
                rules={[{ required: true, message: '請選擇觸發類型' }]}
              >
                <Select placeholder="選擇觸發類型">
                  <Option value="event">事件觸發</Option>
                  <Option value="schedule">排程觸發</Option>
                  <Option value="manual">手動觸發</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="事件類型"
                name="event_type"
              >
                <Select placeholder="選擇事件類型">
                  <Option value="device_alert">設備告警</Option>
                  <Option value="device_maintenance">設備維護</Option>
                  <Option value="data_anomaly">數據異常</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="觸發設備"
                name="trigger_device_id"
              >
                <Select placeholder="選擇觸發設備">
                  {devices.map(device => (
                    <Option key={device.id} value={device.id}>
                      {device.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="排程表達式"
                name="cron_expression"
              >
                <Input placeholder="例如: 0 0 * * *" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>步驟配置</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="步驟 1 動作"
                name="step1_action"
              >
                <Select placeholder="選擇動作">
                  <Option value="send_notification">發送通知</Option>
                  <Option value="create_ticket">創建工單</Option>
                  <Option value="update_device_status">更新設備狀態</Option>
                  <Option value="send_email">發送郵件</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                label="步驟 1 參數"
                name="step1_params"
              >
                <TextArea rows={2} placeholder='{"type": "email", "to": "admin@company.com"}' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="步驟 2 動作"
                name="step2_action"
              >
                <Select placeholder="選擇動作">
                  <Option value="send_notification">發送通知</Option>
                  <Option value="create_ticket">創建工單</Option>
                  <Option value="update_device_status">更新設備狀態</Option>
                  <Option value="send_email">發送郵件</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                label="步驟 2 參數"
                name="step2_params"
              >
                <TextArea rows={2} placeholder='{"priority": "high"}' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="步驟 3 動作"
                name="step3_action"
              >
                <Select placeholder="選擇動作">
                  <Option value="send_notification">發送通知</Option>
                  <Option value="create_ticket">創建工單</Option>
                  <Option value="update_device_status">更新設備狀態</Option>
                  <Option value="send_email">發送郵件</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                label="步驟 3 參數"
                name="step3_params"
              >
                <TextArea rows={2} placeholder='{"status": "maintenance"}' />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                創建工作流程
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

export default WorkflowAutomation; 