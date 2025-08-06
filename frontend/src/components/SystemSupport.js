import React from 'react';
import { Card, Row, Col, Typography, Space, Button, Form, Input, message } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  MessageOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const SystemSupport = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    message.success('訊息已送出，我們會盡快回覆您！');
    form.resetFields();
  };

  return (
    <div>
      <Title level={2}>系統維護聯絡</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="聯絡資訊">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <PhoneOutlined /> 技術支援：+886-2-1234-5678
              </div>
              <div>
                <MailOutlined /> 電子郵件：support@iiplatform.com
              </div>
              <div>
                <TeamOutlined /> 服務時間：週一至週五 9:00-18:00
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="發送訊息">
            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '請輸入姓名' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="email"
                label="電子郵件"
                rules={[{ required: true, message: '請輸入電子郵件' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="subject"
                label="主旨"
                rules={[{ required: true, message: '請輸入主旨' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="message"
                label="訊息內容"
                rules={[{ required: true, message: '請輸入訊息內容' }]}
              >
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<MessageOutlined />}>
                  發送訊息
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SystemSupport; 