import React from 'react';
import { Card, Empty, Statistic, Typography, Space } from 'antd';
import { NumberOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const NumberCard = ({ data, config = {} }) => {
  if (!data || typeof data.value !== 'number') {
    return (
      <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="無數據" />
      </Card>
    );
  }

  const { value, prefix = '', suffix = '', trend, previousValue } = data;
  
  // 計算趨勢
  const calculateTrend = () => {
    if (!previousValue || previousValue === 0) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0,
      direction: change >= 0 ? 'up' : 'down'
    };
  };

  const trendData = calculateTrend();

  // 根據數值決定顏色
  const getValueColor = () => {
    if (trendData) {
      return trendData.isPositive ? '#52c41a' : '#ff4d4f';
    }
    return '#1890ff';
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
      {/* 圖標 */}
      <NumberOutlined style={{ 
        fontSize: '48px', 
        color: getValueColor(),
        marginBottom: '16px'
      }} />
      
      {/* 標題 */}
      <Title level={4} style={{ margin: '0 0 16px 0', textAlign: 'center' }}>
        {config.title || '數值卡片'}
      </Title>
      
      {/* 主要數值 */}
      <div style={{ marginBottom: '16px' }}>
        <Statistic
          value={value}
          prefix={prefix}
          suffix={suffix}
          valueStyle={{ 
            color: getValueColor(),
            fontSize: '36px',
            fontWeight: 'bold'
          }}
        />
      </div>
      
      {/* 趨勢信息 */}
      {trendData && (
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
          <Space>
            {trendData.direction === 'up' ? (
              <ArrowUpOutlined style={{ color: '#52c41a' }} />
            ) : (
              <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
            )}
            <Text 
              style={{ 
                color: trendData.isPositive ? '#52c41a' : '#ff4d4f',
                fontWeight: 'bold'
              }}
            >
              {trendData.value.toFixed(1)}%
            </Text>
          </Space>
          
          <Text type="secondary" style={{ fontSize: '12px' }}>
            相比上期
          </Text>
        </Space>
      )}
      
      {/* 額外信息 */}
      {config.description && (
        <Text type="secondary" style={{ 
          textAlign: 'center', 
          marginTop: '16px',
          fontSize: '12px'
        }}>
          {config.description}
        </Text>
      )}
    </div>
  );
};

export default NumberCard; 