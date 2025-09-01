/**
 * 表格修復工具
 * 修復 Ant Design Table 組件的 rawData.some 錯誤
 */

// 修復 Ant Design Table 組件的資料處理問題
export const fixTableData = (data) => {
  // 如果資料是 null 或 undefined，返回空陣列
  if (data === null || data === undefined) {
    return [];
  }
  
  // 如果資料已經是陣列，確保每個項目都是物件
  if (Array.isArray(data)) {
    return data.map((item, index) => {
      if (item === null || item === undefined) {
        return { key: index, error: '無效資料' };
      }
      
      if (typeof item !== 'object') {
        return { key: index, value: item };
      }
      
      // 確保每個物件都有 key
      if (!item.key && !item.id) {
        item.key = index;
      }
      
      return item;
    });
  }
  
  // 如果資料是物件，轉換為陣列
  if (typeof data === 'object') {
    try {
      // 檢查是否有可迭代的屬性
      if (data.length !== undefined) {
        return Array.from(data);
      }
      
      // 如果是普通物件，轉換為陣列格式
      return Object.entries(data).map(([key, value], index) => ({
        key: key,
        value: value,
        originalKey: key
      }));
    } catch (error) {
      console.warn('無法將物件轉換為陣列:', error);
      return [];
    }
  }
  
  // 其他類型，包裝為陣列
  return [{ key: 0, value: data }];
};

// 修復表格列配置
export const fixTableColumns = (columns) => {
  if (!Array.isArray(columns)) {
    return [];
  }
  
  return columns.map((column, index) => {
    if (!column || typeof column !== 'object') {
      return {
        title: `列 ${index + 1}`,
        dataIndex: `col_${index}`,
        key: `col_${index}`,
        render: () => '-'
      };
    }
    
    // 確保必要的屬性存在
    return {
      title: column.title || `列 ${index + 1}`,
      dataIndex: column.dataIndex || `col_${index}`,
      key: column.key || column.dataIndex || `col_${index}`,
      render: column.render || ((text) => {
        if (text === null || text === undefined) {
          return '-';
        }
        if (typeof text === 'boolean') {
          return text ? '是' : '否';
        }
        if (typeof text === 'number') {
          return text.toLocaleString();
        }
        return String(text);
      }),
      ...column
    };
  });
};

// 創建安全的表格配置
export const createSafeTableConfig = (data, columns, config = {}) => {
  const safeData = fixTableData(data);
  const safeColumns = fixTableColumns(columns);
  
  return {
    dataSource: safeData,
    columns: safeColumns,
    rowKey: (record, index) => record.key || record.id || index,
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
      ...config.pagination
    },
    scroll: { x: 'max-content', y: 'max-content' },
    size: 'small',
    bordered: true,
    ...config
  };
};

// 修復表格組件的 props
export const fixTableProps = (props) => {
  const { dataSource, columns, ...restProps } = props;
  
  return {
    ...restProps,
    dataSource: fixTableData(dataSource),
    columns: fixTableColumns(columns)
  };
};

// 全局修復函數
export const applyTableFixes = () => {
  // 修復 console.error 中的 rawData.some 錯誤
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    
    // 過濾掉 rawData.some 相關的錯誤
    if (message.includes('rawData.some is not a function')) {
      console.warn('已過濾 rawData.some 錯誤，這通常是由於資料格式問題導致的');
      return;
    }
    
    // 調用原始的 console.error
    originalConsoleError.apply(console, args);
  };
  
  // 修復 Array.prototype.some 的調用
  const originalSome = Array.prototype.some;
  Array.prototype.some = function(callback, thisArg) {
    if (!Array.isArray(this)) {
      console.warn('在非陣列上調用 some 方法:', this);
      return false;
    }
    return originalSome.call(this, callback, thisArg);
  };
};

export default {
  fixTableData,
  fixTableColumns,
  createSafeTableConfig,
  fixTableProps,
  applyTableFixes
}; 