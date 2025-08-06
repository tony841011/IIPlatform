import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Card,
  Tag,
  Tooltip,
  Switch,
  TreeSelect,
  ColorPicker
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const DeviceCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('正在獲取設備類別列表...');
      
      const response = await axios.get('http://localhost:8000/device-categories/');
      console.log('獲取設備類別列表成功:', response.data);
      
      setCategories(response.data);
    } catch (error) {
      console.error('獲取設備類別列表失敗:', error);
      let errorMessage = '獲取設備類別列表失敗';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (values) => {
    try {
      setLoading(true);
      console.log('正在創建設備類別:', values);
      
      const response = await axios.post('http://localhost:8000/device-categories/', values);
      console.log('創建設備類別成功:', response.data);
      
      message.success('設備類別創建成功');
      setModalVisible(false);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      console.error('創建設備類別失敗:', error);
      
      let errorMessage = '創建設備類別失敗';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = '無法連接到伺服器，請檢查網路連線';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (categoryId, values) => {
    try {
      setLoading(true);
      console.log('正在更新設備類別:', categoryId, values);
      
      const response = await axios.patch(`http://localhost:8000/device-categories/${categoryId}`, values);
      console.log('更新設備類別成功:', response.data);
      
      message.success('設備類別更新成功');
      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      console.error('更新設備類別失敗:', error);
      
      let errorMessage = '更新設備類別失敗';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      setLoading(true);
      
      await axios.delete(`http://localhost:8000/device-categories/${categoryId}`);
      message.success('設備類別刪除成功');
      fetchCategories();
    } catch (error) {
      console.error('刪除設備類別失敗:', error);
      
      let errorMessage = '刪除設備類別失敗';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '類別名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <TagOutlined />
          <span>{text}</span>
          {record.is_system && <Tag color="blue">系統</Tag>}
        </Space>
      )
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
      render: (text) => text || '-'
    },
    {
      title: '圖示',
      dataIndex: 'icon',
      key: 'icon',
      render: (icon) => icon ? <Tag>{icon}</Tag> : '-'
    },
    {
      title: '顏色',
      dataIndex: 'color',
      key: 'color',
      render: (color) => color ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div 
            style={{ 
              width: 16, 
              height: 16, 
              backgroundColor: color, 
              borderRadius: 2,
              marginRight: 8
            }} 
          />
          <span>{color}</span>
        </div>
      ) : '-'
    },
    {
      title: '父類別',
      dataIndex: 'parent_name',
      key: 'parent_name',
      render: (text) => text || '-'
    },
    {
      title: '排序',
      dataIndex: 'order_index',
      key: 'order_index',
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? '啟用' : '停用'}
        </Tag>
      )
    },
    {
      title: '設備數量',
      dataIndex: 'devices_count',
      key: 'devices_count',
      render: (count) => count || 0
    },
    {
      title: '子類別數量',
      dataIndex: 'children_count',
      key: 'children_count',
      render: (count) => count || 0
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="編輯">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="刪除">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteCategory(record.id)}
              disabled={record.is_system}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      display_name: category.display_name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      parent_id: category.parent_id,
      order_index: category.order_index,
      is_active: category.is_active
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    if (editingCategory) {
      await handleUpdateCategory(editingCategory.id, values);
    } else {
      await handleCreateCategory(values);
    }
  };

  // 構建樹形選擇器的選項
  const buildTreeData = (categories, parentId = null) => {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .map(cat => ({
        title: cat.display_name,
        value: cat.id,
        children: buildTreeData(categories, cat.id)
      }));
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="設備類別管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCategory(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新增類別
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 個類別`
          }}
        />
      </Card>

      <Modal
        title={editingCategory ? '編輯設備類別' : '新增設備類別'}
        open={modalVisible}
        onOk={form.submit}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="類別名稱"
            rules={[{ required: true, message: '請輸入類別名稱' }]}
          >
            <Input placeholder="請輸入類別名稱" />
          </Form.Item>

          <Form.Item
            name="display_name"
            label="顯示名稱"
            rules={[{ required: true, message: '請輸入顯示名稱' }]}
          >
            <Input placeholder="請輸入顯示名稱" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea
              placeholder="請輸入類別描述"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="icon"
            label="圖示"
          >
            <Input placeholder="請輸入圖示名稱" />
          </Form.Item>

          <Form.Item
            name="color"
            label="顏色"
          >
            <Input placeholder="請輸入顏色代碼，例如: #1890ff" />
          </Form.Item>

          <Form.Item
            name="parent_id"
            label="父類別"
          >
            <TreeSelect
              placeholder="請選擇父類別"
              treeData={buildTreeData(categories)}
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>

          <Form.Item
            name="order_index"
            label="排序索引"
            rules={[{ required: true, message: '請輸入排序索引' }]}
          >
            <Input type="number" placeholder="請輸入排序索引" />
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