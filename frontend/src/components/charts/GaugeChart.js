import React from 'react';
import { Card, Empty, Progress, Typography, Space } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const GaugeChart = ({ data, config = {} }) => {
  if (!data || typeof data.value !== 'number') {
    return (
      <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="無數據" />
      </Card>
    );
  }

  const { value, min = 0, max = 100 } = data;
  const percentage = ((value - min) / (max - min)) * 100;
  
  // 根據百分比決定顏色
  const getColor = (percent) => {
    if (percent >= 80) return '#ff4d4f'; // 紅色 - 危險
    if (percent >= 60) return '#faad14'; // 黃色 - 警告
    if (percent >= 40) return '#1890ff'; // 藍色 - 正常
    return '#52c41a'; // 綠色 - 良好
  };

  const getStatus = (percent) => {
    if (percent >= 80) return '危險';
    if (percent >= 60) return '警告';
    if (percent >= 40) return '正常';
    return '良好';
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* 儀表板圖標 */}
      <DashboardOutlined style={{ 
        fontSize: '48px', 
        color: getColor(percentage),
        marginBottom: '16px'
      }} />
      
      {/* 標題 */}
      <Title level={4} style={{ margin: '0 0 16px 0', textAlign: 'center' }}>
        {config.title || '儀表板'}
      </Title>
      
      {/* 進度條 */}
      <div style={{ width: '100%', marginBottom: '16px' }}>
        <Progress
          type="circle"
          percent={percentage}
          format={(percent) => `${value}`}
          strokeColor={getColor(percentage)}
          size={120}
          strokeWidth={8}
        />
      </div>
      
      {/* 數值顯示 */}
      <Space direction="vertical" align="center" style={{ width: '100%' }}>
        <Text strong style={{ fontSize: '24px', color: getColor(percentage) }}>
          {value.toLocaleString()}
        </Text>
        
        <Text type="secondary">
          範圍: {min.toLocaleString()} - {max.toLocaleString()}
        </Text>
        
        <Text 
          style={{ 
            color: getColor(percentage),
            fontWeight: 'bold'
          }}
        >
          狀態: {getStatus(percentage)}
        </Text>
      </Space>
    </div>
  );
};

export default GaugeChart; 