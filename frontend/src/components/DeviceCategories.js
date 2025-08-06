import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, message, Space, Card, Tag, Tooltip, Switch, TreeSelect, ColorPicker
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, TagOutlined, EyeOutlined, EyeInvisibleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const DeviceCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '類別名稱',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '顯示名稱',
      dataIndex: 'display_name',
      key: 'display_name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '啟用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            編輯
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            刪除
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '確認刪除',
      content: '確定要刪除此設備類別嗎？',
      onOk: () => {
        // 這裡應該調用 API 刪除
        message.success('刪除成功');
      },
    });
  };

  const handleSubmit = (values) => {
    if (editingCategory) {
      // 更新
      message.success('更新成功');
    } else {
      // 創建
      message.success('創建成功');
    }
    setModalVisible(false);
    form.resetFields();
    setEditingCategory(null);
  };

  return (
    <div>
      <Card
        title="設備類別管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            新增類別
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={categories}
          loading={loading}
          rowKey="id"
        />
      </Card>

      <Modal
        title={editingCategory ? '編輯設備類別' : '新增設備類別'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingCategory(null);
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="類別名稱"
            rules={[{ required: true, message: '請輸入類別名稱' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="display_name"
            label="顯示名稱"
            rules={[{ required: true, message: '請輸入顯示名稱' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="is_active"
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

export default DeviceCategories; 