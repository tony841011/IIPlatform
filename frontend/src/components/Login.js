import React from 'react';
import { Form, Input, Button, Card, Typography, Space, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Login = ({ onLogin }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      await onLogin(values);
    } catch (error) {
      message.error('登入失敗，請檢查使用者名稱和密碼');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1890ff' }}>
            工業物聯網平台
          </Title>
          <Text type="secondary">請登入以繼續使用系統</Text>
        </div>
        
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '請輸入使用者名稱' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="使用者名稱"
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: '請輸入密碼' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密碼"
              size="large"
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              icon={<LoginOutlined />}
              style={{ width: '100%' }}
            >
              登入
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary">
            測試帳號：admin / operator / viewer
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login; 