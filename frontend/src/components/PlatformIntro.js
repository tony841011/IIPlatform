import React from 'react';
import { Card, Row, Col, Typography, Divider, List, Tag, Space } from 'antd';
import { 
  RocketOutlined, 
  SafetyCertificateOutlined, 
  CloudOutlined, 
  ApiOutlined,
  DatabaseOutlined,
  RobotOutlined,
  MonitorOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const PlatformIntro = () => {
  const features = [
    {
      icon: <DatabaseOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: '多資料庫支援',
      description: '支援 PostgreSQL、MongoDB、InfluxDB 等多種資料庫，滿足不同數據類型需求'
    },
    {
      icon: <MonitorOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      title: '即時監控',
      description: '提供設備狀態即時監控、數據可視化和警報管理功能'
    },
    {
      icon: <RobotOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      title: 'AI 分析',
      description: '整合機器學習算法，提供異常偵測、預測性維護等智能分析功能'
    },
    {
      icon: <ApiOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      title: '通訊協定',
      description: '支援 MQTT、Modbus TCP、OPC UA 等主流工業通訊協定'
    },
    {
      icon: <SafetyCertificateOutlined style={{ fontSize: '24px', color: '#eb2f96' }} />,
      title: '安全認證',
      description: '提供完整的用戶認證、權限管理和安全防護機制'
    },
    {
      icon: <CloudOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />,
      title: '雲端整合',
      description: '支援雲端部署和邊緣計算，提供靈活的部署方案'
    }
  ];

  const techStack = [
    { name: 'React 18', type: 'frontend' },
    { name: 'Ant Design', type: 'frontend' },
    { name: 'FastAPI', type: 'backend' },
    { name: 'SQLAlchemy', type: 'backend' },
    { name: 'PostgreSQL', type: 'database' },
    { name: 'MongoDB', type: 'database' },
    { name: 'InfluxDB', type: 'database' },
    { name: 'MQTT', type: 'protocol' },
    { name: 'Modbus TCP', type: 'protocol' },
    { name: 'OPC UA', type: 'protocol' }
  ];

  const modules = [
    {
      title: '設備管理',
      items: ['設備註冊與配置', '設備狀態監控', '設備分組管理', '設備控制命令']
    },
    {
      title: '數據處理',
      items: ['即時數據採集', '歷史數據查詢', '數據清洗與轉換', '數據匯出功能']
    },
    {
      title: '警報系統',
      items: ['警報規則配置', '即時警報通知', '警報歷史記錄', '警報處理流程']
    },
    {
      title: '用戶管理',
      items: ['用戶認證授權', '角色權限管理', '操作日誌記錄', '系統設定管理']
    },
    {
      title: '分析報表',
      items: ['數據可視化', '趨勢分析', '統計報表', '自定義儀表板']
    },
    {
      title: '系統監控',
      items: ['系統健康檢查', '性能監控', '資源使用統計', '故障診斷']
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={1}>
            <RocketOutlined style={{ marginRight: '16px', color: '#1890ff' }} />
            工業物聯網平台 (IIPlatform)
          </Title>
          <Paragraph style={{ fontSize: '18px', color: '#666' }}>
            一個整合的工業物聯網解決方案，提供設備管理、數據採集、智能分析和安全監控的完整平台
          </Paragraph>
        </div>

        <Divider />

        {/* 平台特色 */}
        <Title level={2}>平台特色</Title>
        <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card hoverable style={{ height: '100%' }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    {feature.icon}
                  </div>
                  <Title level={4} style={{ textAlign: 'center', margin: 0 }}>
                    {feature.title}
                  </Title>
                  <Paragraph style={{ textAlign: 'center', margin: 0 }}>
                    {feature.description}
                  </Paragraph>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Divider />

        {/* 技術架構 */}
        <Title level={2}>技術架構</Title>
        <Row gutter={[16, 16]} style={{ marginBottom: '40px' }}>
          <Col span={24}>
            <Card>
              <Space wrap>
                {techStack.map((tech, index) => (
                  <Tag 
                    key={index} 
                    color={
                      tech.type === 'frontend' ? 'blue' :
                      tech.type === 'backend' ? 'green' :
                      tech.type === 'database' ? 'purple' : 'orange'
                    }
                    style={{ fontSize: '14px', padding: '8px 16px' }}
                  >
                    {tech.name}
                  </Tag>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* 功能模組 */}
        <Title level={2}>功能模組</Title>
        <Row gutter={[24, 24]}>
          {modules.map((module, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card title={module.title} hoverable>
                <List
                  size="small"
                  dataSource={module.items}
                  renderItem={item => (
                    <List.Item>
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Divider />

        {/* 使用指南 */}
        <Title level={2}>快速開始</Title>
        <Card>
          <List>
            <List.Item>
              <Text strong>1. 系統登入</Text>
              <br />
              <Text type="secondary">使用預設帳號 admin / admin123 登入系統</Text>
            </List.Item>
            <List.Item>
              <Text strong>2. 資料庫配置</Text>
              <br />
              <Text type="secondary">在登入頁面配置遠端資料庫連線，或使用預設的本地資料庫</Text>
            </List.Item>
            <List.Item>
              <Text strong>3. 設備管理</Text>
              <br />
              <Text type="secondary">新增和管理您的 IoT 設備，配置設備參數和通訊設定</Text>
            </List.Item>
            <List.Item>
              <Text strong>4. 數據監控</Text>
              <br />
              <Text type="secondary">查看即時數據、歷史趨勢和系統警報</Text>
            </List.Item>
            <List.Item>
              <Text strong>5. 系統設定</Text>
              <br />
              <Text type="secondary">配置通知偏好、用戶權限和系統參數</Text>
            </List.Item>
          </List>
        </Card>
      </Card>
    </div>
  );
};

export default PlatformIntro; 