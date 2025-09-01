import React, { useState, useEffect } from 'react';
import { Card, Button, Space, message, Alert, Typography, Divider, Badge } from 'antd';
import { DatabaseOutlined, BugOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const DatabaseConnectionTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [currentTest, setCurrentTest] = useState('');
  const [apiStatus, setApiStatus] = useState('unknown');

  // 測試案例
  const testCases = [
    {
      name: 'API 端點測試',
      description: '測試資料庫連線 API 是否可達',
      test: async () => {
        try {
          const response = await fetch('http://localhost:8000/api/v1/database-connections/');
          if (response.ok) {
            const data = await response.json();
            return {
              status: 'success',
              message: `API 響應成功，狀態碼: ${response.status}`,
              data: data
            };
          } else {
            return {
              status: 'error',
              message: `API 響應失敗，狀態碼: ${response.status}`,
              data: null
            };
          }
        } catch (error) {
          return {
            status: 'error',
            message: `API 請求失敗: ${error.message}`,
            data: null
          };
        }
      }
    },
    {
      name: '資料格式測試',
      description: '測試 API 返回的資料格式是否正確',
      test: async () => {
        try {
          const response = await fetch('http://localhost:8000/api/v1/database-connections/');
          if (response.ok) {
            const data = await response.json();
            
            if (Array.isArray(data)) {
              return {
                status: 'success',
                message: `資料格式正確，返回陣列，長度: ${data.length}`,
                data: data
              };
            } else {
              return {
                status: 'error',
                message: `資料格式錯誤，預期陣列，實際: ${typeof data}`,
                data: data
              };
            }
          } else {
            return {
              status: 'error',
              message: `API 響應失敗，無法測試資料格式`,
              data: null
            };
          }
        } catch (error) {
          return {
            status: 'error',
            message: `測試失敗: ${error.message}`,
            data: null
          };
        }
      }
    },
    {
      name: '空資料處理測試',
      description: '測試空資料或無效資料的處理',
      test: async () => {
        // 模擬各種資料格式
        const testData = [
          null,
          undefined,
          'string',
          123,
          {},
          [],
          [null, undefined, 'string', 123, {}]
        ];
        
        const results = testData.map((data, index) => {
          try {
            if (Array.isArray(data)) {
              // 測試陣列方法
              const hasError = data.some(item => item && item.status === 'error');
              return {
                input: data,
                isValid: true,
                message: '陣列資料有效'
              };
            } else {
              return {
                input: data,
                isValid: false,
                message: '非陣列資料無效'
              };
            }
          } catch (error) {
            return {
              input: data,
              isValid: false,
              message: `處理失敗: ${error.message}`
            };
          }
        });
        
        return {
          status: 'success',
          message: '空資料處理測試完成',
          data: results
        };
      }
    },
    {
      name: 'Table 組件測試',
      description: '測試 Ant Design Table 組件的資料處理',
      test: async () => {
        // 模擬各種資料格式傳遞給 Table
        const testData = [
          { id: 1, name: '測試連線1', type: 'postgresql' },
          { id: 2, name: '測試連線2', type: 'mongodb' }
        ];
        
        try {
          // 測試資料是否有效
          if (Array.isArray(testData)) {
            const isValid = testData.every(item => 
              item && typeof item === 'object' && item.id && item.name
            );
            
            if (isValid) {
              return {
                status: 'success',
                message: 'Table 資料格式正確',
                data: testData
              };
            } else {
              return {
                status: 'error',
                message: 'Table 資料格式不完整',
                data: testData
              };
            }
          } else {
            return {
              status: 'error',
              message: 'Table 資料不是陣列',
              data: testData
            };
          }
        } catch (error) {
          return {
            status: 'error',
            message: `Table 測試失敗: ${error.message}`,
            data: null
          };
        }
      }
    }
  ];

  const runTest = async (testCase) => {
    setCurrentTest(testCase.name);
    message.info(`正在測試: ${testCase.name}`);
    
    const testResult = {
      name: testCase.name,
      description: testCase.description,
      status: 'running',
      message: '',
      data: null,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setTestResults(prev => [...prev, testResult]);
    
    try {
      const result = await testCase.test();
      
      testResult.status = result.status;
      testResult.message = result.message;
      testResult.data = result.data;
      
      // 更新 API 狀態
      if (testCase.name === 'API 端點測試') {
        setApiStatus(result.status);
      }
      
    } catch (error) {
      testResult.status = 'error';
      testResult.message = `測試執行失敗: ${error.message}`;
      testResult.data = null;
    }
    
    setTestResults(prev => prev.map(r => 
      r.name === testCase.name ? testResult : r
    ));
    
    setCurrentTest('');
  };

  const runAllTests = async () => {
    setTestResults([]);
    setApiStatus('unknown');
    
    for (let i = 0; i < testCases.length; i++) {
      await runTest(testCases[i]);
      // 延遲一下避免同時執行太多測試
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setApiStatus('unknown');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'running': return 'blue';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return '成功';
      case 'error': return '錯誤';
      case 'running': return '測試中';
      default: return '未知';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleOutlined style={{ color: 'green' }} />;
      case 'error': return <ExclamationCircleOutlined style={{ color: 'red' }} />;
      case 'running': return <BugOutlined style={{ color: 'blue' }} spin />;
      default: return <BugOutlined />;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title="資料庫連線管理測試工具" extra={
        <Space>
          <Button 
            type="primary" 
            icon={<DatabaseOutlined />} 
            onClick={runAllTests}
            loading={currentTest !== ''}
          >
            執行所有測試
          </Button>
          <Button icon={<BugOutlined />} onClick={clearResults}>
            清除結果
          </Button>
        </Space>
      }>
        <Alert
          message="測試說明"
          description="此工具專門測試資料庫連線管理頁面的各種情況，包括 API 端點、資料格式、錯誤處理等。"
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />

        {/* API 狀態顯示 */}
        <Card size="small" style={{ marginBottom: '20px' }}>
          <Title level={5}>API 狀態</Title>
          <Space>
            <Badge 
              status={apiStatus === 'success' ? 'success' : apiStatus === 'error' ? 'error' : 'default'} 
              text={
                apiStatus === 'success' ? 'API 正常' :
                apiStatus === 'error' ? 'API 異常' :
                'API 狀態未知'
              }
            />
          </Space>
        </Card>

        {/* 測試按鈕 */}
        <div style={{ marginBottom: '20px' }}>
          <Title level={5}>個別測試:</Title>
          <Space wrap>
            {testCases.map((testCase) => (
              <Button
                key={testCase.name}
                onClick={() => runTest(testCase)}
                loading={currentTest === testCase.name}
                size="small"
                type={testCase.name.includes('錯誤') ? 'danger' : 'default'}
              >
                {testCase.name}
              </Button>
            ))}
          </Space>
        </div>

        {/* 測試結果 */}
        <div>
          <Title level={5}>測試結果:</Title>
          {testResults.length === 0 ? (
            <Paragraph>尚未執行測試</Paragraph>
          ) : (
            <div>
              {testResults.map((result, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{ marginBottom: '10px' }}
                  title={
                    <Space>
                      {getStatusIcon(result.status)}
                      <span>{result.name}</span>
                      <span style={{ color: getStatusColor(result.status) }}>
                        {getStatusText(result.status)}
                      </span>
                    </Space>
                  }
                  extra={
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {result.timestamp}
                    </span>
                  }
                >
                  <div>
                    <Paragraph><strong>描述:</strong> {result.description}</Paragraph>
                    <Paragraph><strong>結果:</strong> {result.message}</Paragraph>
                    {result.data && (
                      <details style={{ marginTop: '12px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                          詳細資料
                        </summary>
                        <pre style={{ 
                          marginTop: '8px',
                          background: '#f5f5f5',
                          padding: '8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* 問題診斷 */}
        <Card size="small" title="問題診斷">
          <Paragraph>
            <strong>常見問題:</strong>
          </Paragraph>
          <ul>
            <li>API 端點不可達 - 檢查後端服務是否運行</li>
            <li>資料格式錯誤 - 檢查 API 返回的資料結構</li>
            <li>rawData.some 錯誤 - 檢查傳遞給 Table 的資料是否為陣列</li>
            <li>網路錯誤 - 檢查 CORS 設定和網路連線</li>
          </ul>
          
          <Paragraph>
            <strong>解決方案:</strong>
          </Paragraph>
          <ul>
            <li>確保後端服務在 localhost:8000 運行</li>
            <li>檢查 API 響應的資料格式</li>
            <li>使用安全的資料處理函數</li>
            <li>添加錯誤邊界和降級處理</li>
          </ul>
        </Card>
      </Card>
    </div>
  );
};

export default DatabaseConnectionTest; 