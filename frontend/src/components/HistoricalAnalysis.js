import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Select, 
  DatePicker, 
  Button, 
  Table, 
  Statistic, 
  Space,
  Typography,
  Divider,
  Tag
} from 'antd';
import { 
  LineChartOutlined, 
  BarChartOutlined, 
  PieChartOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FilterOutlined,
  CalendarOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title } = Typography;

const HistoricalAnalysis = () => {
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [dateRange, setDateRange] = useState(null);

  // 模擬數據
  const devices = [
    { id: 'all', name: '全部設備' },
    { id: 'temp-01', name: '溫度感測器-01' },
    { id: 'pressure-02', name: '壓力計-02' },
    { id: 'flow-03', name: '流量計-03' }
  ];

  const metrics = [
    { id: 'temperature', name: '溫度', unit: '°C' },
    { id: 'pressure', name: '壓力', unit: 'Pa' },
    { id: 'flow', name: '流量', unit: 'L/min' },
    { id: 'humidity', name: '濕度', unit: '%' }
  ];

  const historicalData = [
    {
      key: '1',
      timestamp: '2024-01-15 14:00:00',
      device: '溫度感測器-01',
      metric: '溫度',
      value: 75.2,
      unit: '°C',
      status: 'normal'
    },
    {
      key: '2',
      timestamp: '2024-01-15 14:05:00',
      device: '溫度感測器-01',
      metric: '溫度',
      value: 76.8,
      unit: '°C',
      status: 'normal'
    },
    {
      key: '3',
      timestamp: '2024-01-15 14:10:00',
      device: '溫度感測器-01',
      metric: '溫度',
      value: 87.5,
      unit: '°C',
      status: 'warning'
    },
    {
      key: '4',
      timestamp: '2024-01-15 14:15:00',
      device: '壓力計-02',
      metric: '壓力',
      value: 2.5,
      unit: 'MPa',
      status: 'normal'
    },
    {
      key: '5',
      timestamp: '2024-01-15 14:20:00',
      device: '流量計-03',
      metric: '流量',
      value: 150.0,
      unit: 'L/min',
      status: 'normal'
    }
  ];

  const columns = [
    {
      title: '時間戳',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: '設備',
      dataIndex: 'device',
      key: 'device',
      filters: devices.map(d => ({ text: d.name, value: d.name })),
      onFilter: (value, record) => record.device === value,
    },
    {
      title: '指標',
      dataIndex: 'metric',
      key: 'metric',
    },
    {
      title: '數值',
      dataIndex: 'value',
      key: 'value',
      render: (value, record) => `${value} ${record.unit}`,
      sorter: (a, b) => a.value - b.value,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'normal' ? 'green' : status === 'warning' ? 'orange' : 'red'}>
          {status === 'normal' ? '正常' : status === 'warning' ? '警告' : '異常'}
        </Tag>
      ),
      filters: [
        { text: '正常', value: 'normal' },
        { text: '警告', value: 'warning' },
        { text: '異常', value: 'error' },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ];

  const stats = {
    totalRecords: 1250,
    avgValue: 76.8,
    maxValue: 87.5,
    minValue: 65.2,
    normalCount: 1180,
    warningCount: 45,
    errorCount: 25
  };

  return (
    <div>
      <Card title="歷史分析">
        {/* 篩選條件 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <span>設備：</span>
              <Select
                value={selectedDevice}
                onChange={setSelectedDevice}
                style={{ width: '100%', marginLeft: 8 }}
                placeholder="選擇設備"
              >
                {devices.map(device => (
                  <Option key={device.id} value={device.id}>{device.name}</Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <span>指標：</span>
              <Select
                value={selectedMetric}
                onChange={setSelectedMetric}
                style={{ width: '100%', marginLeft: 8 }}
                placeholder="選擇指標"
              >
                {metrics.map(metric => (
                  <Option key={metric.id} value={metric.id}>{metric.name}</Option>
                ))}
              </Select>
            </Col>
            <Col span={8}>
              <span>時間範圍：</span>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                showTime
                style={{ width: '100%', marginLeft: 8 }}
              />
            </Col>
            <Col span={4}>
              <Space>
                <Button icon={<FilterOutlined />} type="primary">
                  篩選
                </Button>
                <Button icon={<ReloadOutlined />}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 統計數據 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={3}>
            <Card>
              <Statistic
                title="總記錄數"
                value={stats.totalRecords}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="平均值"
                value={stats.avgValue}
                suffix="°C"
                precision={1}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="最大值"
                value={stats.maxValue}
                suffix="°C"
                precision={1}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="最小值"
                value={stats.minValue}
                suffix="°C"
                precision={1}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="正常"
                value={stats.normalCount}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="警告"
                value={stats.warningCount}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="異常"
                value={stats.errorCount}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="異常率"
                value={((stats.errorCount + stats.warningCount) / stats.totalRecords * 100).toFixed(1)}
                suffix="%"
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 圖表區域 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="趨勢圖" extra={<Button icon={<DownloadOutlined />}>匯出</Button>}>
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                <div style={{ textAlign: 'center' }}>
                  <LineChartOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                  <p>溫度趨勢圖</p>
                  <p style={{ color: '#666' }}>顯示選定時間範圍內的數據趨勢</p>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="分布圖" extra={<Button icon={<DownloadOutlined />}>匯出</Button>}>
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                <div style={{ textAlign: 'center' }}>
                  <BarChartOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                  <p>數據分布圖</p>
                  <p style={{ color: '#666' }}>顯示數據的統計分布情況</p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="狀態分布" extra={<Button icon={<DownloadOutlined />}>匯出</Button>}>
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                <div style={{ textAlign: 'center' }}>
                  <PieChartOutlined style={{ fontSize: '48px', color: '#722ed1' }} />
                  <p>狀態餅圖</p>
                  <p style={{ color: '#666' }}>顯示正常、警告、異常的分布比例</p>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="設備比較" extra={<Button icon={<DownloadOutlined />}>匯出</Button>}>
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                <div style={{ textAlign: 'center' }}>
                  <BarChartOutlined style={{ fontSize: '48px', color: '#fa8c16' }} />
                  <p>設備比較圖</p>
                  <p style={{ color: '#666' }}>比較不同設備的數據表現</p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 數據表格 */}
        <Card title="歷史數據" extra={<Button icon={<DownloadOutlined />}>匯出數據</Button>}>
          <Table
            columns={columns}
            dataSource={historicalData}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
            }}
          />
        </Card>
      </Card>
    </div>
  );
};

export default HistoricalAnalysis; 