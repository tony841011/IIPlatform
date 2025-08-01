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
  Upload,
  message,
  Progress,
  Alert,
  Tabs
} from 'antd';
import {
  CloudUploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const OTAUpdate = () => {
  const [firmwares, setFirmwares] = useState([]);
  const [otaUpdates, setOtaUpdates] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [firmwareModalVisible, setFirmwareModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedFirmware, setSelectedFirmware] = useState(null);
  const [firmwareForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  useEffect(() => {
    fetchFirmwares();
    fetchOtaUpdates();
    fetchDevices();
  }, []);

  const fetchFirmwares = async () => {
    try {
      const response = await axios.get('http://localhost:8000/firmware/');
      setFirmwares(response.data);
    } catch (error) {
      message.error('獲取韌體列表失敗');
    }
  };

  const fetchOtaUpdates = async () => {
    try {
      const response = await axios.get('http://localhost:8000/ota/updates');
      setOtaUpdates(response.data);
    } catch (error) {
      console.log('獲取 OTA 更新列表失敗');
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

  const createFirmware = async (values) => {
    try {
      setLoading(true);
      await axios.post('http://localhost:8000/firmware/', values);
      message.success('韌體創建成功');
      setFirmwareModalVisible(false);
      firmwareForm.resetFields();
      fetchFirmwares();
    } catch (error) {
      message.error('韌體創建失敗');
    } finally {
      setLoading(false);
    }
  };

  const createOtaUpdate = async (values) => {
    try {
      setLoading(true);
      await axios.post('http://localhost:8000/ota/update', values);
      message.success('OTA 更新任務創建成功');
      setUpdateModalVisible(false);
      updateForm.resetFields();
      fetchOtaUpdates();
    } catch (error) {
      message.error('OTA 更新任務創建失敗');
    } finally {
      setLoading(false);
    }
  };

  const getUpdateStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'pending': return 'orange';
      case 'in_progress': return 'blue';
      default: return 'default';
    }
  };

  const getUpdateStatusText = (status) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'failed': return '失敗';
      case 'pending': return '等待中';
      case 'in_progress': return '進行中';
      default: return status;
    }
  };

  const firmwareColumns = [
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
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
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedFirmware(record);
              setUpdateModalVisible(true);
            }}
          >
            選擇更新
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
          >
            刪除
          </Button>
        </Space>
      ),
    },
  ];

  const updateColumns = [
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
      title: '韌體版本',
      dataIndex: 'firmware_id',
      key: 'firmware_id',
      render: (firmwareId) => {
        const firmware = firmwares.find(f => f.id === firmwareId);
        return firmware ? firmware.version : `韌體 ${firmwareId}`;
      }
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getUpdateStatusColor(status)}>
          {getUpdateStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '開始時間',
      dataIndex: 'started_at',
      key: 'started_at',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '完成時間',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '錯誤訊息',
      dataIndex: 'error_message',
      key: 'error_message',
      render: (error) => error || '-',
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="OTA 更新概覽" extra={
            <Space>
              <Button type="primary" icon={<CloudUploadOutlined />} onClick={() => setFirmwareModalVisible(true)}>
                上傳韌體
              </Button>
              <Button onClick={() => { fetchFirmwares(); fetchOtaUpdates(); }}>
                刷新
              </Button>
            </Space>
          }>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="韌體總數"
                  value={firmwares.length}
                  prefix={<CloudUploadOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="啟用韌體"
                  value={firmwares.filter(f => f.is_active).length}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="更新任務"
                  value={otaUpdates.length}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="成功更新"
                  value={otaUpdates.filter(u => u.status === 'completed').length}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="韌體管理">
            <Table
              dataSource={firmwares}
              columns={firmwareColumns}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="更新任務">
            <Table
              dataSource={otaUpdates}
              columns={updateColumns}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* 韌體上傳模態框 */}
      <Modal
        title="上傳韌體"
        open={firmwareModalVisible}
        onCancel={() => setFirmwareModalVisible(false)}
        footer={null}
      >
        <Form
          form={firmwareForm}
          onFinish={createFirmware}
          layout="vertical"
        >
          <Form.Item
            label="版本號"
            name="version"
            rules={[{ required: true, message: '請輸入版本號' }]}
          >
            <Input placeholder="例如: v1.2.3" />
          </Form.Item>
          
          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea rows={3} placeholder="韌體描述" />
          </Form.Item>
          
          <Form.Item
            label="設備類型"
            name="device_type"
            rules={[{ required: true, message: '請選擇設備類型' }]}
          >
            <Select placeholder="選擇設備類型">
              <Option value="sensor">感測器</Option>
              <Option value="actuator">執行器</Option>
              <Option value="controller">控制器</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="韌體檔案"
            name="file"
          >
            <Upload.Dragger>
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined />
              </p>
              <p className="ant-upload-text">點擊或拖拽檔案到此區域上傳</p>
            </Upload.Dragger>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                上傳韌體
              </Button>
              <Button onClick={() => setFirmwareModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* OTA 更新模態框 */}
      <Modal
        title="創建 OTA 更新任務"
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        footer={null}
      >
        <Form
          form={updateForm}
          onFinish={createOtaUpdate}
          layout="vertical"
        >
          <Form.Item
            label="選擇設備"
            name="device_id"
            rules={[{ required: true, message: '請選擇設備' }]}
          >
            <Select placeholder="選擇要更新的設備">
              {devices.map(device => (
                <Option key={device.id} value={device.id}>
                  {device.name} ({device.location})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="選擇韌體"
            name="firmware_id"
            rules={[{ required: true, message: '請選擇韌體' }]}
            initialValue={selectedFirmware?.id}
          >
            <Select placeholder="選擇要安裝的韌體">
              {firmwares.filter(f => f.is_active).map(firmware => (
                <Option key={firmware.id} value={firmware.id}>
                  {firmware.version} - {firmware.description}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                創建更新任務
              </Button>
              <Button onClick={() => setUpdateModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OTAUpdate; 