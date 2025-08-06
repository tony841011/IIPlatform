import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch,
  Statistic,
  Progress,
  Alert,
  Tooltip,
  Typography,
  Badge
} from 'antd';
import { 
  ApiOutlined, 
  WifiOutlined, 
  ThunderboltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

const CommunicationProtocols = () => {
  const [protocols, setProtocols] = useState([
    {
      id: 1,
      name: 'MQTT Broker',
      type: 'MQTT',
      host: '192.168.1.100',
      port: 1883,
      status: 'connected',
      devices: 25,
      messages: 1250,
      lastActivity: '2024-01-15 14:30:00',
      description: '主要 MQTT 訊息代理伺服器'
    },
    {
      id: 2,
      name: 'Modbus TCP Server',
      type: 'Modbus TCP',
      host: '192.168.1.101',
      port: 502,
      status: 'connected',
      devices: 12,
      messages: 890,
      lastActivity: '2024-01-15 14:28:00',
      description: 'Modbus TCP 通訊伺服器'
    },
    {
      id: 3,
      name: 'OPC UA Server',
      type: 'OPC UA',
      host: '192.168.1.102',
      port: 4840,
      status: 'disconnected',
      devices: 0,
      messages: 0,
      lastActivity: '2024-01-15 13:45:00',
      description: 'OPC UA 通訊伺服器'
    },
    {
      id: 4,
      name: 'HTTP API Gateway',
      type: 'HTTP/REST',
      host: '192.168.1.103',
      port: 8080,
      status: 'connected',
      devices: 8,
      messages: 450,
      lastActivity: '2024-01-15 14:25:00',
      description: 'HTTP REST API 閘道'
    }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState(null);
  const [form] = Form.useForm();

  const protocolStats = {
    total: protocols.length,
    connected: protocols.filter(p => p.status === 'connected').length,
    disconnected: protocols.filter(p => p.status === 'disconnected').length,
    totalDevices: protocols.reduce((sum, p) => sum + p.devices, 0),
    totalMessages: protocols.reduce((sum, p) => sum + p.messages, 0)
  };

  const columns = [
    {
      title: '協定名稱',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = {
          'MQTT': 'blue',
          'Modbus TCP': 'green',
          'OPC UA': 'purple',
          'HTTP/REST': 'orange'
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      },
      filters: [
        { text: 'MQTT', value: 'MQTT' },
        { text: 'Modbus TCP', value: 'Modbus TCP' },
        { text: 'OPC UA', value: 'OPC UA' },
        { text: 'HTTP/REST', value: 'HTTP/REST' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '主機',
      dataIndex: 'host',
      key: 'host',
    },
    {
      title: '埠號',
      dataIndex: 'port',
      key: 'port',
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'connected' ? 'success' : 'error'} 
          text={status === 'connected' ? '已連線' : '未連線'} 
        />
      ),
      filters: [
        { text: '已連線', value: 'connected' },
        { text: '未連線', value: 'disconnected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '設備數',
      dataIndex: 'devices',
      key: 'devices',
      sorter: (a, b) => a.devices - b.devices,
    },
    {
      title: '訊息數',
      dataIndex: 'messages',
      key: 'messages',
      sorter: (a, b) => a.messages - b.messages,
    },
    {
      title: '最後活動',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      sorter: (a, b) => new Date(a.lastActivity) - new Date(b.lastActivity),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="測試連線">
            <Button 
              type="text" 
              icon={<ThunderboltOutlined />} 
              size="small"
            />
          </Tooltip>
          <Tooltip title="編輯">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="刪除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingProtocol(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (protocol) => {
    setEditingProtocol(protocol);
    form.setFieldsValue(protocol);
    setModalVisible(true);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (editingProtocol) {
        // 編輯現有協定
        setProtocols(protocols.map(protocol => 
          protocol.id === editingProtocol.id 
            ? { ...protocol, ...values }
            : protocol
        ));
      } else {
        // 新增協定
        const newProtocol = {
          id: Math.max(...protocols.map(p => p.id)) + 1,
          ...values,
          status: 'disconnected',
          devices: 0,
          messages: 0,
          lastActivity: new Date().toLocaleString()
        };
        setProtocols([...protocols, newProtocol]);
      }
      setModalVisible(false);
    });
  };

  return (
    <div>
      <Card title="通訊協定管理">
        {/* 狀態警報 */}
        <Alert
          message="通訊狀態"
          description="OPC UA Server 連線中斷，請檢查網路連線和伺服器狀態。"
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: 16 }}
        />

        {/* 統計數據 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="總協定數"
                value={protocolStats.total}
                prefix={<ApiOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="已連線"
                value={protocolStats.connected}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="未連線"
                value={protocolStats.disconnected}
                valueStyle={{ color: '#cf1322' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="總設備數"
                value={protocolStats.totalDevices}
                prefix={<WifiOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="總訊息數"
                value={protocolStats.totalMessages}
                prefix={<ThunderboltOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="連線率"
                value={Math.round((protocolStats.connected / protocolStats.total) * 100)}
                suffix="%"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 操作按鈕 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={16}>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增協定
              </Button>
              <Button icon={<ReloadOutlined />}>
                重新掃描
              </Button>
              <Button icon={<SettingOutlined />}>
                批量配置
              </Button>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<PlayCircleOutlined />}>
                啟動全部
              </Button>
              <Button icon={<PauseCircleOutlined />}>
                停止全部
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 協定表格 */}
        <Table
          columns={columns}
          dataSource={protocols}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
          }}
        />
      </Card>

      {/* 新增/編輯模態框 */}
      <Modal
        title={editingProtocol ? '編輯通訊協定' : '新增通訊協定'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="協定名稱"
                rules={[{ required: true, message: '請輸入協定名稱' }]}
              >
                <Input placeholder="請輸入協定名稱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="協定類型"
                rules={[{ required: true, message: '請選擇協定類型' }]}
              >
                <Select placeholder="請選擇協定類型">
                  <Option value="MQTT">MQTT</Option>
                  <Option value="Modbus TCP">Modbus TCP</Option>
                  <Option value="OPC UA">OPC UA</Option>
                  <Option value="HTTP/REST">HTTP/REST</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="host"
                label="主機地址"
                rules={[{ required: true, message: '請輸入主機地址' }]}
              >
                <Input placeholder="192.168.1.100" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="port"
                label="埠號"
                rules={[{ required: true, message: '請輸入埠號' }]}
              >
                <Input placeholder="1883" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="請輸入協定描述" />
          </Form.Item>

          <Form.Item
            name="enabled"
            label="啟用狀態"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CommunicationProtocols; 