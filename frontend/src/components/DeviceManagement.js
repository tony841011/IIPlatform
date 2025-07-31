import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDevices();
    loadGroups();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/devices/');
      setDevices(response.data);
    } catch (error) {
      message.error('載入設備失敗');
    }
  };

  const loadGroups = async () => {
    try {
      const response = await axios.get('http://localhost:8000/groups/');
      setGroups(response.data);
    } catch (error) {
      console.error('載入群組失敗:', error);
    }
  };

  const handleAddDevice = () => {
    setEditingDevice(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditDevice = (record) => {
    setEditingDevice(record);
    form.setFieldsValue({
      name: record.name,
      location: record.location,
      group: record.group,
      tags: record.tags
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingDevice) {
        await axios.patch(`http://localhost:8000/devices/${editingDevice.id}`, values);
        message.success('設備更新成功');
      } else {
        await axios.post('http://localhost:8000/devices/', values);
        message.success('設備新增成功');
      }
      setIsModalVisible(false);
      loadDevices();
    } catch (error) {
      message.error('操作失敗');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
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
      title: '分群',
      dataIndex: 'group',
      key: 'group',
      render: (group) => {
        const groupInfo = groups.find(g => g.id === group);
        return groupInfo ? <Tag color="blue">{groupInfo.name}</Tag> : '-';
      },
    },
    {
      title: '標籤',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => {
        if (!tags) return '-';
        return tags.split(',').map(tag => (
          <Tag key={tag.trim()} color="green">{tag.trim()}</Tag>
        ));
      },
    },
    {
      title: '當前數值',
      dataIndex: 'value',
      key: 'value',
      render: (value) => {
        if (value === undefined) return '-';
        const color = value > 80 ? 'red' : value > 60 ? 'orange' : 'green';
        return <Tag color={color}>{value}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => handleEditDevice(record)}
          >
            編輯
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddDevice}
        >
          新增設備
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={devices}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingDevice ? '編輯設備' : '新增設備'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="設備名稱"
            rules={[{ required: true, message: '請輸入設備名稱' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="location"
            label="位置"
            rules={[{ required: true, message: '請輸入位置' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="group"
            label="分群"
          >
            <Select placeholder="選擇分群" allowClear>
              {groups.map(group => (
                <Select.Option key={group.id} value={group.id}>
                  {group.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tags"
            label="標籤"
          >
            <Input placeholder="用逗號分隔多個標籤" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingDevice ? '更新' : '新增'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeviceManagement; 