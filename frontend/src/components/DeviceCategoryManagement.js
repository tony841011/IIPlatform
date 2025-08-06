import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Space,
  Card,
  Row,
  Col,
  Tree,
  Tag,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  TagOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const DeviceCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  // 預設顏色選項
  const colorOptions = [
    { label: '藍色', value: '#1890ff' },
    { label: '綠色', value: '#52c41a' },
    { label: '紅色', value: '#f5222d' },
    { label: '橙色', value: '#fa8c16' },
    { label: '紫色', value: '#722ed1' },
    { label: '青色', value: '#13c2c2' },
    { label: '粉色', value: '#eb2f96' },
    { label: '灰色', value: '#8c8c8c' }
  ];

  // 預設圖示選項
  const iconOptions = [
    { label: '資料夾', value: 'folder' },
    { label: '標籤', value: 'tag' },
    { label: '感測器', value: 'sensor' },
    { label: '控制器', value: 'controller' },
    { label: '執行器', value: 'actuator' },
    { label: '監控', value: 'monitor' },
    { label: '警報', value: 'alert' },
    { label: '設定', value: 'setting' }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const [categoriesRes, treeRes] = await Promise.all([
        axios.get('http://localhost:8000/device-categories/'),
        axios.get('http://localhost:8000/device-categories/tree')
      ]);
      
      setCategories(categoriesRes.data);
      setCategoryTree(treeRes.data);
    } catch (error) {
      message.error('獲取設備類別失敗');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

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

  const handleDelete = async (categoryId) => {
    try {
      await axios.delete(`http://localhost:8000/device-categories/${categoryId}`);
      message.success('設備類別刪除成功');
      fetchCategories();
    } catch (error) {
      message.error('刪除失敗');
      console.error('Error deleting category:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      if (editingCategory) {
        await axios.patch(`http://localhost:8000/device-categories/${editingCategory.id}`, values);
        message.success('設備類別更新成功');
      } else {
        await axios.post('http://localhost:8000/device-categories/', values);
        message.success('設備類別創建成功');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      message.error('操作失敗');
      console.error('Error submitting category:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      folder: <FolderOutlined />,
      tag: <TagOutlined />,
      sensor: <TagOutlined />,
      controller: <TagOutlined />,
      actuator: <TagOutlined />,
      monitor: <TagOutlined />,
      alert: <TagOutlined />,
      setting: <TagOutlined />
    };
    return iconMap[iconName] || <TagOutlined />;
  };

  const columns = [
    {
      title: '類別名稱',
      dataIndex: 'display_name',
      key: 'display_name',
      render: (text, record) => (
        <Space>
          {getIconComponent(record.icon)}
          <span style={{ color: record.color }}>{text}</span>
          {record.is_system && <Tag color="blue">系統</Tag>}
        </Space>
      )
    },
    {
      title: '代碼',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <code>{text}</code>
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '子類別',
      dataIndex: 'children_count',
      key: 'children_count',
      render: (count) => count || 0
    },
    {
      title: '設備數量',
      dataIndex: 'devices_count',
      key: 'devices_count',
      render: (count) => count || 0
    },
    {
      title: '排序',
      dataIndex: 'order_index',
      key: 'order_index',
      width: 80
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
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="編輯">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={record.is_system}
            />
          </Tooltip>
          <Popconfirm
            title="確定要刪除此類別嗎？"
            description="刪除後無法恢復，且會影響相關設備。"
            onConfirm={() => handleDelete(record.id)}
            okText="確定"
            cancelText="取消"
            disabled={record.is_system || record.children_count > 0 || record.devices_count > 0}
          >
            <Tooltip title="刪除">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                disabled={record.is_system || record.children_count > 0 || record.devices_count > 0}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const renderTreeNodes = (nodes) => {
    return nodes.map(node => ({
      title: (
        <Space>
          {getIconComponent(node.icon)}
          <span style={{ color: node.color }}>{node.display_name}</span>
          {node.is_system && <Tag color="blue" size="small">系統</Tag>}
          <Tag size="small">{node.children_count} 子類別</Tag>
          <Tag size="small">{node.devices_count} 設備</Tag>
        </Space>
      ),
      key: node.id,
      children: node.children.length > 0 ? renderTreeNodes(node.children) : undefined
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
            onClick={handleCreate}
          >
            新增類別
          </Button>
        }
      >
        <Row gutter={24}>
          <Col span={12}>
            <Card title="類別列表" size="small">
              <Table
                columns={columns}
                dataSource={categories}
                rowKey="id"
                loading={loading}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="類別樹狀結構" size="small">
              <Tree
                treeData={renderTreeNodes(categoryTree)}
                defaultExpandAll
                showLine
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <Modal
        title={editingCategory ? '編輯設備類別' : '新增設備類別'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            is_active: true,
            order_index: 0
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="類別代碼"
                rules={[
                  { required: true, message: '請輸入類別代碼' },
                  { pattern: /^[a-zA-Z0-9_-]+$/, message: '只能包含字母、數字、下劃線和連字符' }
                ]}
              >
                <Input placeholder="例如：sensor, controller" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="display_name"
                label="顯示名稱"
                rules={[{ required: true, message: '請輸入顯示名稱' }]}
              >
                <Input placeholder="例如：感測器、控制器" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="請輸入類別描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="icon"
                label="圖示"
              >
                <Select placeholder="選擇圖示">
                  {iconOptions.map(icon => (
                    <Option key={icon.value} value={icon.value}>
                      {icon.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="color"
                label="顏色"
              >
                <Select placeholder="選擇顏色">
                  {colorOptions.map(color => (
                    <Option key={color.value} value={color.value}>
                      <Space>
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            backgroundColor: color.value,
                            borderRadius: 2
                          }}
                        />
                        {color.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="parent_id"
                label="父類別"
              >
                <Select
                  placeholder="選擇父類別"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {categories
                    .filter(cat => cat.id !== editingCategory?.id)
                    .map(cat => (
                      <Option key={cat.id} value={cat.id}>
                        {cat.display_name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="order_index"
                label="排序"
              >
                <Input type="number" placeholder="數字越小越靠前" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="is_active"
            label="狀態"
            valuePropName="checked"
          >
            <Select>
              <Option value={true}>啟用</Option>
              <Option value={false}>停用</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCategory ? '更新' : '創建'}
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

export default DeviceCategoryManagement; 