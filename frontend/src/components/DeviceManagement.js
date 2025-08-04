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
  Tooltip,
  Popconfirm,
  Drawer,
  Tabs,
  List,
  Avatar,
  Switch,
  TimePicker,
  DatePicker,
  Slider,
  Upload,
  Tree,
  Transfer,
  Cascader,
  Radio,
  Checkbox,
  Rate,
  InputNumber,
  Mentions,
  AutoComplete,
  TreeSelect,
  Image,
  Skeleton,
  Empty,
  Result,
  PageHeader,
  Breadcrumb,
  Dropdown,
  Menu,
  Affix,
  Anchor,
  BackTop,
  ConfigProvider,
  LocaleProvider,
  theme,
  App,
  FloatButton,
  Watermark,
  Tour,
  QRCode,
  Divider,
  Badge,
  Timeline,
  Steps,
  Descriptions,
  Collapse
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SettingOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  MonitorOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  KeyOutlined,
  LockOutlined,
  UnlockOutlined,
  PoweroffOutlined,
  RocketOutlined,
  BugOutlined,
  ExperimentOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  HeatMapOutlined,
  PartitionOutlined,
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  LaptopOutlined,
  ServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CodeOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  UserOutlined,
  TeamOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  TrophyOutlined,
  StarOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  FileMarkdownOutlined,
  FileCodeOutlined,
  FileProtectOutlined,
  FileSearchOutlined,
  FileSyncOutlined,
  FileExclamationOutlined,
  FileDoneOutlined,
  FileAddOutlined,
  FileRemoveOutlined,
  FileJpgOutlined,
  FilePngOutlined,
  FileGifOutlined,
  FileBmpOutlined,
  FileTiffOutlined,
  FileSvgOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  ScheduleOutlined,
  NotificationOutlined,
  SoundOutlined,
  BellOutlined,
  GatewayOutlined,
  ControlOutlined,
  BranchesOutlined,
  AuditOutlined,
  HistoryOutlined,
  DashboardOutlined,
  BankOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  PictureOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [deviceGroups, setDeviceGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [form] = Form.useForm();
  const [groupForm] = Form.useForm();
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedDeviceDetail, setSelectedDeviceDetail] = useState(null);
  const [commandModalVisible, setCommandModalVisible] = useState(false);
  const [commandForm] = Form.useForm();
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('ascend');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 設備統計數據
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    maintenance: 0,
    groups: 0
  });

  useEffect(() => {
    fetchDevices();
    fetchDeviceGroups();
    fetchStats();
  }, []);

  // 獲取設備列表
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/devices/');
      setDevices(response.data);
      setPagination(prev => ({ ...prev, total: response.data.length }));
    } catch (error) {
      message.error('獲取設備列表失敗');
    } finally {
      setLoading(false);
    }
  };

  // 獲取設備分組
  const fetchDeviceGroups = async () => {
    try {
      const response = await axios.get('http://localhost:8000/groups/');
      setDeviceGroups(response.data);
    } catch (error) {
      console.log('獲取設備分組失敗');
    }
  };

  // 獲取統計數據
  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/devices/');
      const devices = response.data;
      const stats = {
        total: devices.length,
        online: devices.filter(d => d.status === 'online').length,
        offline: devices.filter(d => d.status === 'offline').length,
        maintenance: devices.filter(d => d.status === 'maintenance').length,
        groups: deviceGroups.length
      };
      setStats(stats);
    } catch (error) {
      console.log('獲取統計數據失敗');
    }
  };

  // 新增設備
  const handleAddDevice = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/devices/', values);
      message.success('設備新增成功');
      setModalVisible(false);
      form.resetFields();
      fetchDevices();
      fetchStats();
    } catch (error) {
      message.error('設備新增失敗');
    } finally {
      setLoading(false);
    }
  };

  // 編輯設備
  const handleEditDevice = async (values) => {
    try {
      setLoading(true);
      const response = await axios.patch(`http://localhost:8000/devices/${selectedDevice.id}`, values);
      message.success('設備更新成功');
      setModalVisible(false);
      form.resetFields();
      setSelectedDevice(null);
      fetchDevices();
      fetchStats();
    } catch (error) {
      message.error('設備更新失敗');
    } finally {
      setLoading(false);
    }
  };

  // 刪除設備
  const handleDeleteDevice = async (deviceId) => {
    try {
      await axios.delete(`http://localhost:8000/devices/${deviceId}`);
      message.success('設備刪除成功');
      fetchDevices();
      fetchStats();
    } catch (error) {
      message.error('設備刪除失敗');
    }
  };

  // 批量刪除設備
  const handleBatchDelete = async () => {
    try {
      setLoading(true);
      for (const deviceId of selectedDeviceIds) {
        await axios.delete(`http://localhost:8000/devices/${deviceId}`);
      }
      message.success(`成功刪除 ${selectedDeviceIds.length} 個設備`);
      setBatchModalVisible(false);
      setSelectedDeviceIds([]);
      fetchDevices();
      fetchStats();
    } catch (error) {
      message.error('批量刪除失敗');
    } finally {
      setLoading(false);
    }
  };

  // 發送設備命令
  const handleSendCommand = async (values) => {
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
      setSelectedDevice(null);
    } catch (error) {
      message.error('命令發送失敗');
    } finally {
      setLoading(false);
    }
  };

  // 新增設備分組
  const handleAddGroup = async (values) => {
    try {
      const response = await axios.post('http://localhost:8000/groups/', values);
      message.success('設備分組新增成功');
      setGroupModalVisible(false);
      groupForm.resetFields();
      fetchDeviceGroups();
      fetchStats();
    } catch (error) {
      message.error('設備分組新增失敗');
    }
  };

  // 設備狀態切換
  const handleStatusToggle = async (deviceId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8000/devices/${deviceId}`, {
        status: newStatus
      });
      message.success('設備狀態更新成功');
      fetchDevices();
      fetchStats();
    } catch (error) {
      message.error('設備狀態更新失敗');
    }
  };

  // 設備註冊
  const handleRegisterDevice = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/devices/register', {
        device_name: values.name,
        device_type: values.device_type,
        api_key: values.api_key,
        location: values.location
      });
      message.success('設備註冊成功');
      setModalVisible(false);
      form.resetFields();
      fetchDevices();
      fetchStats();
    } catch (error) {
      message.error('設備註冊失敗');
    } finally {
      setLoading(false);
    }
  };

  // 匯出設備數據
  const handleExportDevices = () => {
    const data = devices.map(device => ({
      設備名稱: device.name,
      設備類型: device.device_type,
      狀態: device.status,
      位置: device.location,
      分組: device.group,
      韌體版本: device.firmware_version,
      最後心跳: device.last_heartbeat
    }));

    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "devices.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('設備數據匯出成功');
  };

  // 匯入設備數據
  const handleImportDevices = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const devices = [];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i]) {
            const values = lines[i].split(',');
            const device = {};
            headers.forEach((header, index) => {
              device[header.trim()] = values[index]?.trim();
            });
            devices.push(device);
          }
        }

        // 這裡可以批量新增設備
        message.success(`成功匯入 ${devices.length} 個設備`);
        fetchDevices();
      } catch (error) {
        message.error('匯入失敗：檔案格式錯誤');
      }
    };
    reader.readAsText(file);
  };

  // 設備搜索和過濾
  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         device.location.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    const matchesGroup = filterGroup === 'all' || device.group === filterGroup;
    return matchesSearch && matchesStatus && matchesGroup;
  });

  // 排序設備
  const sortedDevices = [...filteredDevices].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (sortOrder === 'ascend') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // 表格列定義
  const columns = [
    {
      title: '設備名稱',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text, record) => (
        <Space>
          <Avatar icon={<DesktopOutlined />} />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '設備類型',
      dataIndex: 'device_type',
      key: 'device_type',
      render: (text) => (
        <Tag color={text === 'sensor' ? 'blue' : text === 'actuator' ? 'green' : 'orange'}>
          {text}
        </Tag>
      )
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'online' ? 'success' : status === 'offline' ? 'error' : 'warning'} 
          text={status} 
        />
      )
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
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
      render: (date) => date ? new Date(date).toLocaleString() : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedDeviceDetail(record);
              setDetailDrawerVisible(true);
            }}
          >
            詳情
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedDevice(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            編輯
          </Button>
          <Button 
            type="link" 
            icon={<ThunderboltOutlined />}
            onClick={() => {
              setSelectedDevice(record);
              setCommandModalVisible(true);
            }}
          >
            控制
          </Button>
          <Popconfirm
            title="確定要刪除此設備嗎？"
            onConfirm={() => handleDeleteDevice(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              刪除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 獲取狀態顏色
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'green';
      case 'offline': return 'red';
      case 'maintenance': return 'orange';
      default: return 'default';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 統計卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="總設備數"
              value={stats.total}
              prefix={<DesktopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在線設備"
              value={stats.online}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="離線設備"
              value={stats.offline}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="維護中"
              value={stats.maintenance}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作按鈕 */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedDevice(null);
                  form.resetFields();
                  setModalVisible(true);
                }}
              >
                新增設備
              </Button>
              <Button 
                icon={<TeamOutlined />}
                onClick={() => setGroupModalVisible(true)}
              >
                新增分組
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                onClick={handleExportDevices}
              >
                匯出設備
              </Button>
              <Button 
                icon={<UploadOutlined />}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.csv';
                  input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImportDevices(file);
                    }
                  };
                  input.click();
                }}
              >
                匯入設備
              </Button>
              {selectedDeviceIds.length > 0 && (
                <Button 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => setBatchModalVisible(true)}
                >
                  批量刪除 ({selectedDeviceIds.length})
                </Button>
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              <Input.Search
                placeholder="搜索設備"
                style={{ width: 200 }}
                onSearch={setSearchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                placeholder="狀態過濾"
                style={{ width: 120 }}
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Option value="all">全部狀態</Option>
                <Option value="online">在線</Option>
                <Option value="offline">離線</Option>
                <Option value="maintenance">維護中</Option>
              </Select>
              <Select
                placeholder="分組過濾"
                style={{ width: 120 }}
                value={filterGroup}
                onChange={setFilterGroup}
              >
                <Option value="all">全部分組</Option>
                {deviceGroups.map(group => (
                  <Option key={group.id} value={group.id}>{group.name}</Option>
                ))}
              </Select>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchDevices();
                  fetchDeviceGroups();
                  fetchStats();
                }}
              >
                重新載入
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 設備表格 */}
      <Card title="設備列表">
        <Table
          columns={columns}
          dataSource={sortedDevices}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
          }}
          onChange={(pagination, filters, sorter) => {
            setPagination(pagination);
            setSortField(sorter.field);
            setSortOrder(sorter.order);
          }}
          rowSelection={{
            selectedRowKeys: selectedDeviceIds,
            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedDeviceIds(selectedRowKeys);
            }
          }}
        />
      </Card>

      {/* 新增/編輯設備模態框 */}
      <Modal
        title={selectedDevice ? '編輯設備' : '新增設備'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={selectedDevice ? handleEditDevice : handleAddDevice}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="設備名稱"
                rules={[{ required: true, message: '請輸入設備名稱' }]}
              >
                <Input placeholder="請輸入設備名稱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="device_type"
                label="設備類型"
                rules={[{ required: true, message: '請選擇設備類型' }]}
              >
                <Select placeholder="請選擇設備類型">
                  <Option value="sensor">感測器</Option>
                  <Option value="actuator">執行器</Option>
                  <Option value="controller">控制器</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="設備位置"
                rules={[{ required: true, message: '請輸入設備位置' }]}
              >
                <Input placeholder="請輸入設備位置" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="group"
                label="設備分組"
              >
                <Select placeholder="請選擇設備分組" allowClear>
                  {deviceGroups.map(group => (
                    <Option key={group.id} value={group.id}>{group.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firmware_version"
                label="韌體版本"
              >
                <Input placeholder="請輸入韌體版本" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="設備狀態"
              >
                <Select placeholder="請選擇設備狀態">
                  <Option value="online">在線</Option>
                  <Option value="offline">離線</Option>
                  <Option value="maintenance">維護中</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="tags"
            label="設備標籤"
          >
            <Input placeholder="請輸入設備標籤，用逗號分隔" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedDevice ? '更新' : '新增'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 設備分組模態框 */}
      <Modal
        title="新增設備分組"
        open={groupModalVisible}
        onCancel={() => setGroupModalVisible(false)}
        footer={null}
        width={400}
      >
        <Form
          form={groupForm}
          layout="vertical"
          onFinish={handleAddGroup}
        >
          <Form.Item
            name="name"
            label="分組名稱"
            rules={[{ required: true, message: '請輸入分組名稱' }]}
          >
            <Input placeholder="請輸入分組名稱" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                新增
              </Button>
              <Button onClick={() => setGroupModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 設備控制模態框 */}
      <Modal
        title="設備控制"
        open={commandModalVisible}
        onCancel={() => setCommandModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={commandForm}
          layout="vertical"
          onFinish={handleSendCommand}
        >
          <Form.Item
            name="command_type"
            label="命令類型"
            rules={[{ required: true, message: '請選擇命令類型' }]}
          >
            <Select placeholder="請選擇命令類型">
              <Option value="restart">重啟設備</Option>
              <Option value="update_config">更新配置</Option>
              <Option value="control">控制操作</Option>
              <Option value="status_query">狀態查詢</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="parameters"
            label="命令參數"
          >
            <TextArea 
              rows={4} 
              placeholder="請輸入 JSON 格式的命令參數，例如：{'key': 'value'}"
            />
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

      {/* 批量刪除確認模態框 */}
      <Modal
        title="批量刪除確認"
        open={batchModalVisible}
        onCancel={() => setBatchModalVisible(false)}
        onOk={handleBatchDelete}
        okText="確認刪除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>確定要刪除選中的 {selectedDeviceIds.length} 個設備嗎？此操作無法撤銷。</p>
      </Modal>

      {/* 設備詳情抽屜 */}
      <Drawer
        title="設備詳情"
        placement="right"
        width={600}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedDeviceDetail && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="設備名稱">{selectedDeviceDetail.name}</Descriptions.Item>
              <Descriptions.Item label="設備類型">{selectedDeviceDetail.device_type}</Descriptions.Item>
              <Descriptions.Item label="設備狀態">
                <Badge 
                  status={getStatusColor(selectedDeviceDetail.status)} 
                  text={selectedDeviceDetail.status} 
                />
              </Descriptions.Item>
              <Descriptions.Item label="設備位置">{selectedDeviceDetail.location}</Descriptions.Item>
              <Descriptions.Item label="韌體版本">{selectedDeviceDetail.firmware_version}</Descriptions.Item>
              <Descriptions.Item label="最後心跳">
                {selectedDeviceDetail.last_heartbeat ? new Date(selectedDeviceDetail.last_heartbeat).toLocaleString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="設備標籤">{selectedDeviceDetail.tags}</Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Card title="設備控制" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleStatusToggle(selectedDeviceDetail.id, 'online')}
                  disabled={selectedDeviceDetail.status === 'online'}
                >
                  啟用設備
                </Button>
                <Button 
                  icon={<PauseCircleOutlined />}
                  onClick={() => handleStatusToggle(selectedDeviceDetail.id, 'maintenance')}
                  disabled={selectedDeviceDetail.status === 'maintenance'}
                >
                  維護模式
                </Button>
                <Button 
                  danger 
                  icon={<StopOutlined />}
                  onClick={() => handleStatusToggle(selectedDeviceDetail.id, 'offline')}
                  disabled={selectedDeviceDetail.status === 'offline'}
                >
                  停用設備
                </Button>
              </Space>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default DeviceManagement;