import React, { useState } from 'react';
import { Card, Button, Space, message, Modal, Form, Input, Select, Alert } from 'antd';
import { 
  PlusOutlined, 
  ReloadOutlined, 
  DownloadOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  FilterOutlined,
  BarChartOutlined
} from '@ant-design/icons';

const { Option } = Select;

const DataTransformationTest = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [validationModalVisible, setValidationModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form] = Form.useForm();
  const [validationForm] = Form.useForm();
  const [templateForm] = Form.useForm();

  // 測試數據
  const testTransformations = [
    {
      id: 1,
      name: '溫度數據標準化',
      type: 'normalize',
      status: 'active',
      source: 'MQTT 溫度數據',
      description: '將攝氏溫度轉換為標準化數值',
      inputFormat: 'JSON',
      outputFormat: 'JSON',
      lastRun: '2024-01-15 14:30:00',
      processedCount: 1250,
      successRate: 98.5
    },
    {
      id: 2,
      name: '壓力數據聚合',
      type: 'aggregate',
      status: 'active',
      source: 'Modbus 壓力數據',
      description: '每分鐘聚合壓力數據',
      inputFormat: 'CSV',
      outputFormat: 'JSON',
      lastRun: '2024-01-15 14:28:00',
      processedCount: 890,
      successRate: 99.2
    }
  ];

  const testTemplates = [
    'JSON 到 CSV 轉換',
    'XML 到 JSON 轉換',
    'CSV 到 JSON 轉換',
    '去除重複數據',
    '填充缺失值',
    '異常值檢測與處理',
    '時間序列聚合',
    '分組統計'
  ];

  // 測試按鈕功能
  const testButtonFunctions = () => {
    message.success('所有按鈕功能測試完成！');
  };

  // 測試新增轉換規則
  const testAddTransformation = () => {
    setModalVisible(true);
  };

  // 測試新增驗證規則
  const testAddValidation = () => {
    setValidationModalVisible(true);
  };

  // 測試重新整理
  const testRefresh = () => {
    message.success('數據已重新整理');
  };

  // 測試匯出結果
  const testExport = () => {
    const testData = [
      { id: 1, name: '測試轉換1', result: 'success' },
      { id: 2, name: '測試轉換2', result: 'success' }
    ];
    const dataStr = JSON.stringify(testData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transformation_test_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('測試數據已匯出');
  };

  // 測試表格操作按鈕
  const testTableActions = (action, name) => {
    switch (action) {
      case 'edit':
        message.info(`編輯轉換: ${name}`);
        break;
      case 'execute':
        message.info(`執行轉換: ${name}`);
        break;
      case 'view':
        message.info(`查看結果: ${name}`);
        break;
      default:
        break;
    }
  };

  // 測試使用模板
  const testUseTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateModalVisible(true);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title="數據轉換按鈕功能測試" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* 主要控制按鈕 */}
          <Card title="主要控制按鈕" size="small">
            <Space>
              <Button type="primary" icon={<PlayCircleOutlined />}>
                開始轉換
              </Button>
              <Button icon={<ReloadOutlined />} onClick={testRefresh}>
                重新整理
              </Button>
              <Button icon={<DownloadOutlined />} onClick={testExport}>
                匯出結果
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={testAddTransformation}>
                新增轉換規則
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={testAddValidation}>
                新增驗證規則
              </Button>
            </Space>
          </Card>

          {/* 表格操作按鈕 */}
          <Card title="表格操作按鈕" size="small">
            <Space wrap>
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                size="small"
                onClick={() => testTableActions('edit', '溫度數據標準化')}
              >
                編輯
              </Button>
              <Button 
                type="text" 
                icon={<PlayCircleOutlined />} 
                size="small"
                onClick={() => testTableActions('execute', '溫度數據標準化')}
              >
                執行
              </Button>
              <Button 
                type="text" 
                icon={<EyeOutlined />} 
                size="small"
                onClick={() => testTableActions('view', '溫度數據標準化')}
              >
                查看結果
              </Button>
            </Space>
          </Card>

          {/* 模板按鈕 */}
          <Card title="模板按鈕" size="small">
            <Space wrap>
              {testTemplates.slice(0, 4).map((template, index) => (
                <Button 
                  key={index}
                  size="small" 
                  type="link" 
                  onClick={() => testUseTemplate(template)}
                >
                  {template}
                </Button>
              ))}
            </Space>
          </Card>

          {/* 功能測試按鈕 */}
          <Card title="功能測試" size="small">
            <Button type="primary" onClick={testButtonFunctions}>
              執行所有按鈕功能測試
            </Button>
          </Card>

        </Space>
      </Card>

      {/* 轉換規則編輯模態框 */}
      <Modal
        title="測試新增轉換規則"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            onClick={() => {
              form.validateFields().then(values => {
                console.log('轉換規則配置:', values);
                message.success('轉換規則配置已保存');
                setModalVisible(false);
                form.resetFields();
              });
            }}
          >
            保存
          </Button>
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="轉換名稱"
            rules={[{ required: true, message: '請輸入轉換名稱' }]}
          >
            <Input placeholder="請輸入轉換名稱" />
          </Form.Item>
          <Form.Item
            name="type"
            label="轉換類型"
            rules={[{ required: true, message: '請選擇轉換類型' }]}
          >
            <Select placeholder="請選擇轉換類型">
              <Option value="normalize">標準化</Option>
              <Option value="aggregate">聚合</Option>
              <Option value="transform">轉換</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="轉換描述"
          >
            <Input.TextArea rows={3} placeholder="請輸入轉換描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 驗證規則新增模態框 */}
      <Modal
        title="測試新增驗證規則"
        open={validationModalVisible}
        onCancel={() => setValidationModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setValidationModalVisible(false)}>
            取消
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            onClick={() => {
              validationForm.validateFields().then(values => {
                console.log('驗證規則配置:', values);
                message.success('驗證規則配置已保存');
                setValidationModalVisible(false);
                validationForm.resetFields();
              });
            }}
          >
            保存
          </Button>
        ]}
        width={600}
      >
        <Form
          form={validationForm}
          layout="vertical"
        >
          <Form.Item
            name="field"
            label="欄位名稱"
            rules={[{ required: true, message: '請輸入欄位名稱' }]}
          >
            <Input placeholder="請輸入欄位名稱" />
          </Form.Item>
          <Form.Item
            name="rule"
            label="驗證規則"
            rules={[{ required: true, message: '請選擇驗證規則' }]}
          >
            <Select placeholder="請選擇驗證規則">
              <Option value="範圍檢查">範圍檢查</Option>
              <Option value="非空檢查">非空檢查</Option>
              <Option value="格式檢查">格式檢查</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="condition"
            label="驗證條件"
            rules={[{ required: true, message: '請輸入驗證條件' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="例如：0 <= value <= 100"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 模板使用模態框 */}
      <Modal
        title={`測試使用模板: ${selectedTemplate}`}
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setTemplateModalVisible(false)}>
            取消
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            onClick={() => {
              templateForm.validateFields().then(values => {
                console.log('模板配置:', values);
                message.success('模板配置已保存');
                setTemplateModalVisible(false);
                templateForm.resetFields();
              });
            }}
          >
            保存
          </Button>
        ]}
        width={700}
      >
        <Form
          form={templateForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="轉換名稱"
            rules={[{ required: true, message: '請輸入轉換名稱' }]}
          >
            <Input placeholder="請輸入轉換名稱" />
          </Form.Item>
          <Form.Item
            name="description"
            label="轉換描述"
          >
            <Input.TextArea rows={2} placeholder="請輸入轉換描述" />
          </Form.Item>
          <Form.Item
            name="config"
            label="模板配置"
          >
            <Input.TextArea 
              rows={5} 
              placeholder="請輸入模板的具體配置參數"
            />
          </Form.Item>
          <Alert
            message="模板說明"
            description={`您選擇的模板是: ${selectedTemplate}。請根據實際需求調整配置參數。`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default DataTransformationTest; 