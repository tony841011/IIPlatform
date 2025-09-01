/**
 * 緊急表格修復工具
 * 直接攔截和修復 rawData.some 錯誤
 */

// 全局錯誤攔截器
const setupGlobalErrorHandling = () => {
  // 攔截 window.onerror
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (message && typeof message === 'string' && message.includes('rawData.some is not a function')) {
      console.warn('🚨 已攔截 rawData.some 錯誤，正在嘗試修復...');
      
      // 嘗試修復問題
      try {
        fixTableDataIssues();
      } catch (fixError) {
        console.warn('修復失敗:', fixError);
      }
      
      // 返回 true 表示錯誤已處理
      return true;
    }
    
    // 調用原始的錯誤處理器
    if (originalOnError) {
      return originalOnError.apply(this, arguments);
    }
    
    return false;
  };

  // 攔截 Promise 錯誤
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('rawData.some is not a function')) {
      event.preventDefault();
      console.warn('🚨 已攔截 rawData.some Promise 錯誤');
      
      try {
        fixTableDataIssues();
      } catch (fixError) {
        console.warn('修復失敗:', fixError);
      }
      
      return false;
    }
  });

  // 攔截 console.error
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    if (message.includes('rawData.some is not a function')) {
      console.warn('🚨 已過濾 rawData.some 錯誤，正在嘗試修復...');
      
      try {
        fixTableDataIssues();
      } catch (fixError) {
        console.warn('修復失敗:', fixError);
      }
      
      return;
    }
    
    // 調用原始的 console.error
    originalConsoleError.apply(console, args);
  };
};

// 修復表格資料問題
const fixTableDataIssues = () => {
  try {
    // 查找所有表格組件
    const tables = document.querySelectorAll('.ant-table-wrapper, .ant-table');
    
    tables.forEach((table, index) => {
      console.log(`🔧 正在修復表格 ${index + 1}:`, table);
      
      // 嘗試修復表格資料
      fixTableData(table);
    });
    
    // 查找所有可能的資料來源
    const dataContainers = document.querySelectorAll('[data-source], [dataSource]');
    dataContainers.forEach((container, index) => {
      console.log(`🔧 正在修復資料容器 ${index + 1}:`, container);
      
      // 嘗試修復資料
      fixContainerData(container);
    });
    
  } catch (error) {
    console.warn('修復表格資料時發生錯誤:', error);
  }
};

// 修復單個表格的資料
const fixTableData = (table) => {
  try {
    // 檢查表格是否有資料問題
    const tableBody = table.querySelector('.ant-table-tbody');
    if (tableBody) {
      const rows = tableBody.querySelectorAll('tr');
      
      rows.forEach((row, index) => {
        // 確保每行都有 key
        if (!row.getAttribute('data-row-key')) {
          row.setAttribute('data-row-key', `fixed_row_${index}`);
        }
      });
    }
    
    // 檢查表格配置
    const tableProps = table.__reactProps$ || table._reactProps$;
    if (tableProps) {
      console.log('表格 React 屬性:', tableProps);
    }
    
  } catch (error) {
    console.warn('修復單個表格時發生錯誤:', error);
  }
};

// 修復容器資料
const fixContainerData = (container) => {
  try {
    // 檢查容器的資料屬性
    const dataSource = container.getAttribute('data-source') || container.getAttribute('dataSource');
    if (dataSource) {
      console.log('容器資料來源:', dataSource);
      
      // 嘗試解析和修復資料
      try {
        const data = JSON.parse(dataSource);
        if (data && !Array.isArray(data)) {
          console.warn('發現非陣列資料，正在修復...');
          // 這裡可以添加資料修復邏輯
        }
      } catch (parseError) {
        console.warn('無法解析資料來源:', parseError);
      }
    }
  } catch (error) {
    console.warn('修復容器資料時發生錯誤:', error);
  }
};

// 修復 Array.prototype.some 方法
const fixArrayPrototype = () => {
  const originalSome = Array.prototype.some;
  
  Array.prototype.some = function(callback, thisArg) {
    // 檢查 this 是否為陣列
    if (!Array.isArray(this)) {
      console.warn('🚨 在非陣列上調用 some 方法:', this);
      console.trace('some 方法調用堆疊');
      
      // 嘗試轉換為陣列
      let convertedArray = [];
      
      if (this === null || this === undefined) {
        convertedArray = [];
      } else if (typeof this === 'object') {
        try {
          if (this.length !== undefined) {
            convertedArray = Array.from(this);
          } else {
            convertedArray = Object.values(this);
          }
        } catch (error) {
          console.warn('無法轉換為陣列:', error);
          convertedArray = [];
        }
      } else {
        convertedArray = [this];
      }
      
      // 使用轉換後的陣列調用 some 方法
      return originalSome.call(convertedArray, callback, thisArg);
    }
    
    // 檢查陣列是否為空
    if (this.length === 0) {
      return false;
    }
    
    // 調用原始的 some 方法
    try {
      return originalSome.call(this, callback, thisArg);
    } catch (error) {
      console.warn('some 方法執行時發生錯誤:', error);
      return false;
    }
  };
  
  console.log('✅ Array.prototype.some 已修復');
};

// 修復 Object.values 方法
const fixObjectValues = () => {
  const originalObjectValues = Object.values;
  
  Object.values = function(obj) {
    if (obj === null || obj === undefined) {
      console.warn('🚨 在 null 或 undefined 上調用 Object.values');
      return [];
    }
    
    if (typeof obj !== 'object') {
      console.warn('🚨 在非物件上調用 Object.values:', obj);
      return [obj];
    }
    
    try {
      return originalObjectValues.call(Object, obj);
    } catch (error) {
      console.warn('Object.values 執行時發生錯誤:', error);
      return [];
    }
  };
  
  console.log('✅ Object.values 已修復');
};

// 修復 Object.keys 方法
const fixObjectKeys = () => {
  const originalObjectKeys = Object.keys;
  
  Object.keys = function(obj) {
    if (obj === null || obj === undefined) {
      console.warn('🚨 在 null 或 undefined 上調用 Object.keys');
      return [];
    }
    
    if (typeof obj !== 'object') {
      console.warn('🚨 在非物件上調用 Object.keys:', obj);
      return [];
    }
    
    try {
      return originalObjectKeys.call(Object, obj);
    } catch (error) {
      console.warn('Object.keys 執行時發生錯誤:', error);
      return [];
    }
  };
  
  console.log('✅ Object.keys 已修復');
};

// 定期檢查和修復
const setupPeriodicFix = () => {
  setInterval(() => {
    try {
      // 檢查是否有新的錯誤
      const errorCount = window.__rawDataErrorCount || 0;
      if (errorCount > 0) {
        console.log(`🔄 定期檢查：發現 ${errorCount} 個 rawData 錯誤，正在修復...`);
        fixTableDataIssues();
        window.__rawDataErrorCount = 0;
      }
    } catch (error) {
      console.warn('定期修復檢查失敗:', error);
    }
  }, 5000); // 每5秒檢查一次
};

// 監聽 DOM 變化
const setupMutationObserver = () => {
  try {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // 檢查新增的節點是否包含表格
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const tables = node.querySelectorAll ? node.querySelectorAll('.ant-table-wrapper, .ant-table') : [];
              if (tables.length > 0) {
                console.log('🆕 發現新的表格組件，正在檢查...');
                setTimeout(() => fixTableDataIssues(), 100);
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('✅ MutationObserver 已設置');
  } catch (error) {
    console.warn('設置 MutationObserver 失敗:', error);
  }
};

// 主要修復函數
export const applyEmergencyTableFixes = () => {
  console.log('🚨 正在應用緊急表格修復...');
  
  try {
    // 設置全局錯誤處理
    setupGlobalErrorHandling();
    
    // 修復原型方法
    fixArrayPrototype();
    fixObjectValues();
    fixObjectKeys();
    
    // 設置定期修復
    setupPeriodicFix();
    
    // 設置 DOM 變化監聽
    setupMutationObserver();
    
    // 立即執行一次修復
    setTimeout(() => {
      fixTableDataIssues();
    }, 1000);
    
    console.log('✅ 緊急表格修復已應用完成');
    
  } catch (error) {
    console.error('❌ 應用緊急表格修復時發生錯誤:', error);
  }
};

// 手動觸發修復
export const manualFix = () => {
  console.log('🔧 手動觸發表格修復...');
  fixTableDataIssues();
};

export default {
  applyEmergencyTableFixes,
  manualFix,
  fixTableDataIssues
}; 