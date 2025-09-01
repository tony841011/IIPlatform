import React, { useState } from 'react';
import { Card, Button, Space, message } from 'antd';
import { ReloadOutlined, BugOutlined } from '@ant-design/icons';
import DataTable from './charts/DataTable';

const TestDataTable = () => {
  const [testData, setTestData] = useState([
    { id: 1, name: '設備A', status: '正常', value: 25.6 },
    { id: 2, name: '設備B', status: '警告', value: 45.2 },
    { id: 3, name: '設備C', status: '正常', value: 32.1 }
  ]);

  const [testCase, setTestCase] = useState('normal');

  // 測試不同的資料格式
  const testCases = {
    normal: [
      { id: 1, name: '設備A', status: '正常', value: 25.6 },
      { id: 2, name: '設備B', status: '警告', value: 45.2 },
      { id: 3, name: '設備C', status: '正常', value: 32.1 }
    ],
    null: null,
    undefined: undefined,
    emptyArray: [],
    object: { key: 'value' },
    string: 'not an array',
    number: 123,
    boolean: true
  };

  const runTest = (testType) => {
    setTestCase(testType);
    const data = testCases[testType];
    
    message.info(`測試資料類型: ${testType}`);
    console.log('測試資料:', data);
    console.log('資料類型:', typeof data);
    console.log('是否為陣列:', Array.isArray(data));
    
    setTestData(data);
  };

  const resetTest = () => {
    setTestCase('normal');
    setTestData(testCases.normal);
    message.success('已重置為正常資料');
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title="DataTable 組件測試" extra={
        <Space>
          <Button icon={<BugOutlined />} onClick={() => runTest('null')}>
            測試 null
          </Button>
          <Button icon={<BugOutlined />} onClick={() => runTest('undefined')}>
            測試 undefined
          </Button>
          <Button icon={<BugOutlined />} onClick={() => runTest('emptyArray')}>
            測試空陣列
          </Button>
          <Button icon={<BugOutlined />} onClick={() => runTest('object')}>
            測試物件
          </Button>
          <Button icon={<BugOutlined />} onClick={() => runTest('string')}>
            測試字串
          </Button>
          <Button icon={<BugOutlined />} onClick={() => runTest('number')}>
            測試數字
          </Button>
          <Button icon={<BugOutlined />} onClick={() => runTest('boolean')}>
            測試布林值
          </Button>
          <Button icon={<ReloadOutlined />} onClick={resetTest} type="primary">
            重置
          </Button>
        </Space>
      }>
        <div style={{ marginBottom: '20px' }}>
          <h3>當前測試案例: {testCase}</h3>
          <p>資料類型: {typeof testData}</p>
          <p>是否為陣列: {Array.isArray(testData) ? '是' : '否'}</p>
          <p>資料內容: {JSON.stringify(testData, null, 2)}</p>
        </div>

        <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px', padding: '10px' }}>
          <h4>DataTable 組件渲染:</h4>
          <DataTable data={testData} config={{ pageSize: 5 }} />
        </div>
      </Card>
    </div>
  );
};

export default TestDataTable; 