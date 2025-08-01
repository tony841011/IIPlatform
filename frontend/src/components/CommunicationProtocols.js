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
  Tabs,
  message,
  Alert,
  Switch,
  InputNumber
} from 'antd';
import {
  ApiOutlined,
  WifiOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  SettingOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TabPane } = Tabs;

const CommunicationProtocols = () => {
  const [protocols, setProtocols] = useState([]);
  const [mqttConfigs, setMqttConfigs] = useState([]);
  const [modbusConfigs, setModbusConfigs] = useState([]);
  const [opcuaConfigs, setOpcuaConfigs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState('mqtt');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProtocols();
    fetchMqttConfigs();
    fetchModbusConfigs();
    fetchOpcuaConfigs();
    fetchDevices();
  }, []);

  const fetchProtocols = async () => {
    try {
      const response = await axios.get('http://localhost:8000/protocols/');
      setProtocols(response.data);
    } catch (error) {
      console.log('獲取通訊協定列表失敗');
    }
  };

  const fetchMqttConfigs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/protocols/mqtt/');
      setMqttConfigs(response.data);
    } catch (error) {
      console.log('獲取 MQTT 配置失敗');
    }
  };

  const fetchModbusConfigs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/protocols/modbus-tcp/');
      setModbusConfigs(response.data);
    } catch (error) {
      console.log('獲取 Modbus TCP 配置失敗');
    }
  };

  const fetchOpcuaConfigs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/protocols/opc-ua/');
      setOpcuaConfigs(response.data);
    } catch (error) {
      console.log('獲取 OPC UA 配置失敗');
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

  const createConfig = async (values) => {
    try {
      setLoading(true);
      let endpoint = '';
      switch (selectedProtocol) {
        case 'mqtt':
          endpoint = 'http://localhost:8000/protocols/mqtt/';
          break;
        case 'modbus_tcp':
          endpoint = 'http://localhost:8000/protocols/modbus-tcp/';
          break;
        case 'opc_ua':
          endpoint = 'http://localhost:8000/protocols/opc-ua/';
          break;
        default:
          endpoint = 'http://localhost:8000/protocols/';
      }
      
      await axios.post(endpoint, values);
      message.success('配置創建成功');
      setModalVisible(false);
      form.resetFields();
      
      // 刷新對應的配置列表
      switch (selectedProtocol) {
        case 'mqtt':
          fetchMqttConfigs();
          break;
        case 'modbus_tcp':
          fetchModbusConfigs();
          break;
        case 'opc_ua':
          fetchOpcuaConfigs();
          break;
        default:
          fetchProtocols();
      }
    } catch (error) {
      message.error('配置創建失敗');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (protocolType, config) => {
    try {
      const response = await axios.post('http://localhost:8000/protocols/test', {
        device_id: config.device_id,
        protocol_type: protocolType,
        test_data: config
      });
      
      if (response.data.status === 'success') {
        message.success(response.data.message);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('連線測試失敗');
    }
  };

  const getProtocolIcon = (type) => {
    switch (type) {
      case 'mqtt': return <WifiOutlined />;
      case 'restful': return <ApiOutlined />;
      case 'modbus_tcp': return <ThunderboltOutlined />;
      case 'opc_ua': return <CloudOutlined />;
      default: return <ApiOutlined />;
    }
  };

  const getProtocolColor = (type) => {
    switch (type) {
      case 'mqtt': return 'blue';
      case 'restful': return 'green';
      case 'modbus_tcp': return 'orange';
      case 'opc_ua': return 'purple';
      default: return 'default';
    }
  };

  const mqttColumns = [
    {
      title: '設備',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (deviceId) => {
        const device = devices.find(d => d.id === deviceId);
        return device ? device.name : `設備 ${deviceId}`;
      }
    },
    {
      title: 'Broker URL',
      dataIndex: 'broker_url',
      key: 'broker_url',
    },
    {
      title: 'Port',
      dataIndex: 'broker_port',
      key: 'broker_port',
    },
    {
      title: 'Topic Prefix',
      dataIndex: 'topic_prefix',
      key: 'topic_prefix',
    },
    {
      title: 'QoS',
      dataIndex: 'qos_level',
      key: 'qos_level',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<ExperimentOutlined />}
            onClick={() => testConnection('mqtt', record)}
          >
            測試
          </Button>
          <Button size="small" icon={<SettingOutlined />}>
            編輯
          </Button>
        </Space>
      ),
    },
  ];

  const modbusColumns = [
    {
      title: '設備',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (deviceId) => {
        const device = devices.find(d => d.id === deviceId);
        return device ? device.name : `設備 ${deviceId}`;
      }
    },
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
    },
    {
      title: 'Unit ID',
      dataIndex: 'unit_id',
      key: 'unit_id',
    },
    {
      title: 'Timeout',
      dataIndex: 'timeout',
      key: 'timeout',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<ExperimentOutlined />}
            onClick={() => testConnection('modbus_tcp', record)}
          >
            測試
          </Button>
          <Button size="small" icon={<SettingOutlined />}>
            編輯
          </Button>
        </Space>
      ),
    },
  ];

  const opcuaColumns = [
    {
      title: '設備',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (deviceId) => {
        const device = devices.find(d => d.id === deviceId);
        return device ? device.name : `設備 ${deviceId}`;
      }
    },
    {
      title: 'Server URL',
      dataIndex: 'server_url',
      key: 'server_url',
    },
    {
      title: 'Namespace',
      dataIndex: 'namespace',
      key: 'namespace',
    },
    {
      title: 'Node ID',
      dataIndex: 'node_id',
      key: 'node_id',
    },
    {
      title: 'Security Policy',
      dataIndex: 'security_policy',
      key: 'security_policy',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<ExperimentOutlined />}
            onClick={() => testConnection('opc_ua', record)}
          >
            測試
          </Button>
          <Button size="small" icon={<SettingOutlined />}>
            編輯
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="通訊協定概覽" extra={
            <Button type="primary" icon={<ApiOutlined />} onClick={() => setModalVisible(true)}>
              新增配置
            </Button>
          }>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="MQTT 配置"
                  value={mqttConfigs.length}
                  prefix={<WifiOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Modbus TCP 配置"
                  value={modbusConfigs.length}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="OPC UA 配置"
                  value={opcuaConfigs.length}
                  prefix={<CloudOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="總配置數"
                  value={mqttConfigs.length + modbusConfigs.length + opcuaConfigs.length}
                  prefix={<ApiOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="通訊協定配置">
            <Tabs defaultActiveKey="mqtt">
              <TabPane tab="MQTT" key="mqtt">
                <Table
                  dataSource={mqttConfigs}
                  columns={mqttColumns}
                  rowKey="id"
                  size="small"
                />
              </TabPane>
              <TabPane tab="Modbus TCP" key="modbus">
                <Table
                  dataSource={modbusConfigs}
                  columns={modbusColumns}
                  rowKey="id"
                  size="small"
                />
              </TabPane>
              <TabPane tab="OPC UA" key="opcua">
                <Table
                  dataSource={opcuaConfigs}
                  columns={opcuaColumns}
                  rowKey="id"
                  size="small"
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      <Modal
        title="新增通訊協定配置"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          onFinish={createConfig}
          layout="vertical"
        >
          <Form.Item
            label="協定類型"
            name="protocol_type"
            initialValue={selectedProtocol}
          >
            <Select onChange={(value) => setSelectedProtocol(value)}>
              <Option value="mqtt">MQTT</Option>
              <Option value="modbus_tcp">Modbus TCP</Option>
              <Option value="opc_ua">OPC UA</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="選擇設備"
            name="device_id"
            rules={[{ required: true, message: '請選擇設備' }]}
          >
            <Select placeholder="選擇設備">
              {devices.map(device => (
                <Option key={device.id} value={device.id}>
                  {device.name} ({device.location})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedProtocol === 'mqtt' && (
            <>
              <Form.Item
                label="Broker URL"
                name="broker_url"
                rules={[{ required: true, message: '請輸入 Broker URL' }]}
              >
                <Input placeholder="例如: mqtt://localhost" />
              </Form.Item>
              
              <Form.Item
                label="Port"
                name="broker_port"
                initialValue={1883}
              >
                <InputNumber min={1} max={65535} />
              </Form.Item>
              
              <Form.Item
                label="Topic Prefix"
                name="topic_prefix"
                rules={[{ required: true, message: '請輸入 Topic Prefix' }]}
              >
                <Input placeholder="例如: sensor/temp" />
              </Form.Item>
              
              <Form.Item
                label="QoS Level"
                name="qos_level"
                initialValue={1}
              >
                <Select>
                  <Option value={0}>0 - At most once</Option>
                  <Option value={1}>1 - At least once</Option>
                  <Option value={2}>2 - Exactly once</Option>
                </Select>
              </Form.Item>
            </>
          )}

          {selectedProtocol === 'modbus_tcp' && (
            <>
              <Form.Item
                label="Host"
                name="host"
                rules={[{ required: true, message: '請輸入 Host' }]}
              >
                <Input placeholder="例如: 192.168.1.100" />
              </Form.Item>
              
              <Form.Item
                label="Port"
                name="port"
                initialValue={502}
              >
                <InputNumber min={1} max={65535} />
              </Form.Item>
              
              <Form.Item
                label="Unit ID"
                name="unit_id"
                initialValue={1}
              >
                <InputNumber min={1} max={255} />
              </Form.Item>
              
              <Form.Item
                label="Timeout (秒)"
                name="timeout"
                initialValue={10}
              >
                <InputNumber min={1} max={60} />
              </Form.Item>
            </>
          )}

          {selectedProtocol === 'opc_ua' && (
            <>
              <Form.Item
                label="Server URL"
                name="server_url"
                rules={[{ required: true, message: '請輸入 Server URL' }]}
              >
                <Input placeholder="例如: opc.tcp://192.168.1.200:4840" />
              </Form.Item>
              
              <Form.Item
                label="Namespace"
                name="namespace"
                initialValue="2"
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                label="Node ID"
                name="node_id"
                rules={[{ required: true, message: '請輸入 Node ID' }]}
              >
                <Input placeholder="例如: ns=2;s=Device1" />
              </Form.Item>
              
              <Form.Item
                label="Security Policy"
                name="security_policy"
                initialValue="Basic256Sha256"
              >
                <Select>
                  <Option value="None">None</Option>
                  <Option value="Basic128Rsa15">Basic128Rsa15</Option>
                  <Option value="Basic256">Basic256</Option>
                  <Option value="Basic256Sha256">Basic256Sha256</Option>
                </Select>
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                創建配置
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

export default CommunicationProtocols; 