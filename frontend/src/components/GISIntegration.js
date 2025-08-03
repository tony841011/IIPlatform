import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
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
  TimePicker,
  Table
} from 'antd';
import {
  EnvironmentOutlined,
  GlobalOutlined,
  LocationOutlined,
  CompassOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
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
  TeamOutlined,
  AimOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Step } = Steps;
const { TabPane } = Tabs;

const GISIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [zoneModalVisible, setZoneModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceForm] = Form.useForm();
  const [zoneForm] = Form.useForm();

  // 設備位置數據
  const [devices, setDevices] = useState([
    {
      id: 1,
      name: '生產線 A-001',
      type: 'production_line',
      status: 'online',
      latitude: 25.0330,
      longitude: 121.5654,
      location: '台北市信義區',
      zone: '生產區 A',
      last_update: '2024-01-15 14:30:00',
      temperature: 24.5,
      humidity: 65,
      power_consumption: 85.2,
      efficiency: 92.5
    },
    {
      id: 2,
      name: '冷卻系統 B-002',
      type: 'cooling_system',
      status: 'warning',
      latitude: 25.0335,
      longitude: 121.5658,
      location: '台北市信義區',
      zone: '設備區 B',
      last_update: '2024-01-15 14:25:00',
      temperature: 28.3,
      humidity: 70,
      power_consumption: 45.8,
      efficiency: 78.2
    },
    {
      id: 3,
      name: '品質檢測站 C-003',
      type: 'quality_check',
      status: 'offline',
      latitude: 25.0325,
      longitude: 121.5650,
      location: '台北市信義區',
      zone: '檢測區 C',
      last_update: '2024-01-15 13:45:00',
      temperature: 22.1,
      humidity: 60,
      power_consumption: 12.5,
      efficiency: 0
    }
  ]);

  // 地理區域
  const [zones, setZones] = useState([
    {
      id: 1,
      name: '生產區 A',
      description: '主要生產線區域',
      center_lat: 25.0330,
      center_lng: 121.5654,
      radius: 100,
      device_count: 15,
      alert_count: 2,
      status: 'normal',
      created_at: '2024-01-10 10:00:00'
    },
    {
      id: 2,
      name: '設備區 B',
      description: '輔助設備區域',
      center_lat: 25.0335,
      center_lng: 121.5658,
      radius: 80,
      device_count: 8,
      alert_count: 1,
      status: 'warning',
      created_at: '2024-01-12 14:30:00'
    },
    {
      id: 3,
      name: '檢測區 C',
      description: '品質檢測區域',
      center_lat: 25.0325,
      center_lng: 121.5650,
      radius: 60,
      device_count: 5,
      alert_count: 0,
      status: 'normal',
      created_at: '2024-01-15 09:15:00'
    }
  ]);

  // 地理告警
  const [geoAlerts, setGeoAlerts] = useState([
    {
      id: 1,
      type: 'temperature_alert',
      title: '溫度異常警報',
      message: '生產區 A 溫度超出正常範圍',
      latitude: 25.0330,
      longitude: 121.5654,
      severity: 'high',
      status: 'active',
      created_at: '2024-01-15 14:30:00',
      device_name: '生產線 A-001'
    },
    {
      id: 2,
      type: 'efficiency_alert',
      title: '效能警告',
      message: '設備區 B 效能低於標準',
      latitude: 25.0335,
      longitude: 121.5658,
      severity: 'medium',
      status: 'active',
      created_at: '2024-01-15 14:25:00',
      device_name: '冷卻系統 B-002'
    }
  ]);

  // 地圖統計
  const [mapStats, setMapStats] = useState({
    total_devices: 28,
    online_devices: 25,
    offline_devices: 3,
    total_zones: 3,
    active_alerts: 2,
    coverage_area: '2.5 平方公里',
    avg_temperature: 24.8,
    avg_humidity: 65.2
  });

  const handleAddDevice = async (values) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newDevice = {
        id: devices.length + 1,
        ...values,
        status: 'offline',
        last_update: new Date().toLocaleString(),
        temperature: 0,
        humidity: 0,
        power_consumption: 0,
        efficiency: 0
      };
      
      setDevices([newDevice, ...devices]);
      message.success('設備位置新增成功');
      setDeviceModalVisible(false);
      deviceForm.resetFields();
    } catch (error) {
      message.error('新增失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZone = async (values) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newZone = {
        id: zones.length + 1,
        ...values,
        device_count: 0,
        alert_count: 0,
        status: 'normal',
        created_at: new Date().toLocaleString()
      };
      
      setZones([newZone, ...zones]);
      message.success('地理區域創建成功');
      setZoneModalVisible(false);
      zoneForm.resetFields();
    } catch (error) {
      message.error('創建失敗');
    } finally {
      setLoading(false);
    }
  };

  const deviceColumns = [
    {
      title: '設備名稱',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space direction="vertical">
          <Text strong>{name}</Text>
          <Text type="secondary">{record.type}</Text>
        </Space>
      )
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'online' ? 'green' : 
          status === 'warning' ? 'orange' : 'red'
        }>
          {status === 'online' ? '線上' : 
           status === 'warning' ? '警告' : '離線'}
        </Tag>
      )
    },
    {
      title: '位置',
      key: 'location',
      render: (_, record) => (
        <Space direction="vertical">
          <Text>{record.location}</Text>
          <Text type="secondary">
            {record.latitude}, {record.longitude}
          </Text>
        </Space>
      )
    },
    {
      title: '區域',
      dataIndex: 'zone',
      key: 'zone',
      render: (zone) => <Tag color="blue">{zone}</Tag>
    },
    {
      title: '溫度',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (temp) => `${temp}°C`
    },
    {
      title: '效能',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (eff) => (
        <Progress 
          percent={eff} 
          size="small" 
          status={eff < 80 ? 'exception' : 'normal'}
        />
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => setSelectedDevice(record)}
          >
            詳情
          </Button>
          <Button 
            size="small" 
            icon={<EditOutlined />}
          >
            編輯
          </Button>
        </Space>
      )
    }
  ];

  const zoneColumns = [
    {
      title: '區域名稱',
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
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'normal' ? 'green' : 
          status === 'warning' ? 'orange' : 'red'
        }>
          {status === 'normal' ? '正常' : 
           status === 'warning' ? '警告' : '異常'}
        </Tag>
      )
    },
    {
      title: '設備數量',
      dataIndex: 'device_count',
      key: 'device_count',
      render: (count) => <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
    },
    {
      title: '告警數量',
      dataIndex: 'alert_count',
      key: 'alert_count',
      render: (count) => (
        <Badge 
          count={count} 
          style={{ backgroundColor: count > 0 ? '#f5222d' : '#52c41a' }} 
        />
      )
    },
    {
      title: '覆蓋半徑',
      dataIndex: 'radius',
      key: 'radius',
      render: (radius) => `${radius} 公尺`
    },
    {
      title: '建立時間',
      dataIndex: 'created_at',
      key: 'created_at'
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>查看</Button>
          <Button size="small" icon={<EditOutlined />}>編輯</Button>
          <Button size="small" icon={<SettingOutlined />}>設定</Button>
        </Space>
      )
    }
  ];

  const alertColumns = [
    {
      title: '告警類型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeNames = {
          temperature_alert: '溫度告警',
          efficiency_alert: '效能告警',
          power_alert: '電力告警',
          quality_alert: '品質告警'
        };
        return <Tag color="red">{typeNames[type]}</Tag>;
      }
    },
    {
      title: '標題',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '嚴重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={
          severity === 'high' ? 'red' : 
          severity === 'medium' ? 'orange' : 'yellow'
        }>
          {severity === 'high' ? '高' : 
           severity === 'medium' ? '中' : '低'}
        </Tag>
      )
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'red' : 'green'}>
          {status === 'active' ? '活動中' : '已解決'}
        </Tag>
      )
    },
    {
      title: '設備',
      dataIndex: 'device_name',
      key: 'device_name'
    },
    {
      title: '建立時間',
      dataIndex: 'created_at',
      key: 'created_at'
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>查看</Button>
          <Button size="small" icon={<EditOutlined />}>處理</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <EnvironmentOutlined /> 地理資訊整合
      </Title>

      <Row gutter={[16, 16]}>
        {/* 地圖統計 */}
        <Col span={24}>
          <Card title="地圖統計概覽">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="總設備數"
                  value={mapStats.total_devices}
                  prefix={<GlobalOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="線上設備"
                  value={mapStats.online_devices}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="地理區域"
                  value={mapStats.total_zones}
                  prefix={<EnvironmentOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="活動告警"
                  value={mapStats.active_alerts}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 地圖視圖 */}
        <Col span={24}>
          <Card 
            title="地理分佈圖"
            extra={
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setDeviceModalVisible(true)}
                >
                  新增設備
                </Button>
                <Button 
                  icon={<PlusOutlined />}
                  onClick={() => setZoneModalVisible(true)}
                >
                  新增區域
                </Button>
              </Space>
            }
          >
            <div style={{ 
              height: '400px', 
              background: '#f0f2f5', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: '8px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <EnvironmentOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                <div style={{ marginTop: '16px' }}>
                  <Text strong>地圖視圖</Text>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary">整合 Google Maps 或 Leaflet 地圖</Text>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <Text type="secondary">
                    顯示 {devices.length} 個設備位置和 {zones.length} 個地理區域
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 設備列表 */}
        <Col span={12}>
          <Card title="設備位置列表">
            <Table
              dataSource={devices}
              columns={deviceColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>

        {/* 地理區域 */}
        <Col span={12}>
          <Card title="地理區域管理">
            <Table
              dataSource={zones}
              columns={zoneColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>

        {/* 地理告警 */}
        <Col span={24}>
          <Card title="地理告警">
            <Table
              dataSource={geoAlerts}
              columns={alertColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 新增設備模態框 */}
      <Modal
        title="新增設備位置"
        open={deviceModalVisible}
        onCancel={() => setDeviceModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={deviceForm}
          onFinish={handleAddDevice}
          layout="vertical"
        >
          <Form.Item
            label="設備名稱"
            name="name"
            rules={[{ required: true, message: '請輸入設備名稱' }]}
          >
            <Input placeholder="請輸入設備名稱" />
          </Form.Item>

          <Form.Item
            label="設備類型"
            name="type"
            rules={[{ required: true, message: '請選擇設備類型' }]}
          >
            <Select placeholder="請選擇設備類型">
              <Option value="production_line">生產線</Option>
              <Option value="cooling_system">冷卻系統</Option>
              <Option value="quality_check">品質檢測</Option>
              <Option value="energy_system">能源系統</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="緯度"
                name="latitude"
                rules={[{ required: true, message: '請輸入緯度' }]}
              >
                <Input placeholder="例如：25.0330" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="經度"
                name="longitude"
                rules={[{ required: true, message: '請輸入經度' }]}
              >
                <Input placeholder="例如：121.5654" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="位置描述"
            name="location"
            rules={[{ required: true, message: '請輸入位置描述' }]}
          >
            <Input placeholder="例如：台北市信義區" />
          </Form.Item>

          <Form.Item
            label="所屬區域"
            name="zone"
            rules={[{ required: true, message: '請選擇所屬區域' }]}
          >
            <Select placeholder="請選擇所屬區域">
              {zones.map(zone => (
                <Option key={zone.id} value={zone.name}>
                  {zone.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
              >
                新增設備
              </Button>
              <Button onClick={() => setDeviceModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增區域模態框 */}
      <Modal
        title="新增地理區域"
        open={zoneModalVisible}
        onCancel={() => setZoneModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={zoneForm}
          onFinish={handleCreateZone}
          layout="vertical"
        >
          <Form.Item
            label="區域名稱"
            name="name"
            rules={[{ required: true, message: '請輸入區域名稱' }]}
          >
            <Input placeholder="請輸入區域名稱" />
          </Form.Item>

          <Form.Item
            label="區域描述"
            name="description"
            rules={[{ required: true, message: '請輸入區域描述' }]}
          >
            <TextArea rows={3} placeholder="請輸入區域描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="中心緯度"
                name="center_lat"
                rules={[{ required: true, message: '請輸入中心緯度' }]}
              >
                <Input placeholder="例如：25.0330" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="中心經度"
                name="center_lng"
                rules={[{ required: true, message: '請輸入中心經度' }]}
              >
                <Input placeholder="例如：121.5654" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="覆蓋半徑"
            name="radius"
            rules={[{ required: true, message: '請輸入覆蓋半徑' }]}
          >
            <Input placeholder="例如：100 (公尺)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
              >
                創建區域
              </Button>
              <Button onClick={() => setZoneModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 設備詳情抽屜 */}
      <Drawer
        title="設備詳情"
        placement="right"
        width={600}
        open={selectedDevice !== null}
        onClose={() => setSelectedDevice(null)}
      >
        {selectedDevice && (
          <div>
            <Descriptions title="基本資訊" column={1}>
              <Descriptions.Item label="設備名稱">{selectedDevice.name}</Descriptions.Item>
              <Descriptions.Item label="設備類型">{selectedDevice.type}</Descriptions.Item>
              <Descriptions.Item label="位置">{selectedDevice.location}</Descriptions.Item>
              <Descriptions.Item label="所屬區域">{selectedDevice.zone}</Descriptions.Item>
              <Descriptions.Item label="座標">
                {selectedDevice.latitude}, {selectedDevice.longitude}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="狀態資訊" column={1}>
              <Descriptions.Item label="連接狀態">
                <Tag color={selectedDevice.status === 'online' ? 'green' : 'red'}>
                  {selectedDevice.status === 'online' ? '線上' : '離線'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="最後更新">{selectedDevice.last_update}</Descriptions.Item>
              <Descriptions.Item label="溫度">{selectedDevice.temperature}°C</Descriptions.Item>
              <Descriptions.Item label="濕度">{selectedDevice.humidity}%</Descriptions.Item>
              <Descriptions.Item label="功耗">{selectedDevice.power_consumption} kW</Descriptions.Item>
              <Descriptions.Item label="效能">
                <Progress percent={selectedDevice.efficiency} size="small" />
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default GISIntegration;