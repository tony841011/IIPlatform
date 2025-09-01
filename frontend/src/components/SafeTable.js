import React from 'react';
import { Table } from 'antd';
import { ensureArray, isValidTableData } from '../utils/dataUtils';

/**
 * 安全的 Table 組件包裝器
 * 防止 rawData.some is not a function 等錯誤
 */
const SafeTable = ({ dataSource, columns, ...props }) => {
  // 確保 dataSource 是安全的陣列
  const safeDataSource = ensureArray(dataSource);
  
  // 確保 columns 是陣列
  const safeColumns = Array.isArray(columns) ? columns : [];
  
  // 如果沒有有效資料，顯示空表格
  if (!isValidTableData(safeDataSource)) {
    return (
      <Table
        dataSource={[]}
        columns={safeColumns}
        locale={{
          emptyText: '無數據或數據格式無效'
        }}
        {...props}
      />
    );
  }

  // 清理資料，確保每個項目都是有效的物件
  const cleanedDataSource = safeDataSource.map((item, index) => {
    if (!item || typeof item !== 'object') {
      return { key: index, error: '無效資料' };
    }
    
    // 確保每個項目都有 key
    if (!item.key && !item.id) {
      item.key = index;
    }
    
    return item;
  });

  return (
    <Table
      dataSource={cleanedDataSource}
      columns={safeColumns}
      rowKey={(record, index) => record.key || record.id || index}
      {...props}
    />
  );
};

export default SafeTable; 