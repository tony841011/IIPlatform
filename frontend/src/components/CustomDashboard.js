import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Tooltip,
  Dropdown,
  Menu,
  message,
  Switch,
  ColorPicker,
  Slider
} from 'antd';
import {
  PlusOutlined,
  SettingOutlined,
  DeleteOutlined,
  CopyOutlined,
  FullscreenOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  TableOutlined,
  DashboardOutlined,
  NumberOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// 引入圖表組件
import BarChart from './charts/BarChart';
import PieChart from './charts/PieChart';
import LineChart from './charts/LineChart';
import AreaChart from './charts/AreaChart';
import DataTable from './charts/DataTable';
import GaugeChart from './charts/GaugeChart';
import NumberCard from './charts/NumberCard';

const { Title, Text } = Typography;
const { Option } = Select;
const ResponsiveGridLayout = WidthProvider(Responsive);

const CustomDashboard = () => {
  const [layouts, setLayouts] = useState({ lg: [] });
  const [widgets, setWidgets] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentWidget, setCurrentWidget] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [dashboardName, setDashboardName] = useState('自定義儀表板');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 圖表類型定義
  const chartTypes = [
    { value: 'bar', label: '直條圖', icon: <BarChartOutlined /> },
    { value: 'pie', label: '圓餅圖', icon: <PieChartOutlined /> },
    { value: 'line', label: '折線圖', icon: <LineChartOutlined /> },
    { value: 'area', label: '面積圖', icon: <AreaChartOutlined /> },
    { value: 'table', label: '數據表格', icon: <TableOutlined /> },
    { value: 'gauge', label: '儀表板', icon: <DashboardOutlined /> },
    { value: 'number', label: '數字卡片', icon: <NumberOutlined /> }
  ];

  // 數據源選項
  const dataSources = [
    { value: 'device_data', label: '設備數據' },
    { value: 'sensor_data', label: '感測器數據' },
    { value: 'alert_data', label: '警報數據' },
    { value: 'user_activity', label: '用戶活動' },
    { value: 'system_metrics', label: '系統指標' },
    { value: 'custom_query', label: '自定義查詢' }
  ];

  // 生成示例數據
  const generateSampleData = (type, config) => {
    switch (type) {
      case 'bar':
        return {
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          datasets: [{
            label: config.title || '數據',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: config.backgroundColor || '#1890ff'
          }]
        };
      case 'pie':
        return {
          labels: ['類型A', '類型B', '類型C', '類型D'],
          datasets: [{
            data: [300, 50, 100, 80],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
          }]
        };
      case 'line':
        return {
          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
          datasets: [{
            label: config.title || '趨勢',
            data: [65, 59, 80, 81, 56, 55],
            borderColor: config.borderColor || '#1890ff',
            fill: false
          }]
        };
      case 'area':
        return {
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          datasets: [{
            label: config.title || '面積',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: config.backgroundColor || 'rgba(24, 144, 255, 0.2)',
            borderColor: config.borderColor || '#1890ff'
          }]
        };
      case 'table':
        // 確保返回陣列格式
        return [
          { id: 1, name: '設備A', status: '正常', value: 25.6 },
          { id: 2, name: '設備B', status: '警告', value: 45.2 },
          { id: 3, name: '設備C', status: '正常', value: 32.1 }
        ];
      case 'gauge':
        return {
          value: config.value || 75,
          max: config.max || 100,
          min: config.min || 0
        };
      case 'number':
        return {
          value: config.value || 1234,
          prefix: config.prefix || '',
          suffix: config.suffix || ''
        };
      default:
        // 預設返回空陣列而不是空物件
        return [];
    }
  };

  // 渲染圖表組件
  const renderChart = (widget) => {
    const { type, config, data } = widget;
    const chartData = data || generateSampleData(type, config);

    switch (type) {
      case 'bar':
        return <BarChart data={chartData} config={config} />;
      case 'pie':
        return <PieChart data={chartData} config={config} />;
      case 'line':
        return <LineChart data={chartData} config={config} />;
      case 'area':
        return <AreaChart data={chartData} config={config} />;
      case 'table':
        return <DataTable data={chartData} config={config} />;
      case 'gauge':
        return <GaugeChart data={chartData} config={config} />;
      case 'number':
        return <NumberCard data={chartData} config={config} />;
      default:
        return <div>不支援的圖表類型</div>;
    }
  };

  // 添加新圖表
  const handleAddWidget = () => {
    setIsAddModalVisible(true);
    form.resetFields();
  };

  // 確認添加圖表
  const handleAddConfirm = () => {
    form.validateFields().then(values => {
      const newWidget = {
        id: `widget-${Date.now()}`,
        type: values.type,
        title: values.title,
        dataSource: values.dataSource,
        config: {
          backgroundColor: values.backgroundColor,
          borderColor: values.borderColor,
          showLegend: values.showLegend,
          showGrid: values.showGrid,
          refreshInterval: values.refreshInterval
        },
        layout: {
          x: 0,
          y: 0,
          w: values.width || 6,
          h: values.height || 4,
          minW: 2,
          minH: 2
        }
      };

      const newWidgets = [...widgets, newWidget];
      setWidgets(newWidgets);
      
      const newLayouts = { ...layouts };
      newLayouts.lg = [...newLayouts.lg, newWidget.layout];
      setLayouts(newLayouts);

      setIsAddModalVisible(false);
      message.success('圖表添加成功');
    });
  };

  // 編輯圖表
  const handleEditWidget = (widget) => {
    setCurrentWidget(widget);
    editForm.setFieldsValue({
      title: widget.title,
      dataSource: widget.dataSource,
      backgroundColor: widget.config.backgroundColor,
      borderColor: widget.config.borderColor,
      showLegend: widget.config.showLegend,
      showGrid: widget.config.showGrid,
      refreshInterval: widget.config.refreshInterval
    });
    setIsEditModalVisible(true);
  };

  // 確認編輯圖表
  const handleEditConfirm = () => {
    editForm.validateFields().then(values => {
      const updatedWidgets = widgets.map(widget => 
        widget.id === currentWidget.id 
          ? {
              ...widget,
              title: values.title,
              dataSource: values.dataSource,
              config: {
                ...widget.config,
                backgroundColor: values.backgroundColor,
                borderColor: values.borderColor,
                showLegend: values.showLegend,
                showGrid: values.showGrid,
                refreshInterval: values.refreshInterval
              }
            }
          : widget
      );
      setWidgets(updatedWidgets);
      setIsEditModalVisible(false);
      message.success('圖表更新成功');
    });
  };

  // 刪除圖表
  const handleDeleteWidget = (widgetId) => {
    const newWidgets = widgets.filter(widget => widget.id !== widgetId);
    setWidgets(newWidgets);
    
    const newLayouts = { ...layouts };
    newLayouts.lg = newLayouts.lg.filter(item => item.i !== widgetId);
    setLayouts(newLayouts);
    
    message.success('圖表刪除成功');
  };

  // 複製圖表
  const handleCopyWidget = (widget) => {
    const newWidget = {
      ...widget,
      id: `widget-${Date.now()}`,
      title: `${widget.title} (複製)`,
      layout: {
        ...widget.layout,
        x: widget.layout.x + 1,
        y: widget.layout.y + 1
      }
    };

    const newWidgets = [...widgets, newWidget];
    setWidgets(newWidgets);
    
    const newLayouts = { ...layouts };
    newLayouts.lg = [...newLayouts.lg, newWidget.layout];
    setLayouts(newLayouts);
    
    message.success('圖表複製成功');
  };

  // 佈局變更處理
  const onLayoutChange = (layout, layouts) => {
    setLayouts(layouts);
    
    // 更新 widgets 中的佈局信息
    const updatedWidgets = widgets.map(widget => {
      const layoutItem = layout.find(item => item.i === widget.id);
      if (layoutItem) {
        return {
          ...widget,
          layout: {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h
          }
        };
      }
      return widget;
    });
    setWidgets(updatedWidgets);
  };

  // 保存儀表板
  const handleSaveDashboard = () => {
    const dashboardData = {
      name: dashboardName,
      layouts,
      widgets,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('customDashboard', JSON.stringify(dashboardData));
    message.success('儀表板保存成功');
  };

  // 載入儀表板
  const handleLoadDashboard = () => {
    const savedData = localStorage.getItem('customDashboard');
    if (savedData) {
      const dashboardData = JSON.parse(savedData);
      setDashboardName(dashboardData.name);
      setLayouts(dashboardData.layouts);
      setWidgets(dashboardData.widgets);
      message.success('儀表板載入成功');
    } else {
      message.warning('沒有找到保存的儀表板');
    }
  };

  // 重置儀表板
  const handleResetDashboard = () => {
    setLayouts({ lg: [] });
    setWidgets([]);
    setDashboardName('自定義儀表板');
    message.success('儀表板已重置');
  };

  // 圖表操作菜單
  const getWidgetMenu = (widget) => (
    <Menu>
      <Menu.Item key="edit" icon={<SettingOutlined />} onClick={() => handleEditWidget(widget)}>
        編輯設定
      </Menu.Item>
      <Menu.Item key="copy" icon={<CopyOutlined />} onClick={() => handleCopyWidget(widget)}>
        複製圖表
      </Menu.Item>
      <Menu.Item key="fullscreen" icon={<FullscreenOutlined />}>
        全螢幕顯示
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteWidget(widget.id)}>
        刪除圖表
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* 儀表板標題和操作欄 */}
      <Card style={{ marginBottom: '20px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              {dashboardName}
            </Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<PlusOutlined />} type="primary" onClick={handleAddWidget}>
                添加圖表
              </Button>
              <Button icon={<SaveOutlined />} onClick={handleSaveDashboard}>
                保存
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleLoadDashboard}>
                載入
              </Button>
              <Button onClick={handleResetDashboard}>
                重置
              </Button>
              <Button 
                icon={<FullscreenOutlined />} 
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? '退出全螢幕' : '全螢幕'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 可拖拽儀表板區域 */}
      <div style={{ 
        background: 'white', 
        borderRadius: '8px', 
        padding: '20px',
        minHeight: '600px'
      }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          onLayoutChange={onLayoutChange}
          isDraggable={true}
          isResizable={true}
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          {widgets.map(widget => (
            <div key={widget.id} style={{ background: 'white', borderRadius: '8px' }}>
              <Card
                title={widget.title}
                size="small"
                extra={
                  <Dropdown overlay={getWidgetMenu(widget)} trigger={['click']}>
                    <Button type="text" icon={<SettingOutlined />} />
                  </Dropdown>
                }
                style={{ height: '100%' }}
                bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'hidden' }}
              >
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {renderChart(widget)}
                </div>
              </Card>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {/* 添加圖表模態框 */}
      <Modal
        title="添加新圖表"
        open={isAddModalVisible}
        onOk={handleAddConfirm}
        onCancel={() => setIsAddModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="圖表類型"
                rules={[{ required: true, message: '請選擇圖表類型' }]}
              >
                <Select placeholder="選擇圖表類型">
                  {chartTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      <Space>
                        {type.icon}
                        {type.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="title"
                label="圖表標題"
                rules={[{ required: true, message: '請輸入圖表標題' }]}
              >
                <Input placeholder="輸入圖表標題" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dataSource"
                label="數據源"
                rules={[{ required: true, message: '請選擇數據源' }]}
              >
                <Select placeholder="選擇數據源">
                  {dataSources.map(source => (
                    <Option key={source.value} value={source.value}>
                      {source.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="backgroundColor"
                label="背景顏色"
              >
                <ColorPicker />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="width"
                label="寬度 (格數)"
                initialValue={6}
              >
                <InputNumber min={2} max={12} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="height"
                label="高度 (格數)"
                initialValue={4}
              >
                <InputNumber min={2} max={8} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="refreshInterval"
                label="刷新間隔 (秒)"
                initialValue={30}
              >
                <InputNumber min={5} max={3600} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="showLegend"
                label="顯示圖例"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="showGrid"
                label="顯示網格"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 編輯圖表模態框 */}
      <Modal
        title="編輯圖表設定"
        open={isEditModalVisible}
        onOk={handleEditConfirm}
        onCancel={() => setIsEditModalVisible(false)}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="圖表標題"
                rules={[{ required: true, message: '請輸入圖表標題' }]}
              >
                <Input placeholder="輸入圖表標題" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dataSource"
                label="數據源"
                rules={[{ required: true, message: '請選擇數據源' }]}
              >
                <Select placeholder="選擇數據源">
                  {dataSources.map(source => (
                    <Option key={source.value} value={source.value}>
                      {source.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="backgroundColor"
                label="背景顏色"
              >
                <ColorPicker />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="borderColor"
                label="邊框顏色"
              >
                <ColorPicker />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="refreshInterval"
                label="刷新間隔 (秒)"
              >
                <InputNumber min={5} max={3600} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="showLegend"
                label="顯示圖例"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="showGrid"
                label="顯示網格"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomDashboard; 