import React, { useState, useEffect } from 'react';
import { InputNumber } from 'antd';
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
  message,
  Alert,
  Switch,
  Typography,
  Divider,
  Tabs,
  Tooltip,
  Popconfirm,
  Badge
} from 'antd';
import {
  TableOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ColumnHeightOutlined,
  DatabaseOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const TableSchemaManagement = () => {
  const [schemas, setSchemas] = useState([]);
  const [connections, setConnections] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [columnModalVisible, setColumnModalVisible] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [form] = Form.useForm();
  const [columnForm] = Form.useForm();

  useEffect(() => {
    fetchSchemas();
    fetchConnections();
  }, []);

  const fetchSchemas = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/table-schemas/');
      setSchemas(response.data);
    } catch (error) {
      message.error('獲取資料表配置失敗');
      console.error('Error fetching schemas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await axios.get('http://localhost:8000/database-connections/');
      setConnections(response.data);
    } catch (error) {
      message.error('獲取資料庫連線失敗');
    }
  };

  const fetchColumns = async (tableId) => {
    try {
      const response = await axios.get(`http://localhost:8000/table-columns/${tableId}`);
      setColumns(response.data);
    } catch (error) {
      message.error('獲取欄位配置失敗');
    }
  };

  const createSchema = async (values) => {
    try {
      setLoading(true);
      
      if (selectedSchema) {
        await axios.patch(`http://localhost:8000/table-schemas/${selectedSchema.id}`, values);
        message.success('資料表配置更新成功');
      } else {
        await axios.post('http://localhost:8000/table-schemas/', values);
        message.success('資料表配置創建成功');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchSchemas();
    } catch (error) {
      message.error('操作失敗: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const deleteSchema = async (schemaId) => {
    try {
      await axios.delete(`http://localhost:8000/table-schemas/${schemaId}`);
      message.success('資料表配置刪除成功');
      fetchSchemas();
    } catch (error) {
      message.error('刪除失敗: ' + (error.response?.data?.detail || error.message));
    }
  };

  const createColumn = async (values) => {
    try {
      setLoading(true);
      await axios.post('http://localhost:8000/table-columns/', {
        ...values,
        table_id: selectedTableId
      });
      message.success('欄位配置創建成功');
      setColumnModalVisible(false);
      columnForm.resetFields();
      fetchColumns(selectedTableId);
    } catch (error) {
      message.error('創建欄位失敗: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const deleteColumn = async (columnId) => {
    try {
      await axios.delete(`http://localhost:8000/table-columns/${columnId}`);
      message.success('欄位配置刪除成功');
      fetchColumns(selectedTableId);
    } catch (error) {
      message.error('刪除欄位失敗: ' + (error.response?.data?.detail || error.message));
    }
  };

  const schemaColumns = [
    {
      title: '資料表名稱',
      dataIndex: 'table_name',
      key: 'table_name',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: '顯示名稱',
      dataIndex: 'display_name',
      key: 'display_name',
    },
    {
      title: '資料庫連線',
      dataIndex: 'db_connection_id',
      key: 'db_connection_id',
      render: (connectionId) => {
        const connection = connections.find(c => c.id === connectionId);
        return connection ? (
          <Space>
            <Tag color="blue">{connection.name}</Tag>
            <Tag color="green">{connection.db_type}</Tag>
          </Space>
        ) : `連線 ${connectionId}`;
      }
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Badge 
          status={active ? 'success' : 'error'} 
          text={active ? '啟用' : '停用'} 
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="管理欄位">
            <Button
              size="small"
              icon={<ColumnHeightOutlined />}
              onClick={() => {
                setSelectedTableId(record.id);
                fetchColumns(record.id);
              }}
            >
              欄位
            </Button>
          </Tooltip>
          <Tooltip title="編輯配置">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedSchema(record);
                setModalVisible(true);
                form.setFieldsValue(record);
              }}
            >
              編輯
            </Button>
          </Tooltip>
          <Popconfirm
            title="確定要刪除此資料表配置嗎？"
            description="此操作無法復原"
            onConfirm={() => deleteSchema(record.id)}
            okText="確定"
            cancelText="取消"
          >
            <Tooltip title="刪除配置">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              >
                刪除
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columnColumns = [
    {
      title: '欄位名稱',
      dataIndex: 'column_name',
      key: 'column_name',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: '顯示名稱',
      dataIndex: 'display_name',
      key: 'display_name',
    },
    {
      title: '資料類型',
      dataIndex: 'data_type',
      key: 'data_type',
      render: (type) => <Tag color="blue">{type.toUpperCase()}</Tag>,
    },
    {
      title: '長度',
      dataIndex: 'length',
      key: 'length',
      render: (length) => length || '-',
    },
    {
      title: '可為空',
      dataIndex: 'is_nullable',
      key: 'is_nullable',
      render: (nullable) => (
        <Badge 
          status={nullable ? 'success' : 'error'} 
          text={nullable ? '是' : '否'} 
        />
      ),
    },
    {
      title: '主鍵',
      dataIndex: 'is_primary_key',
      key: 'is_primary_key',
      render: (isPrimary) => isPrimary ? <Tag color="blue">是</Tag> : '-',
    },
    {
      title: '索引',
      dataIndex: 'is_index',
      key: 'is_index',
      render: (isIndex) => isIndex ? <Tag color="orange">是</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="確定要刪除此欄位嗎？"
          description="此操作無法復原"
          onConfirm={() => deleteColumn(record.id)}
          okText="確定"
          cancelText="取消"
        >
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
          >
            刪除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const schemaStats = {
    total: schemas.length,
    active: schemas.filter(s => s.is_active).length,
    totalColumns: columns.length,
    connections: connections.length,
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <TableOutlined />
                <span>資料表設定管理</span>
              </Space>
            }
            extra={
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchSchemas}
                  loading={loading}
                >
                  重新整理
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => {
                    setSelectedSchema(null);
                    setModalVisible(true);
                    form.resetFields();
                  }}
                >
                  新增資料表
                </Button>
              </Space>
            }
          >
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Statistic
                  title="總資料表數"
                  value={schemaStats.total}
                  prefix={<TableOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="啟用資料表"
                  value={schemaStats.active}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="總欄位數"
                  value={schemaStats.totalColumns}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="資料庫連線"
                  value={schemaStats.connections}
                  prefix={<DatabaseOutlined />}
                />
              </Col>
            </Row>

            {schemas.length === 0 && (
              <Alert
                message="尚未建立任何資料表配置"
                description="點擊「新增資料表」按鈕來建立第一個資料表配置"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Tabs defaultActiveKey="schemas">
              <TabPane tab="資料表列表" key="schemas">
                <Table
                  dataSource={schemas}
                  columns={schemaColumns}
                  rowKey="id"
                  loading={loading}
                  size="small"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
                  }}
                />
              </TabPane>
              <TabPane tab="欄位配置" key="columns">
                {selectedTableId ? (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <Space>
                        <Text strong>
                          資料表: {schemas.find(s => s.id === selectedTableId)?.display_name}
                        </Text>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => setColumnModalVisible(true)}
                        >
                          新增欄位
                        </Button>
                      </Space>
                    </div>
                    <Table
                      dataSource={columns}
                      columns={columnColumns}
                      rowKey="id"
                      size="small"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true
                      }}
                    />
                  </div>
                ) : (
                  <Alert
                    message="請選擇資料表"
                    description="在資料表列表中點擊「欄位」按鈕來管理該資料表的欄位配置"
                    type="info"
                    showIcon
                  />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* 資料表配置模態框 */}
      <Modal
        title={
          <Space>
            <SettingOutlined />
            {selectedSchema ? "編輯資料表配置" : "新增資料表配置"}
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          onFinish={createSchema}
          layout="vertical"
          initialValues={{
            is_active: true
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="資料表名稱"
                name="table_name"
                rules={[{ required: true, message: '請輸入資料表名稱' }]}
              >
                <Input placeholder="例如: devices" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="顯示名稱"
                name="display_name"
                rules={[{ required: true, message: '請輸入顯示名稱' }]}
              >
                <Input placeholder="例如: 設備資料表" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="資料庫連線"
            name="db_connection_id"
            rules={[{ required: true, message: '請選擇資料庫連線' }]}
          >
            <Select placeholder="選擇資料庫連線">
              {connections.map(connection => (
                <Option key={connection.id} value={connection.id}>
                  {connection.name} ({connection.db_type})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea rows={3} placeholder="資料表描述" />
          </Form.Item>

          <Form.Item
            label="啟用"
            name="is_active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider />

          <Alert
            message="配置說明"
            description={
              <div>
                <Paragraph>
                  <Text strong>資料表名稱:</Text> 在資料庫中的實際表名，建議使用小寫字母和下劃線
                </Paragraph>
                <Paragraph>
                  <Text strong>顯示名稱:</Text> 在介面中顯示的名稱，可以使用中文
                </Paragraph>
                <Paragraph>
                  <Text strong>資料庫連線:</Text> 選擇此資料表所屬的資料庫連線
                </Paragraph>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedSchema ? '更新配置' : '創建配置'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 欄位配置模態框 */}
      <Modal
        title={
          <Space>
            <ColumnHeightOutlined />
            新增欄位配置
          </Space>
        }
        open={columnModalVisible}
        onCancel={() => setColumnModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={columnForm}
          onFinish={createColumn}
          layout="vertical"
          initialValues={{
            is_nullable: true,
            is_primary_key: false,
            is_index: false,
            order_index: 0
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="欄位名稱"
                name="column_name"
                rules={[{ required: true, message: '請輸入欄位名稱' }]}
              >
                <Input placeholder="例如: device_name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="顯示名稱"
                name="display_name"
                rules={[{ required: true, message: '請輸入顯示名稱' }]}
              >
                <Input placeholder="例如: 設備名稱" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="資料類型"
                name="data_type"
                rules={[{ required: true, message: '請選擇資料類型' }]}
              >
                <Select placeholder="選擇資料類型">
                  <Option value="varchar">VARCHAR</Option>
                  <Option value="int">INT</Option>
                  <Option value="float">FLOAT</Option>
                  <Option value="datetime">DATETIME</Option>
                  <Option value="boolean">BOOLEAN</Option>
                  <Option value="text">TEXT</Option>
                  <Option value="json">JSON</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="長度"
                name="length"
              >
                <InputNumber placeholder="欄位長度" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="可為空"
                name="is_nullable"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="主鍵"
                name="is_primary_key"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="索引"
                name="is_index"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="預設值"
            name="default_value"
          >
            <Input placeholder="欄位預設值" />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea rows={2} placeholder="欄位描述" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                創建欄位
              </Button>
              <Button onClick={() => setColumnModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TableSchemaManagement; 