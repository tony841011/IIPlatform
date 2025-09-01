import React from 'react';
import { Card, Button, Typography, Space, Alert } from 'antd';
import { ReloadOutlined, BugOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null
    };
    
    // 綁定方法
    this.handleReload = this.handleReload.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleManualFix = this.handleManualFix.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 記錄錯誤資訊
    console.error('🚨 全局錯誤邊界捕獲到錯誤:', error, errorInfo);
    
    // 檢查是否是 rawData.some 錯誤
    const isRawDataError = error.message && error.message.includes('rawData.some is not a function');
    
    this.setState(prevState => ({
      error: error,
      errorInfo: errorInfo,
      errorCount: prevState.errorCount + 1,
      lastErrorTime: new Date().toLocaleString(),
      isRawDataError
    }));

    // 如果是 rawData.some 錯誤，嘗試自動修復
    if (isRawDataError) {
      this.attemptAutoFix();
    }
  }

  // 嘗試自動修復
  attemptAutoFix = () => {
    try {
      console.log('🔧 嘗試自動修復 rawData.some 錯誤...');
      
      // 導入修復工具
      import('../utils/emergencyTableFix').then(({ manualFix }) => {
        manualFix();
        
        // 延遲重置錯誤狀態
        setTimeout(() => {
          this.setState({ hasError: false, error: null, errorInfo: null });
          console.log('✅ 自動修復完成，錯誤狀態已重置');
        }, 2000);
      }).catch(importError => {
        console.warn('無法導入修復工具:', importError);
      });
      
    } catch (error) {
      console.warn('自動修復失敗:', error);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleManualFix = () => {
    this.attemptAutoFix();
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorCount, lastErrorTime, isRawDataError } = this.state;
      
      return (
        <div style={{ 
          padding: '20px', 
          minHeight: '100vh',
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Card 
            style={{ 
              maxWidth: '800px',
              width: '100%',
              border: '1px solid #ff4d4f',
              borderRadius: '8px'
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <BugOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
                
                <Title level={3} style={{ color: '#ff4d4f', marginTop: '16px' }}>
                  {isRawDataError ? '表格資料錯誤' : '應用程式錯誤'}
                </Title>
                
                <Text type="secondary">
                  {isRawDataError 
                    ? '檢測到表格資料格式問題，系統正在嘗試修復...'
                    : '應用程式遇到了一個問題，請嘗試重新載入頁面或聯繫技術支援。'
                  }
                </Text>
              </div>

              {isRawDataError && (
                <Alert
                  message="自動修復進行中"
                  description="系統正在嘗試修復表格資料問題，請稍候..."
                  type="info"
                  showIcon
                  action={
                    <Button size="small" onClick={this.handleManualFix}>
                      手動修復
                    </Button>
                  }
                />
              )}

              <div style={{ 
                background: '#fafafa', 
                padding: '16px', 
                borderRadius: '6px',
                border: '1px solid #d9d9d9'
              }}>
                <Text strong>錯誤統計:</Text>
                <br />
                <Text>錯誤次數: {errorCount}</Text>
                <br />
                <Text>最後錯誤時間: {lastErrorTime}</Text>
                <br />
                <Text>錯誤類型: {isRawDataError ? 'rawData.some 錯誤' : '其他錯誤'}</Text>
              </div>

              {error && (
                <details style={{ 
                  textAlign: 'left', 
                  background: '#f5f5f5', 
                  padding: '16px', 
                  borderRadius: '6px',
                  fontSize: '12px',
                  border: '1px solid #d9d9d9'
                }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    <ExclamationCircleOutlined /> 錯誤詳情
                  </summary>
                  <div style={{ marginTop: '12px' }}>
                    <Text code>{error.toString()}</Text>
                    {errorInfo && errorInfo.componentStack && (
                      <pre style={{ 
                        marginTop: '12px', 
                        whiteSpace: 'pre-wrap',
                        fontSize: '11px',
                        background: '#fff',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #d9d9d9'
                      }}>
                        {errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div style={{ textAlign: 'center' }}>
                <Space size="middle">
                  <Button 
                    type="primary" 
                    icon={<ReloadOutlined />}
                    onClick={this.handleReload}
                    size="large"
                  >
                    重新載入頁面
                  </Button>
                  
                  {isRawDataError && (
                    <Button 
                      type="default"
                      icon={<BugOutlined />}
                      onClick={this.handleManualFix}
                      size="large"
                    >
                      手動修復
                    </Button>
                  )}
                  
                  <Button 
                    onClick={this.handleReset}
                    size="large"
                  >
                    重試
                  </Button>
                </Space>
              </div>

              <div style={{ textAlign: 'center', fontSize: '12px', color: '#999' }}>
                <Text>如果問題持續存在，請聯繫技術支援團隊</Text>
              </div>
            </Space>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary; 