import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Tag, 
  Card, 
  Row, 
  Col,
  message,
  Popconfirm,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';

const { Option } = Select;

const DeviceManagement = () => {
  const [devices, setDevices] = useState([
    {
      id: 1,
      name: '溫度感測器-01',
      type: 'sensor',
      category: '溫度感測器',
      location: '生產線A',
      status: 'online',
      ip: '192.168.1.100',
      lastUpdate: '2024-01-15 14:30:00',
      description: '監控生產線溫度'
    },
    {
      id: 2,
      name: '壓力計-02',
      type: 'sensor',
      category: '壓力感測器',
      location: '生產線B',
      status: 'offline',
      ip: '192.168.1.101',
      lastUpdate: '2024-01-15 13:45:00',
      description: '監控系統壓力'
    },
    {
      id: 3,
      name: '控制閥-01',
      type: 'controller',
      category: '控制閥',
      location: '生產線A',
      status: 'online',
      ip: '192.168.1.102',
      lastUpdate: '2024-01-15 14:28:00',
      description: '自動控制流量'
    }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '設備名稱',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'sensor' ? 'blue' : 'green'}>
          {type === 'sensor' ? '感測器' : '控制器'}
        </Tag>
      ),
      filters: [
        { text: '感測器', value: 'sensor' },
        { text: '控制器', value: 'controller' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '類別',
      dataIndex: 'category',
      key: 'category',
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
        <Tag color={status === 'online' ? 'green' : 'red'}>
          {status === 'online' ? '在線' : '離線'}
        </Tag>
      ),
      filters: [
        { text: '在線', value: 'online' },
        { text: '離線', value: 'offline' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'IP 地址',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: '最後更新',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      sorter: (a, b) => new Date(a.lastUpdate) - new Date(b.lastUpdate),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="查看詳情">
            <Button type="text" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="編輯">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="刪除">
            <Popconfirm
              title="確定要刪除此設備嗎？"
              onConfirm={() => handleDelete(record.id)}
              okText="確定"
              cancelText="取消"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingDevice(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (device) => {
    setEditingDevice(device);
    form.setFieldsValue(device);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    setDevices(devices.filter(device => device.id !== id));
    message.success('設備刪除成功');
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (editingDevice) {
        // 編輯現有設備
        setDevices(devices.map(device => 
          device.id === editingDevice.id 
            ? { ...device, ...values, lastUpdate: new Date().toLocaleString() }
            : device
        ));
        message.success('設備更新成功');
      } else {
        // 新增設備
        const newDevice = {
          id: Math.max(...devices.map(d => d.id)) + 1,
          ...values,
          status: 'online',
          lastUpdate: new Date().toLocaleString()
        };
        setDevices([...devices, newDevice]);
        message.success('設備新增成功');
      }
      setModalVisible(false);
    });
  };

  return (
    <div>
      <Card title="設備管理">
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={16}>
            <Space>
              <Input.Search
                placeholder="搜尋設備"
                style={{ width: 300 }}
                onSearch={(value) => console.log('搜尋:', value)}
              />
              <Button icon={<FilterOutlined />}>
                篩選
              </Button>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增設備
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={devices}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
          }}
        />
      </Card>

      <Modal
        title={editingDevice ? '編輯設備' : '新增設備'}
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
                label="設備名稱"
                rules={[{ required: true, message: '請輸入設備名稱' }]}
              >
                <Input placeholder="請輸入設備名稱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="設備類型"
                rules={[{ required: true, message: '請選擇設備類型' }]}
              >
                <Select placeholder="請選擇設備類型">
                  <Option value="sensor">感測器</Option>
                  <Option value="controller">控制器</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="設備類別"
                rules={[{ required: true, message: '請輸入設備類別' }]}
              >
                <Input placeholder="請輸入設備類別" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="安裝位置"
                rules={[{ required: true, message: '請輸入安裝位置' }]}
              >
                <Input placeholder="請輸入安裝位置" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ip"
                label="IP 地址"
                rules={[
                  { required: true, message: '請輸入IP地址' },
                  { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: '請輸入有效的IP地址' }
                ]}
              >
                <Input placeholder="192.168.1.100" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="狀態"
              >
                <Select placeholder="請選擇狀態">
                  <Option value="online">在線</Option>
                  <Option value="offline">離線</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="請輸入設備描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeviceManagement;