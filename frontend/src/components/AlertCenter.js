import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Row, 
  Col,
  Statistic,
  Badge,
  message,
  Tooltip
} from 'antd';
import { 
  BellOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const AlertCenter = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      device: '溫度感測器-01',
      type: '高溫警報',
      severity: 'high',
      message: '溫度超過閾值 85°C，當前溫度 87.5°C',
      status: 'active',
      time: '2024-01-15 14:25:00',
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedTime: null
    },
    {
      id: 2,
      device: '壓力計-02',
      type: '連線中斷',
      severity: 'medium',
      message: '設備連線中斷，最後心跳時間 2024-01-15 13:45:00',
      status: 'resolved',
      time: '2024-01-15 13:45:00',
      acknowledged: true,
      acknowledgedBy: 'admin',
      acknowledgedTime: '2024-01-15 14:00:00'
    },
    {
      id: 3,
      device: '流量計-03',
      type: '異常讀數',
      severity: 'low',
      message: '流量讀數異常，偏離正常範圍 15%',
      status: 'active',
      time: '2024-01-15 14:20:00',
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedTime: null
    },
    {
      id: 4,
      device: '控制閥-01',
      type: '設備故障',
      severity: 'high',
      message: '控制閥響應超時，無法執行控制命令',
      status: 'active',
      time: '2024-01-15 14:15:00',
      acknowledged: true,
      acknowledgedBy: 'operator',
      acknowledgedTime: '2024-01-15 14:18:00'
    }
  ]);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [form] = Form.useForm();

  // 統計數據
  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length
  };

  const columns = [
    {
      title: '設備',
      dataIndex: 'device',
      key: 'device',
      sorter: (a, b) => a.device.localeCompare(b.device),
    },
    {
      title: '警報類型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color="blue">{type}</Tag>
      ),
      filters: [
        { text: '高溫警報', value: '高溫警報' },
        { text: '連線中斷', value: '連線中斷' },
        { text: '異常讀數', value: '異常讀數' },
        { text: '設備故障', value: '設備故障' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '嚴重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        const colors = { high: 'red', medium: 'orange', low: 'yellow' };
        const labels = { high: '高', medium: '中', low: '低' };
        return <Tag color={colors[severity]}>{labels[severity]}</Tag>;
      },
      filters: [
        { text: '高', value: 'high' },
        { text: '中', value: 'medium' },
        { text: '低', value: 'low' },
      ],
      onFilter: (value, record) => record.severity === value,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'active' ? 'error' : 'success'} 
          text={status === 'active' ? '活動中' : '已解決'} 
        />
      ),
      filters: [
        { text: '活動中', value: 'active' },
        { text: '已解決', value: 'resolved' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '時間',
      dataIndex: 'time',
      key: 'time',
      sorter: (a, b) => new Date(a.time) - new Date(b.time),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="查看詳情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === 'active' && (
            <Tooltip title="確認警報">
              <Button 
                type="text" 
                icon={<CheckCircleOutlined />} 
                onClick={() => handleAcknowledge(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetail = (alert) => {
    setSelectedAlert(alert);
    setDetailModalVisible(true);
  };

  const handleAcknowledge = (alertId) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            acknowledged: true, 
            acknowledgedBy: 'admin', 
            acknowledgedTime: new Date().toLocaleString() 
          }
        : alert
    ));
    message.success('警報已確認');
  };

  const handleFilter = (values) => {
    console.log('篩選條件:', values);
    setFilterModalVisible(false);
    message.success('篩選條件已應用');
  };

  return (
    <div>
      <Card title="告警中心">
        {/* 統計卡片 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="總警報數"
                value={stats.total}
                prefix={<BellOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="活動警報"
                value={stats.active}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="已解決"
                value={stats.resolved}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="高嚴重度"
                value={stats.high}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="中嚴重度"
                value={stats.medium}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="低嚴重度"
                value={stats.low}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 操作按鈕 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={16}>
            <Space>
              <Button 
                icon={<FilterOutlined />}
                onClick={() => setFilterModalVisible(true)}
              >
                篩選
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => message.success('數據已重新載入')}
              >
                重新載入
              </Button>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button type="primary">
                確認全部
              </Button>
              <Button>
                匯出報表
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 警報表格 */}
        <Table
          columns={columns}
          dataSource={alerts}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
          }}
        />
      </Card>

      {/* 篩選模態框 */}
      <Modal
        title="篩選警報"
        open={filterModalVisible}
        onCancel={() => setFilterModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFilter}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="device" label="設備">
                <Input placeholder="請輸入設備名稱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="警報類型">
                <Select placeholder="請選擇警報類型" allowClear>
                  <Option value="高溫警報">高溫警報</Option>
                  <Option value="連線中斷">連線中斷</Option>
                  <Option value="異常讀數">異常讀數</Option>
                  <Option value="設備故障">設備故障</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="severity" label="嚴重程度">
                <Select placeholder="請選擇嚴重程度" allowClear>
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="狀態">
                <Select placeholder="請選擇狀態" allowClear>
                  <Option value="active">活動中</Option>
                  <Option value="resolved">已解決</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="timeRange" label="時間範圍">
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                應用篩選
              </Button>
              <Button onClick={() => form.resetFields()}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 詳情模態框 */}
      <Modal
        title="警報詳情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            關閉
          </Button>,
          selectedAlert?.status === 'active' && (
            <Button 
              key="acknowledge" 
              type="primary"
              onClick={() => {
                handleAcknowledge(selectedAlert.id);
                setDetailModalVisible(false);
              }}
            >
              確認警報
            </Button>
          )
        ].filter(Boolean)}
        width={600}
      >
        {selectedAlert && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>設備：</strong>{selectedAlert.device}</p>
                <p><strong>警報類型：</strong>
                  <Tag color="blue">{selectedAlert.type}</Tag>
                </p>
                <p><strong>嚴重程度：</strong>
                  <Tag color={
                    selectedAlert.severity === 'high' ? 'red' :
                    selectedAlert.severity === 'medium' ? 'orange' : 'yellow'
                  }>
                    {selectedAlert.severity === 'high' ? '高' :
                     selectedAlert.severity === 'medium' ? '中' : '低'}
                  </Tag>
                </p>
              </Col>
              <Col span={12}>
                <p><strong>狀態：</strong>
                  <Badge 
                    status={selectedAlert.status === 'active' ? 'error' : 'success'} 
                    text={selectedAlert.status === 'active' ? '活動中' : '已解決'} 
                  />
                </p>
                <p><strong>發生時間：</strong>{selectedAlert.time}</p>
                {selectedAlert.acknowledged && (
                  <>
                    <p><strong>確認人：</strong>{selectedAlert.acknowledgedBy}</p>
                    <p><strong>確認時間：</strong>{selectedAlert.acknowledgedTime}</p>
                  </>
                )}
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <p><strong>警報訊息：</strong></p>
              <p>{selectedAlert.message}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AlertCenter; 