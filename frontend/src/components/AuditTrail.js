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
  DatePicker,
  Timeline,
  Typography,
  Descriptions
} from 'antd';
import {
  AuditOutlined,
  SearchOutlined,
  EyeOutlined,
  DownloadOutlined,
  UserOutlined,
  ApiOutlined,
  SettingOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const AuditTrail = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchForm] = Form.useForm();

  useEffect(() => {
    fetchAuditLogs();
    fetchUsers();
  }, []);

  const fetchAuditLogs = async (params = {}) => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/audit-logs/', { params });
      setAuditLogs(response.data);
    } catch (error) {
      message.error('獲取審計日誌失敗');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/users/');
      setUsers(response.data);
    } catch (error) {
      console.log('獲取用戶列表失敗');
    }
  };

  const handleSearch = (values) => {
    const params = {};
    if (values.user_id) params.user_id = values.user_id;
    if (values.resource_type) params.resource_type = values.resource_type;
    if (values.action) params.action = values.action;
    if (values.date_range) {
      params.start_date = values.date_range[0].format('YYYY-MM-DD');
      params.end_date = values.date_range[1].format('YYYY-MM-DD');
    }
    fetchAuditLogs(params);
  };

  const exportLogs = () => {
    message.success('審計日誌匯出功能開發中');
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'login': return 'green';
      case 'logout': return 'blue';
      case 'create': return 'green';
      case 'update': return 'orange';
      case 'delete': return 'red';
      case 'control': return 'purple';
      default: return 'default';
    }
  };

  const getResourceTypeColor = (type) => {
    switch (type) {
      case 'device': return 'blue';
      case 'user': return 'green';
      case 'rule': return 'orange';
      case 'workflow': return 'purple';
      case 'api': return 'cyan';
      default: return 'default';
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'login': return '登入';
      case 'logout': return '登出';
      case 'create': return '創建';
      case 'update': return '更新';
      case 'delete': return '刪除';
      case 'control': return '控制';
      default: return action;
    }
  };

  const getResourceTypeText = (type) => {
    switch (type) {
      case 'device': return '設備';
      case 'user': return '用戶';
      case 'rule': return '規則';
      case 'workflow': return '工作流程';
      case 'api': return 'API';
      default: return type;
    }
  };

  const auditColumns = [
    {
      title: '時間',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time) => new Date(time).toLocaleString(),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: '用戶',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.username : `用戶 ${userId}`;
      }
    },
    {
      title: '動作',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={getActionColor(action)}>
          {getActionText(action)}
        </Tag>
      ),
    },
    {
      title: '資源類型',
      dataIndex: 'resource_type',
      key: 'resource_type',
      render: (type) => (
        <Tag color={getResourceTypeColor(type)}>
          {getResourceTypeText(type)}
        </Tag>
      ),
    },
    {
      title: '資源ID',
      dataIndex: 'resource_id',
      key: 'resource_id',
      render: (id) => id || '-',
    },
    {
      title: 'IP 地址',
      dataIndex: 'ip_address',
      key: 'ip_address',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedLog(record);
            setModalVisible(true);
          }}
        >
          查看詳情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="審計日誌概覽" extra={
            <Space>
              <Button icon={<DownloadOutlined />} onClick={exportLogs}>
                匯出日誌
              </Button>
              <Button type="primary" icon={<SearchOutlined />} onClick={() => searchForm.submit()}>
                搜尋
              </Button>
            </Space>
          }>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="總日誌數"
                  value={auditLogs.length}
                  prefix={<AuditOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="今日操作"
                  value={auditLogs.filter(log => {
                    const today = new Date().toDateString();
                    return new Date(log.timestamp).toDateString() === today;
                  }).length}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="活躍用戶"
                  value={new Set(auditLogs.map(log => log.user_id)).size}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="系統操作"
                  value={auditLogs.filter(log => log.resource_type === 'api').length}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="搜尋條件">
            <Form
              form={searchForm}
              onFinish={handleSearch}
              layout="inline"
            >
              <Form.Item name="user_id" label="用戶">
                <Select placeholder="選擇用戶" style={{ width: 150 }} allowClear>
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.username}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item name="action" label="動作">
                <Select placeholder="選擇動作" style={{ width: 120 }} allowClear>
                  <Option value="login">登入</Option>
                  <Option value="logout">登出</Option>
                  <Option value="create">創建</Option>
                  <Option value="update">更新</Option>
                  <Option value="delete">刪除</Option>
                  <Option value="control">控制</Option>
                </Select>
              </Form.Item>
              
              <Form.Item name="resource_type" label="資源類型">
                <Select placeholder="選擇資源類型" style={{ width: 120 }} allowClear>
                  <Option value="device">設備</Option>
                  <Option value="user">用戶</Option>
                  <Option value="rule">規則</Option>
                  <Option value="workflow">工作流程</Option>
                  <Option value="api">API</Option>
                </Select>
              </Form.Item>
              
              <Form.Item name="date_range" label="時間範圍">
                <RangePicker />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  搜尋
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="審計日誌">
            <Table
              dataSource={auditLogs}
              columns={auditColumns}
              rowKey="id"
              size="small"
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="日誌詳情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedLog && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="時間">
              {new Date(selectedLog.timestamp).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="用戶">
              {users.find(u => u.id === selectedLog.user_id)?.username || `用戶 ${selectedLog.user_id}`}
            </Descriptions.Item>
            <Descriptions.Item label="動作">
              <Tag color={getActionColor(selectedLog.action)}>
                {getActionText(selectedLog.action)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="資源類型">
              <Tag color={getResourceTypeColor(selectedLog.resource_type)}>
                {getResourceTypeText(selectedLog.resource_type)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="資源ID">
              {selectedLog.resource_id || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="IP 地址">
              {selectedLog.ip_address}
            </Descriptions.Item>
            <Descriptions.Item label="User Agent" span={2}>
              {selectedLog.user_agent}
            </Descriptions.Item>
            <Descriptions.Item label="詳細資訊" span={2}>
              <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AuditTrail; 