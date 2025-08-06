import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Typography,
  Divider,
  Alert,
  Steps,
  message,
  Spin,
  Row,
  Col,
  Switch,
  Tooltip
} from 'antd';
import {
  DatabaseOutlined,
  CloudOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const FirstTimeSetup = ({ onSetupComplete }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [testResults, setTestResults] = useState({});

  const steps = [
    {
      title: 'PostgreSQL 設定',
      icon: <DatabaseOutlined />,
      description: '主資料庫設定'
    },
    {
      title: 'MongoDB 設定',
      icon: <CloudOutlined />,
      description: '文檔資料庫設定'
    },
    {
      title: 'InfluxDB 設定',
      icon: <GlobalOutlined />,
      description: '時序資料庫設定'
    },
    {
      title: '完成設定',
      icon: <CheckCircleOutlined />,
      description: '設定完成'
    }
  ];

  const handleTestConnection = async (dbType) => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      
      let connectionData;
      if (dbType === 'postgresql') {
        connectionData = {
          db_type: 'postgresql',
          name: values.postgresql_name || 'PostgreSQL 主資料庫',
          host: values.postgresql_host,
          port: values.postgresql_port,
          database: values.postgresql_database,
          username: values.postgresql_username,
          password: values.postgresql_password,
          description: '主資料庫，用於存儲核心業務數據'
        };
      } else if (dbType === 'mongodb') {
        connectionData = {
          db_type: 'mongodb',
          name: values.mongodb_name || 'MongoDB 文檔資料庫',
          host: values.mongodb_host,
          port: values.mongodb_port,
          database: values.mongodb_database,
          username: values.mongodb_username,
          password: values.mongodb_password,
          description: '文檔資料庫，用於存儲日誌和配置'
        };
      } else if (dbType === 'influxdb') {
        connectionData = {
          db_type: 'influxdb',
          name: values.influxdb_name || 'InfluxDB 時序資料庫',
          host: values.influxdb_host,
          port: values.influxdb_port,
          database: values.influxdb_database,
          username: values.influxdb_username,
          password: values.influxdb_password,
          description: '時序資料庫，用於存儲感測器數據'
        };
      }

      const response = await axios.post(
        `http://localhost:8000/api/v1/database-connections/${dbType}/test`,
        connectionData
      );

      if (response.data.success) {
        setTestResults(prev => ({
          ...prev,
          [dbType]: { status: 'success', message: response.data.message }
        }));
        message.success(`${dbType.toUpperCase()} 連線測試成功`);
      } else {
        setTestResults(prev => ({
          ...prev,
          [dbType]: { status: 'error', message: response.data.message }
        }));
        message.error(`${dbType.toUpperCase()} 連線測試失敗`);
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [dbType]: { status: 'error', message: error.message }
      }));
      message.error(`${dbType.toUpperCase()} 連線測試失敗: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();

      const setupData = {
        postgresql: {
          db_type: 'postgresql',
          name: values.postgresql_name || 'PostgreSQL 主資料庫',
          host: values.postgresql_host,
          port: values.postgresql_port,
          database: values.postgresql_database,
          username: values.postgresql_username,
          password: values.postgresql_password,
          description: '主資料庫，用於存儲核心業務數據',
          is_active: true,
          is_default: true,
          auto_initialize: true
        },
        mongodb: {
          db_type: 'mongodb',
          name: values.mongodb_name || 'MongoDB 文檔資料庫',
          host: values.mongodb_host,
          port: values.mongodb_port,
          database: values.mongodb_database,
          username: values.mongodb_username,
          password: values.mongodb_password,
          description: '文檔資料庫，用於存儲日誌和配置',
          is_active: true,
          is_default: true,
          auto_initialize: true
        },
        influxdb: {
          db_type: 'influxdb',
          name: values.influxdb_name || 'InfluxDB 時序資料庫',
          host: values.influxdb_host,
          port: values.influxdb_port,
          database: values.influxdb_database,
          username: values.influxdb_username,
          password: values.influxdb_password,
          description: '時序資料庫，用於存儲感測器數據',
          is_active: true,
          is_default: true,
          auto_initialize: true
        }
      };

      const response = await axios.post(
        'http://localhost:8000/api/v1/auth/first-time-setup',
        setupData
      );

      if (response.data.success) {
        message.success('首次設定完成！');
        setCurrentStep(3);
        
        // 顯示測試結果
        if (response.data.test_results) {
          setTestResults(response.data.test_results);
        }
        
        // 延遲一下再觸發完成回調
        setTimeout(() => {
          onSetupComplete(response.data);
        }, 2000);
      } else {
        message.error(`設定失敗: ${response.data.message}`);
      }
    } catch (error) {
      message.error(`設定失敗: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderDatabaseForm = (dbType) => {
    const prefix = dbType;
    const defaultPorts = {
      postgresql: 5432,
      mongodb: 27017,
      influxdb: 8086
    };

    return (
      <Card title={`${dbType.toUpperCase()} 資料庫設定`} style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={`${prefix}_name`}
              label="連線名稱"
              rules={[{ required: true, message: '請輸入連線名稱' }]}
            >
              <Input placeholder={`${dbType.toUpperCase()} 資料庫`} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={`${prefix}_host`}
              label="主機地址"
              rules={[{ required: true, message: '請輸入主機地址' }]}
            >
              <Input placeholder="localhost" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name={`${prefix}_port`}
              label="端口"
              rules={[{ required: true, message: '請輸入端口' }]}
            >
              <InputNumber 
                placeholder={defaultPorts[dbType]} 
                min={1} 
                max={65535} 
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={`${prefix}_database`}
              label="資料庫名稱"
              rules={[{ required: true, message: '請輸入資料庫名稱' }]}
            >
              <Input placeholder="iiplatform" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={`${prefix}_username`}
              label="用戶名"
            >
              <Input placeholder="用戶名" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={`${prefix}_password`}
              label="密碼"
            >
              <Input.Password placeholder="密碼" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="測試連線">
              <Button 
                type="primary" 
                onClick={() => handleTestConnection(dbType)}
                loading={loading}
                icon={<CheckCircleOutlined />}
              >
                測試連線
              </Button>
            </Form.Item>
          </Col>
        </Row>

        {/* 顯示測試結果 */}
        {testResults[dbType] && (
          <Alert
            message={testResults[dbType].message}
            type={testResults[dbType].status === 'success' ? 'success' : 'error'}
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <Title level={4}>PostgreSQL 主資料庫設定</Title>
            <Paragraph>
              PostgreSQL 是平台的主資料庫，用於存儲用戶、設備、權限等核心業務數據。
              請確保 PostgreSQL 服務正在運行，並提供正確的連線資訊。
            </Paragraph>
            {renderDatabaseForm('postgresql')}
          </div>
        );
      case 1:
        return (
          <div>
            <Title level={4}>MongoDB 文檔資料庫設定</Title>
            <Paragraph>
              MongoDB 用於存儲日誌、事件記錄、非結構化數據等文檔型數據。
              請確保 MongoDB 服務正在運行，並提供正確的連線資訊。
            </Paragraph>
            {renderDatabaseForm('mongodb')}
          </div>
        );
      case 2:
        return (
          <div>
            <Title level={4}>InfluxDB 時序資料庫設定</Title>
            <Paragraph>
              InfluxDB 用於存儲感測器數據、監控指標、時間序列數據等。
              請確保 InfluxDB 服務正在運行，並提供正確的連線資訊。
            </Paragraph>
            {renderDatabaseForm('influxdb')}
          </div>
        );
      case 3:
        return (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 24 }} />
            <Title level={3}>設定完成！</Title>
            <Paragraph>
              所有資料庫連線設定已完成。平台將使用這些設定進行資料庫操作。
            </Paragraph>
            
            {/* 顯示測試結果摘要 */}
            {Object.keys(testResults).length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Title level={4}>連線測試結果</Title>
                {Object.entries(testResults).map(([dbType, result]) => (
                  <Alert
                    key={dbType}
                    message={`${dbType.toUpperCase()}: ${result.message}`}
                    type={result.status === 'success' ? 'success' : 'error'}
                    showIcon
                    style={{ marginBottom: 8 }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: 800,
          maxWidth: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '10px' }}>
            <DatabaseOutlined style={{ marginRight: '8px' }} />
            IIPlatform 首次設定
          </Title>
          <Text type="secondary">請設定平台所需的資料庫連線</Text>
        </div>

        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            postgresql_host: 'localhost',
            postgresql_port: 5432,
            postgresql_database: 'iiplatform',
            postgresql_username: 'postgres',
            mongodb_host: 'localhost',
            mongodb_port: 27017,
            mongodb_database: 'iiplatform',
            influxdb_host: 'localhost',
            influxdb_port: 8086,
            influxdb_database: 'iiplatform',
            influxdb_username: 'admin'
          }}
        >
          <Spin spinning={loading}>
            {renderStepContent()}
          </Spin>
        </Form>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Space>
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <Button onClick={handlePrev}>
                上一步
              </Button>
            )}
            
            {currentStep < steps.length - 2 && (
              <Button type="primary" onClick={handleNext}>
                下一步
              </Button>
            )}
            
            {currentStep === steps.length - 2 && (
              <Button type="primary" onClick={handleSubmit} loading={loading}>
                完成設定
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default FirstTimeSetup; 