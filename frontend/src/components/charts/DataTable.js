import React, { useState } from 'react';
import { Card, Table, Empty, Input, Space, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { Search } = Input;

const DataTable = ({ data, config = {} }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(data || []);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="無數據" />
      </Card>
    );
  }

  // 自動生成列配置
  const generateColumns = (data) => {
    if (!data || data.length === 0) return [];
    
    const firstRow = data[0];
    return Object.keys(firstRow).map(key => ({
      title: key.charAt(0).toUpperCase() + key.slice(1),
      dataIndex: key,
      key: key,
      sorter: (a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return aVal - bVal;
        }
        return String(aVal).localeCompare(String(bVal));
      },
      render: (text) => {
        if (typeof text === 'boolean') {
          return text ? '是' : '否';
        }
        if (typeof text === 'number') {
          return text.toLocaleString();
        }
        return text;
      }
    }));
  };

  const columns = generateColumns(data);

  // 搜索功能
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredData(data);
      return;
    }
    
    const filtered = data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchText('');
    setFilteredData(data);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 搜索欄 */}
      <div style={{ padding: '8px 0', marginBottom: '8px' }}>
        <Space>
          <Search
            placeholder="搜索數據..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleReset}
            size="small"
          >
            重置
          </Button>
        </Space>
      </div>

      {/* 表格 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: config.pageSize || 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
          }}
          scroll={{ y: 'calc(100vh - 300px)' }}
          size="small"
          bordered
          rowKey={(record, index) => record.id || index}
        />
      </div>
    </div>
  );
};

export default DataTable; 