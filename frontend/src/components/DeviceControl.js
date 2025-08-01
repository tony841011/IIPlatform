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
  Progress,
  Alert,
  message,
  Tooltip
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  EyeOutlined,
  SendOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const DeviceControl = () => {
  const [devices, setDevices] = useState([]);
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commandModalVisible, setCommandModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [commandForm] = Form.useForm();

  useEffect(() => {
    fetchDevices();
    fetchCommands();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/devices/');
      setDevices(response.data);
    } catch (error) {
      message.error('獲取設備列表失敗');
    }
  };

  const fetchCommands = async () => {
    try {
      const response = await axios.get('http://localhost:8000/devices/1/commands/');
      setCommands(response.data);
    } catch (error) {
      console.log('獲取命令歷史失敗');
    }
  };

  const sendCommand = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:8000/devices/${selectedDevice.id}/command`,
        {
          device_id: selectedDevice.id,
          command_type: values.command_type,
          parameters: values.parameters ? JSON.parse(values.parameters) : {}
        }
      );
      message.success('命令發送成功');
      setCommandModalVisible(false);
      commandForm.resetFields();
      fetchCommands();
    } catch (error) {
      message.error('命令發送失敗');
    } finally {
      setLoading(false);
    }
  };

  const updateDeviceHeartbeat = async (deviceId, status) => {
    try {
      await axios.post('http://localhost:8000/devices/heartbeat', {
        device_id: deviceId,
        status: status,
        battery_level: Math.random() * 100,
        temperature: Math.random() * 50 + 20
      });
      message.success('設備狀態更新成功');
      fetchDevices();
    } catch (error) {
      message.error('設備狀態更新失敗');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'green';
      case 'offline': return 'red';
      case 'maintenance': return 'orange';
      default: return 'default';
    }
  };

  const getCommandStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'pending': return 'orange';
      case 'sent': return 'blue';
      default: return 'default';
    }
  };

  const deviceColumns = [
    {
      title: '設備名稱',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status === 'online' ? '在線' : status === 'offline' ? '離線' : '維護中'}
        </Tag>
      ),
    },
    {
      title: '設備類型',
      dataIndex: 'device_type',
      key: 'device_type',
      render: (type) => {
        const typeMap = {
          'sensor': '感測器',
          'actuator': '執行器',
          'controller': '控制器'
        };
        return typeMap[type] || type;
      }
    },
    {
      title: '韌體版本',
      dataIndex: 'firmware_version',
      key: 'firmware_version',
    },
    {
      title: '最後心跳',
      dataIndex: 'last_heartbeat',
      key: 'last_heartbeat',
      render: (time) => time ? new Date(time).toLocaleString() : '無',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<SendOutlined />}
            onClick={() => {
              setSelectedDevice(record);
              setCommandModalVisible(true);
            }}
          >
            發送命令
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => updateDeviceHeartbeat(record.id, 'online')}
          >
            更新狀態
          </Button>
        </Space>
      ),
    },
  ];

  const commandColumns = [
    {
      title: '命令類型',
      dataIndex: 'command_type',
      key: 'command_type',
      render: (type) => {
        const typeMap = {
          'restart': '重新啟動',
          'update_config': '更新配置',
          'control': '控制命令'
        };
        return typeMap[type] || type;
      }
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getCommandStatusColor(status)}>
          {status === 'completed' ? '已完成' : 
           status === 'failed' ? '失敗' : 
           status === 'pending' ? '等待中' : 
           status === 'sent' ? '已發送' : status}
        </Tag>
      ),
    },
    {
      title: '發送時間',
      dataIndex: 'sent_at',
      key: 'sent_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '完成時間',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
  ];

  const commandTypes = [
    { value: 'restart', label: '重新啟動' },
    { value: 'update_config', label: '更新配置' },
    { value: 'control', label: '控制命令' }
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="設備狀態概覽" extra={
            <Button type="primary" onClick={fetchDevices}>
              刷新
            </Button>
          }>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="總設備數"
                  value={devices.length}
                  prefix={<ThunderboltOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="在線設備"
                  value={devices.filter(d => d.status === 'online').length}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="離線設備"
                  value={devices.filter(d => d.status === 'offline').length}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="維護中"
                  value={devices.filter(d => d.status === 'maintenance').length}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="設備列表" extra={
            <Space>
              <Button size="small" onClick={() => updateDeviceHeartbeat(1, 'online')}>
                模擬心跳
              </Button>
            </Space>
          }>
            <Table
              dataSource={devices}
              columns={deviceColumns}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="命令歷史">
            <Table
              dataSource={commands}
              columns={commandColumns}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="發送設備命令"
        open={commandModalVisible}
        onCancel={() => setCommandModalVisible(false)}
        footer={null}
      >
        <Form
          form={commandForm}
          onFinish={sendCommand}
          layout="vertical"
        >
          <Form.Item
            label="設備"
            name="device_name"
            initialValue={selectedDevice?.name}
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item
            label="命令類型"
            name="command_type"
            rules={[{ required: true, message: '請選擇命令類型' }]}
          >
            <Select placeholder="選擇命令類型">
              {commandTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="參數 (JSON 格式)"
            name="parameters"
            initialValue="{}"
          >
            <TextArea rows={4} placeholder='{"key": "value"}' />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                發送命令
              </Button>
              <Button onClick={() => setCommandModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeviceControl; 