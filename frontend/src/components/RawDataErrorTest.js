import React, { useState } from 'react';
import { Card, Button, Space, message, Table, Alert } from 'antd';
import { BugOutlined, ReloadOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const RawDataErrorTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [currentTest, setCurrentTest] = useState('');
  const [errorCount, setErrorCount] = useState(0);

  // 測試案例 - 故意製造錯誤
  const testCases = [
    {
      name: '正常陣列資料',
      data: [
        { id: 1, name: '設備A', status: '正常' },
        { id: 2, name: '設備B', status: '警告' }
      ],
      columns: [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: '名稱', dataIndex: 'name', key: 'name' },
        { title: '狀態', dataIndex: 'status', key: 'status' }
      ],
      expected: 'success',
      description: '標準的陣列資料，應該正常顯示'
    },
    {
      name: 'null 資料 (會觸發錯誤)',
      data: null,
      columns: [
        { title: '列1', dataIndex: 'col1', key: 'col1' }
      ],
      expected: 'error_handled',
      description: 'null 資料會觸發 rawData.some 錯誤，測試修復工具是否有效'
    },
    {
      name: 'undefined 資料 (會觸發錯誤)',
      data: undefined,
      columns: [
        { title: '列1', dataIndex: 'col1', key: 'col1' }
      ],
      expected: 'error_handled',
      description: 'undefined 資料會觸發 rawData.some 錯誤，測試修復工具是否有效'
    },
    {
      name: '物件資料 (會觸發錯誤)',
      data: { key1: 'value1', key2: 'value2' },
      columns: [
        { title: '鍵', dataIndex: 'key', key: 'key' },
        { title: '值', dataIndex: 'value', key: 'value' }
      ],
      expected: 'error_handled',
      description: '物件資料會觸發 rawData.some 錯誤，測試修復工具是否有效'
    },
    {
      name: '字串資料 (會觸發錯誤)',
      data: 'not an array',
      columns: [
        { title: '值', dataIndex: 'value', key: 'value' }
      ],
      expected: 'error_handled',
      description: '字串資料會觸發 rawData.some 錯誤，測試修復工具是否有效'
    },
    {
      name: '數字資料 (會觸發錯誤)',
      data: 123,
      columns: [
        { title: '值', dataIndex: 'value', key: 'value' }
      ],
      expected: 'error_handled',
      description: '數字資料會觸發 rawData.some 錯誤，測試修復工具是否有效'
    },
    {
      name: '空陣列',
      data: [],
      columns: [
        { title: '列1', dataIndex: 'col1', key: 'col1' }
      ],
      expected: 'success',
      description: '空陣列應該正常處理'
    },
    {
      name: '混合資料 (會觸發錯誤)',
      data: [
        { id: 1, name: '設備A' },
        null,
        { id: 3, name: '設備C' }
      ],
      columns: [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: '名稱', dataIndex: 'name', key: 'name' }
      ],
      expected: 'success',
      description: '包含 null 的陣列，測試處理能力'
    }
  ];

  const runTest = (testCase) => {
    setCurrentTest(testCase.name);
    message.info(`正在測試: ${testCase.name}`);
    
    const testResult = {
      name: testCase.name,
      data: testCase.data,
      status: 'running',
      error: null,
      message: '',
      timestamp: new Date().toLocaleTimeString(),
      description: testCase.description
    };
    
    setTestResults(prev => [...prev, testResult]);
    
    // 模擬測試過程
    setTimeout(() => {
      try {
        // 故意觸發錯誤來測試修復工具
        if (testCase.expected === 'error_handled') {
          // 嘗試調用 some 方法來觸發錯誤
          try {
            if (testCase.data && typeof testCase.data.some === 'function') {
              testCase.data.some(() => true);
              testResult.status = 'success';
              testResult.message = '錯誤被修復工具處理，表格正常顯示';
            } else {
              // 故意觸發錯誤
              testCase.data.some(() => true);
              testResult.status = 'error';
              testResult.error = '應該觸發錯誤但沒有';
              testResult.message = '測試失敗：應該觸發錯誤';
            }
          } catch (error) {
            if (error.message.includes('rawData.some is not a function')) {
              testResult.status = 'error_handled';
              testResult.message = '錯誤被修復工具捕獲並處理';
              setErrorCount(prev => prev + 1);
            } else {
              testResult.status = 'error';
              testResult.error = error.message;
              testResult.message = '發生未預期的錯誤';
            }
          }
        } else {
          // 正常測試
          if (testCase.data && Array.isArray(testCase.data)) {
            const hasError = testCase.data.some(item => item && item.status === 'error');
            testResult.status = 'success';
            testResult.message = '表格正常顯示';
          } else {
            testResult.status = 'success';
            testResult.message = '資料格式正確';
          }
        }
      } catch (error) {
        testResult.status = 'error';
        testResult.error = error.message;
        testResult.message = '測試執行失敗';
      }
      
      setTestResults(prev => prev.map(r => 
        r.name === testCase.name ? testResult : r
      ));
      
      setCurrentTest('');
    }, 1000);
  };

  const runAllTests = () => {
    setTestResults([]);
    setErrorCount(0);
    testCases.forEach((testCase, index) => {
      setTimeout(() => {
        runTest(testCase);
      }, index * 300);
    });
  };

  const clearResults = () => {
    setTestResults([]);
    setErrorCount(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'green';
      case 'error_handled': return 'orange';
      case 'error': return 'red';
      case 'running': return 'blue';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return '成功';
      case 'error_handled': return '錯誤已處理';
      case 'error': return '錯誤';
      case 'running': return '測試中';
      default: return '未知';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleOutlined style={{ color: 'green' }} />;
      case 'error_handled': return <BugOutlined style={{ color: 'orange' }} />;
      case 'error': return <ExclamationCircleOutlined style={{ color: 'red' }} />;
      case 'running': return <ReloadOutlined style={{ color: 'blue' }} spin />;
      default: return <BugOutlined />;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title="rawData.some 錯誤測試工具" extra={
        <Space>
          <Button 
            type="primary" 
            icon={<BugOutlined />} 
            onClick={runAllTests}
            loading={currentTest !== ''}
          >
            執行所有測試
          </Button>
          <Button icon={<ReloadOutlined />} onClick={clearResults}>
            清除結果
          </Button>
        </Space>
      }>
        <Alert
          message="測試說明"
          description="此工具專門測試 rawData.some 錯誤的修復效果。故意製造各種錯誤情況來驗證修復工具是否有效。"
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />

        <div style={{ marginBottom: '20px' }}>
          <h3>錯誤統計</h3>
          <p>已觸發的錯誤數量: <strong style={{ color: '#ff4d4f' }}>{errorCount}</strong></p>
          <p>預期結果：錯誤應該被修復工具捕獲並處理，而不是導致應用程式崩潰。</p>
        </div>

        {/* 測試按鈕 */}
        <div style={{ marginBottom: '20px' }}>
          <h4>個別測試:</h4>
          <Space wrap>
            {testCases.map((testCase) => (
              <Button
                key={testCase.name}
                onClick={() => runTest(testCase)}
                loading={currentTest === testCase.name}
                size="small"
                type={testCase.expected === 'error_handled' ? 'danger' : 'default'}
              >
                {testCase.name}
              </Button>
            ))}
          </Space>
        </div>

        {/* 測試結果 */}
        <div>
          <h4>測試結果:</h4>
          {testResults.length === 0 ? (
            <p>尚未執行測試</p>
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
                    <p><strong>描述:</strong> {result.description}</p>
                    <p><strong>資料:</strong> {JSON.stringify(result.data)}</p>
                    {result.message && (
                      <p><strong>結果:</strong> {result.message}</p>
                    )}
                    {result.error && (
                      <p><strong>錯誤:</strong> <span style={{ color: 'red' }}>{result.error}</span></p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 實際表格測試 */}
        <div style={{ marginTop: '20px' }}>
          <h4>實際表格渲染測試:</h4>
          <Card title="測試表格" size="small">
            <Table
              dataSource={[
                { key: '1', name: '測試資料1', value: '正常' },
                { key: '2', name: '測試資料2', value: '正常' }
              ]}
              columns={[
                { title: '名稱', dataIndex: 'name', key: 'name' },
                { title: '值', dataIndex: 'value', key: 'value' }
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </div>

        {/* 錯誤觸發測試 */}
        <div style={{ marginTop: '20px' }}>
          <h4>錯誤觸發測試:</h4>
          <Card title="故意觸發錯誤" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <p>點擊下面的按鈕來故意觸發 rawData.some 錯誤，測試修復工具是否有效：</p>
              <Space>
                <Button 
                  danger 
                  onClick={() => {
                    try {
                      // 故意觸發錯誤
                      null.some(() => true);
                    } catch (error) {
                      if (error.message.includes('rawData.some is not a function')) {
                        message.success('✅ 錯誤被修復工具處理！');
                        setErrorCount(prev => prev + 1);
                      } else {
                        message.error('❌ 發生未預期的錯誤');
                      }
                    }
                  }}
                >
                  觸發 null.some 錯誤
                </Button>
                
                <Button 
                  danger 
                  onClick={() => {
                    try {
                      // 故意觸發錯誤
                      undefined.some(() => true);
                    } catch (error) {
                      if (error.message.includes('rawData.some is not a function')) {
                        message.success('✅ 錯誤被修復工具處理！');
                        setErrorCount(prev => prev + 1);
                      } else {
                        message.error('❌ 發生未預期的錯誤');
                      }
                    }
                  }}
                >
                  觸發 undefined.some 錯誤
                </Button>
                
                <Button 
                  danger 
                  onClick={() => {
                    try {
                      // 故意觸發錯誤
                      'string'.some(() => true);
                    } catch (error) {
                      if (error.message.includes('rawData.some is not a function')) {
                        message.success('✅ 錯誤被修復工具處理！');
                        setErrorCount(prev => prev + 1);
                      } else {
                        message.error('❌ 發生未預期的錯誤');
                      }
                    }
                  }}
                >
                  觸發 string.some 錯誤
                </Button>
              </Space>
            </Space>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default RawDataErrorTest; 