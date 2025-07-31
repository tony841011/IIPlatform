import React from 'react';
import { Card, Form, Input, Button, Switch, Divider, Alert } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';

const Settings = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('設定已儲存:', values);
  };

  return (
    <div>
      <h2>系統設定</h2>
      
      <Alert
        message="系統設定"
        description="這裡可以調整系統的各種參數和配置"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          alertThreshold: 80,
          dataRetention: 30,
          enableNotifications: true,
          enableAI: true,
          autoRefresh: true
        }}
      >
        <Card title="告警設定" style={{ marginBottom: 16 }}>
          <Form.Item
            name="alertThreshold"
            label="告警閾值"
            rules={[{ required: true, message: '請設定告警閾值' }]}
          >
            <Input type="number" suffix="%" />
          </Form.Item>

          <Form.Item
            name="enableNotifications"
            label="啟用通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Card>

        <Card title="資料管理" style={{ marginBottom: 16 }}>
          <Form.Item
            name="dataRetention"
            label="資料保留天數"
            rules={[{ required: true, message: '請設定資料保留天數' }]}
          >
            <Input type="number" suffix="天" />
          </Form.Item>

          <Form.Item
            name="autoRefresh"
            label="自動重新整理"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Card>

        <Card title="AI 功能" style={{ marginBottom: 16 }}>
          <Form.Item
            name="enableAI"
            label="啟用 AI 分析"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Card>

        <Card title="系統資訊" style={{ marginBottom: 16 }}>
          <p><strong>後端 API：</strong> http://localhost:8000</p>
          <p><strong>WebSocket：</strong> ws://localhost:8000/ws/data</p>
          <p><strong>資料庫：</strong> SQLite</p>
          <p><strong>版本：</strong> 1.0.0</p>
        </Card>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
            儲存設定
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Settings; 