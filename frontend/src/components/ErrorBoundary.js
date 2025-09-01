import React from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { ReloadOutlined, BugOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能夠顯示降級後的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 記錄錯誤資訊
    console.error('React 錯誤邊界捕獲到錯誤:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // 可以將錯誤日誌發送到錯誤報告服務
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    // 重新載入頁面
    window.location.reload();
  };

  handleReset = () => {
    // 重置錯誤狀態
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // 自定義降級後的 UI
      return (
        <Card 
          style={{ 
            margin: '20px', 
            textAlign: 'center',
            border: '1px solid #ff4d4f',
            borderRadius: '8px'
          }}
        >
          <Space direction="vertical" size="large">
            <BugOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
            
            <Title level={3} style={{ color: '#ff4d4f' }}>
              發生錯誤
            </Title>
            
            <Text type="secondary">
              應用程式遇到了一個問題，請嘗試重新載入頁面或聯繫技術支援。
            </Text>

            {this.state.error && (
              <details style={{ 
                textAlign: 'left', 
                background: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                <summary>錯誤詳情</summary>
                <Text code>{this.state.error.toString()}</Text>
                {this.state.errorInfo && this.state.errorInfo.componentStack && (
                  <pre style={{ 
                    marginTop: '10px', 
                    whiteSpace: 'pre-wrap',
                    fontSize: '11px'
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <Space>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
              >
                重新載入頁面
              </Button>
              
              <Button 
                onClick={this.handleReset}
              >
                重試
              </Button>
            </Space>
          </Space>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 