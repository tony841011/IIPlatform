import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch,
  Statistic,
  Tree,
  Typography,
  Divider,
  Tooltip,
  message
} from 'antd';
import { 
  DatabaseOutlined, 
  TableOutlined, 
  FieldBinaryOutlined,
  KeyOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;
const { DirectoryTree } = Tree;

const TableSchema = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [form] = Form.useForm();

  // 模擬資料庫結構
  const databases = [
    {
      title: 'PostgreSQL',
      key: 'postgresql',
      children: [
        {
          title: 'devices',
          key: 'postgresql_devices',
          children: [
            { title: 'id (INTEGER, PRIMARY KEY)', key: 'devices_id' },
            { title: 'name (VARCHAR(100), NOT NULL)', key: 'devices_name' },
            { title: 'type (VARCHAR(50))', key: 'devices_type' },
            { title: 'status (VARCHAR(20))', key: 'devices_status' },
            { title: 'created_at (TIMESTAMP)', key: 'devices_created_at' }
          ]
        },
        {
          title: 'device_data',
          key: 'postgresql_device_data',
          children: [
            { title: 'id (INTEGER, PRIMARY KEY)', key: 'device_data_id' },
            { title: 'device_id (INTEGER, FOREIGN KEY)', key: 'device_data_device_id' },
            { title: 'value (DECIMAL(10,2))', key: 'device_data_value' },
            { title: 'timestamp (TIMESTAMP)', key: 'device_data_timestamp' }
          ]
        },
        {
          title: 'alerts',
          key: 'postgresql_alerts',
          children: [
            { title: 'id (INTEGER, PRIMARY KEY)', key: 'alerts_id' },
            { title: 'device_id (INTEGER, FOREIGN KEY)', key: 'alerts_device_id' },
            { title: 'type (VARCHAR(50))', key: 'alerts_type' },
            { title: 'severity (VARCHAR(20))', key: 'alerts_severity' },
            { title: 'message (TEXT)', key: 'alerts_message' },
            { title: 'created_at (TIMESTAMP)', key: 'alerts_created_at' }
          ]
        }
      ]
    },
    {
      title: 'MongoDB',
      key: 'mongodb',
      children: [
        {
          title: 'device_logs',
          key: 'mongodb_device_logs',
          children: [
            { title: '_id (ObjectId)', key: 'device_logs_id' },
            { title: 'device_id (String)', key: 'device_logs_device_id' },
            { title: 'log_level (String)', key: 'device_logs_level' },
            { title: 'message (String)', key: 'device_logs_message' },
            { title: 'timestamp (Date)', key: 'device_logs_timestamp' }
          ]
        },
        {
          title: 'analytics_data',
          key: 'mongodb_analytics',
          children: [
            { title: '_id (ObjectId)', key: 'analytics_id' },
            { title: 'metric_name (String)', key: 'analytics_metric' },
            { title: 'value (Number)', key: 'analytics_value' },
            { title: 'tags (Array)', key: 'analytics_tags' },
            { title: 'timestamp (Date)', key: 'analytics_timestamp' }
          ]
        }
      ]
    },
    {
      title: 'InfluxDB',
      key: 'influxdb',
      children: [
        {
          title: 'device_metrics',
          key: 'influxdb_device_metrics',
          children: [
            { title: 'time (Timestamp)', key: 'metrics_time' },
            { title: 'device_id (Tag)', key: 'metrics_device_id' },
            { title: 'temperature (Field)', key: 'metrics_temperature' },
            { title: 'pressure (Field)', key: 'metrics_pressure' },
            { title: 'humidity (Field)', key: 'metrics_humidity' }
          ]
        },
        {
          title: 'system_metrics',
          key: 'influxdb_system_metrics',
          children: [
            { title: 'time (Timestamp)', key: 'system_time' },
            { title: 'host (Tag)', key: 'system_host' },
            { title: 'cpu_usage (Field)', key: 'system_cpu' },
            { title: 'memory_usage (Field)', key: 'system_memory' },
            { title: 'disk_usage (Field)', key: 'system_disk' }
          ]
        }
      ]
    }
  ];

  // 模擬表格詳細資訊
  const tableDetails = {
    'postgresql_devices': {
      name: 'devices',
      database: 'PostgreSQL',
      description: '設備基本資訊表',
      rowCount: 1250,
      size: '2.5 MB',
      indexes: ['PRIMARY KEY (id)', 'INDEX (name)', 'INDEX (type)'],
      constraints: ['NOT NULL (name)', 'FOREIGN KEY (category_id) REFERENCES categories(id)']
    },
    'mongodb_device_logs': {
      name: 'device_logs',
      database: 'MongoDB',
      description: '設備日誌集合',
      rowCount: 45600,
      size: '15.2 MB',
      indexes: ['_id_', 'device_id_1', 'timestamp_-1'],
      constraints: []
    },
    'influxdb_device_metrics': {
      name: 'device_metrics',
      database: 'InfluxDB',
      description: '設備指標時間序列數據',
      rowCount: 1250000,
      size: '45.8 MB',
      indexes: ['time', 'device_id'],
      constraints: []
    }
  };

  const columns = [
    {
      title: '欄位名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.isPrimary && <KeyOutlined style={{ color: '#1890ff' }} />}
          {record.isIndex && <Tag color="green">索引</Tag>}
          <Text strong={record.isPrimary}>{text}</Text>
        </Space>
      ),
    },
    {
      title: '資料類型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '長度/精度',
      dataIndex: 'length',
      key: 'length',
      render: (length) => length || '-',
    },
    {
      title: '可為空',
      dataIndex: 'nullable',
      key: 'nullable',
      render: (nullable) => (
        <Tag color={nullable ? 'green' : 'red'}>
          {nullable ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '預設值',
      dataIndex: 'default',
      key: 'default',
      render: (defaultValue) => defaultValue || '-',
    },
    {
      title: '說明',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="編輯欄位">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditField(record)}
            />
          </Tooltip>
          <Tooltip title="複製欄位">
            <Button 
              type="text" 
              icon={<CopyOutlined />} 
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleTableSelect = (selectedKeys, info) => {
    if (info.node.children) {
      // 這是資料庫或表格節點
      setSelectedTable(info.node.key);
    }
  };

  const handleEditField = (field) => {
    setEditingField(field);
    form.setFieldsValue(field);
    setModalVisible(true);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log('欄位配置:', values);
      setModalVisible(false);
      message.success('欄位配置已保存');
    });
  };

  const getTableFields = (tableKey) => {
    // 根據選中的表格返回對應的欄位數據
    const fieldMappings = {
      'postgresql_devices': [
        { name: 'id', type: 'INTEGER', length: null, nullable: false, default: 'AUTO_INCREMENT', description: '主鍵ID', isPrimary: true, isIndex: false },
        { name: 'name', type: 'VARCHAR', length: '100', nullable: false, default: null, description: '設備名稱', isPrimary: false, isIndex: true },
        { name: 'type', type: 'VARCHAR', length: '50', nullable: true, default: null, description: '設備類型', isPrimary: false, isIndex: true },
        { name: 'status', type: 'VARCHAR', length: '20', nullable: true, default: "'active'", description: '設備狀態', isPrimary: false, isIndex: false },
        { name: 'created_at', type: 'TIMESTAMP', length: null, nullable: false, default: 'CURRENT_TIMESTAMP', description: '創建時間', isPrimary: false, isIndex: false }
      ],
      'mongodb_device_logs': [
        { name: '_id', type: 'ObjectId', length: null, nullable: false, default: null, description: '文檔ID', isPrimary: true, isIndex: true },
        { name: 'device_id', type: 'String', length: null, nullable: false, default: null, description: '設備ID', isPrimary: false, isIndex: true },
        { name: 'log_level', type: 'String', length: null, nullable: true, default: "'INFO'", description: '日誌級別', isPrimary: false, isIndex: false },
        { name: 'message', type: 'String', length: null, nullable: false, default: null, description: '日誌訊息', isPrimary: false, isIndex: false },
        { name: 'timestamp', type: 'Date', length: null, nullable: false, default: 'new Date()', description: '時間戳', isPrimary: false, isIndex: true }
      ],
      'influxdb_device_metrics': [
        { name: 'time', type: 'Timestamp', length: null, nullable: false, default: null, description: '時間戳', isPrimary: true, isIndex: true },
        { name: 'device_id', type: 'Tag', length: null, nullable: false, default: null, description: '設備ID標籤', isPrimary: false, isIndex: true },
        { name: 'temperature', type: 'Field', length: null, nullable: true, default: null, description: '溫度值', isPrimary: false, isIndex: false },
        { name: 'pressure', type: 'Field', length: null, nullable: true, default: null, description: '壓力值', isPrimary: false, isIndex: false },
        { name: 'humidity', type: 'Field', length: null, nullable: true, default: null, description: '濕度值', isPrimary: false, isIndex: false }
      ]
    };
    return fieldMappings[tableKey] || [];
  };

  return (
    <div>
      <Card title="資料表結構管理">
        <Row gutter={16}>
          {/* 左側樹狀結構 */}
          <Col span={8}>
            <Card title="資料庫結構" size="small">
              <DirectoryTree
                defaultExpandAll
                onSelect={handleTableSelect}
                treeData={databases}
                showIcon
                icon={<DatabaseOutlined />}
              />
            </Card>
          </Col>

          {/* 右側詳細資訊 */}
          <Col span={16}>
            {selectedTable && tableDetails[selectedTable] ? (
              <div>
                {/* 表格概覽 */}
                <Card title={`表格：${tableDetails[selectedTable].name}`} size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic title="資料庫" value={tableDetails[selectedTable].database} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="記錄數" value={tableDetails[selectedTable].rowCount} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="大小" value={tableDetails[selectedTable].size} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="索引數" value={tableDetails[selectedTable].indexes.length} />
                    </Col>
                  </Row>
                  <Divider />
                  <Text type="secondary">{tableDetails[selectedTable].description}</Text>
                </Card>

                {/* 欄位列表 */}
                <Card 
                  title="欄位結構" 
                  size="small"
                  extra={
                    <Space>
                      <Button icon={<PlusOutlined />} size="small">
                        新增欄位
                      </Button>
                      <Button icon={<DownloadOutlined />} size="small">
                        匯出結構
                      </Button>
                    </Space>
                  }
                >
                  <Table
                    columns={columns}
                    dataSource={getTableFields(selectedTable)}
                    rowKey="name"
                    pagination={false}
                    size="small"
                  />
                </Card>

                {/* 索引和約束 */}
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Card title="索引" size="small">
                      <ul>
                        {tableDetails[selectedTable].indexes.map((index, i) => (
                          <li key={i}><Text code>{index}</Text></li>
                        ))}
                      </ul>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="約束" size="small">
                      {tableDetails[selectedTable].constraints.length > 0 ? (
                        <ul>
                          {tableDetails[selectedTable].constraints.map((constraint, i) => (
                            <li key={i}><Text code>{constraint}</Text></li>
                          ))}
                        </ul>
                      ) : (
                        <Text type="secondary">無約束</Text>
                      )}
                    </Card>
                  </Col>
                </Row>
              </div>
            ) : (
              <Card>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <DatabaseOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                  <p>請選擇一個表格查看詳細結構</p>
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </Card>

      {/* 欄位編輯模態框 */}
      <Modal
        title="編輯欄位"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="欄位名稱"
            rules={[{ required: true, message: '請輸入欄位名稱' }]}
          >
            <Input placeholder="請輸入欄位名稱" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="資料類型"
                rules={[{ required: true, message: '請選擇資料類型' }]}
              >
                <Select placeholder="請選擇資料類型">
                  <Option value="INTEGER">INTEGER</Option>
                  <Option value="VARCHAR">VARCHAR</Option>
                  <Option value="TEXT">TEXT</Option>
                  <Option value="DECIMAL">DECIMAL</Option>
                  <Option value="TIMESTAMP">TIMESTAMP</Option>
                  <Option value="BOOLEAN">BOOLEAN</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="length"
                label="長度/精度"
              >
                <Input placeholder="例如：100 或 10,2" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nullable"
                label="可為空"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isPrimary"
                label="主鍵"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="default"
            label="預設值"
          >
            <Input placeholder="請輸入預設值" />
          </Form.Item>

          <Form.Item
            name="description"
            label="說明"
          >
            <Input.TextArea rows={2} placeholder="請輸入欄位說明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TableSchema; 