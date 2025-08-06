import React, { useState } from 'react';
import { Card, Button, Space, message, Modal, Form, Input, Select } from 'antd';
import { 
  PlusOutlined, 
  ReloadOutlined, 
  DownloadOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  SyncOutlined
} from '@ant-design/icons';

const { Option } = Select;

const DataProcessingTest = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 測試按鈕功能
  const testButtonFunctions = () => {
    message.success('所有按鈕功能測試完成！');
  };

  // 測試新增數據源
  const testAddDataSource = () => {
    setModalVisible(true);
  };

  // 測試重新整理
  const testRefresh = () => {
    message.success('數據已重新整理');
  };

  // 測試匯出結果
  const testExport = () => {
    const testData = [
      { id: 1, name: '測試數據1', value: 100 },
      { id: 2, name: '測試數據2', value: 200 }
    ];
    const dataStr = JSON.stringify(testData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('測試數據已匯出');
  };

  // 測試表格操作按鈕
  const testTableActions = (action, name) => {
    switch (action) {
      case 'view':
        message.info(`查看數據: ${name}`);
        break;
      case 'config':
        message.info(`配置: ${name}`);
        break;
      case 'test':
        message.info(`測試連線: ${name}`);
        break;
      case 'edit':
        message.info(`編輯: ${name}`);
        break;
      case 'execute':
        message.info(`執行: ${name}`);
        break;
      case 'delete':
        message.warning(`刪除: ${name}`);
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title="數據處理按鈕功能測試" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* 主要控制按鈕 */}
          <Card title="主要控制按鈕" size="small">
            <Space>
              <Button type="primary" icon={<PlayCircleOutlined />}>
                開始處理
              </Button>
              <Button icon={<ReloadOutlined />} onClick={testRefresh}>
                重新整理
              </Button>
              <Button icon={<DownloadOutlined />} onClick={testExport}>
                匯出結果
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={testAddDataSource}>
                新增數據源
              </Button>
            </Space>
          </Card>

          {/* 表格操作按鈕 */}
          <Card title="表格操作按鈕" size="small">
            <Space wrap>
              <Button 
                type="text" 
                icon={<EyeOutlined />} 
                size="small"
                onClick={() => testTableActions('view', '數據源1')}
              >
                查看數據
              </Button>
              <Button 
                type="text" 
                icon={<SettingOutlined />} 
                size="small"
                onClick={() => testTableActions('config', '數據源1')}
              >
                配置
              </Button>
              <Button 
                type="text" 
                icon={<SyncOutlined />} 
                size="small"
                onClick={() => testTableActions('test', '數據源1')}
              >
                測試連線
              </Button>
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                size="small"
                onClick={() => testTableActions('edit', '規則1')}
              >
                編輯
              </Button>
              <Button 
                type="text" 
                icon={<PlayCircleOutlined />} 
                size="small"
                onClick={() => testTableActions('execute', '規則1')}
              >
                執行
              </Button>
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
                onClick={() => testTableActions('delete', '規則1')}
              >
                刪除
              </Button>
            </Space>
          </Card>

          {/* 快速測試按鈕 */}
          <Card title="快速測試按鈕" size="small">
            <Space>
              <Button 
                type="primary" 
                size="small"
                onClick={() => message.success('MQTT 數據處理測試完成')}
              >
                處理 MQTT 數據
              </Button>
              <Button 
                type="primary" 
                size="small"
                onClick={() => message.success('Modbus 數據處理測試完成')}
              >
                處理 Modbus 數據
              </Button>
              <Button 
                type="primary" 
                size="small"
                onClick={() => message.success('資料庫數據處理測試完成')}
              >
                處理資料庫數據
              </Button>
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

      {/* 測試模態框 */}
      <Modal
        title="測試新增數據源"
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
                console.log('表單數據:', values);
                message.success('數據源新增成功');
                setModalVisible(false);
                form.resetFields();
              });
            }}
          >
            保存
          </Button>
        ]}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="數據源名稱"
            rules={[{ required: true, message: '請輸入數據源名稱' }]}
          >
            <Input placeholder="請輸入數據源名稱" />
          </Form.Item>
          <Form.Item
            name="type"
            label="數據源類型"
            rules={[{ required: true, message: '請選擇數據源類型' }]}
          >
            <Select placeholder="請選擇數據源類型">
              <Option value="mqtt">MQTT</Option>
              <Option value="modbus">Modbus</Option>
              <Option value="postgresql">PostgreSQL</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="請輸入描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DataProcessingTest; 