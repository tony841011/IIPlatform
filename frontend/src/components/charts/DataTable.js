import React, { useState, useEffect } from 'react';
import { Card, Table, Empty, Input, Space, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { ensureArray, safeSearch, generateSafeColumns, isValidTableData } from '../../utils/dataUtils';

const { Search } = Input;

const DataTable = ({ data, config = {} }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // 使用資料安全工具確保資料是陣列格式
  const safeData = ensureArray(data);

  useEffect(() => {
    setFilteredData(safeData);
  }, [safeData]);

  // 如果沒有有效資料，顯示空狀態
  if (!isValidTableData(safeData)) {
    return (
      <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="無數據或數據格式無效" />
      </Card>
    );
  }

  // 使用安全的列生成函數
  const columns = generateSafeColumns(safeData);

  // 安全的搜索功能
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredData(safeData);
      return;
    }
    
    const filtered = safeSearch(safeData, value);
    setFilteredData(filtered);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchText('');
    setFilteredData(safeData);
  };

  // 確保過濾後的資料是陣列
  const safeFilteredData = ensureArray(filteredData);

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
          dataSource={safeFilteredData}
          pagination={{
            pageSize: config.pageSize || 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
          }}
          scroll={{ x: 'max-content', y: 'max-content' }}
          size="small"
          bordered
          rowKey={(record, index) => record.id || record.key || index}
        />
      </div>
    </div>
  );
};

export default DataTable; 