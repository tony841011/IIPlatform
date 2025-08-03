import axios from 'axios';
import { message, notification, Modal } from 'antd';

// 通用 API 基礎 URL
const API_BASE_URL = 'http://localhost:8000';

// 通用錯誤處理
const handleError = (error, customMessage = '操作失敗') => {
  console.error('API Error:', error);
  const errorMessage = error.response?.data?.detail || error.message || customMessage;
  message.error(errorMessage);
};

// 通用成功處理
const handleSuccess = (msg = '操作成功') => {
  message.success(msg);
};

// 通用確認對話框
const showConfirm = (title, content, onOk) => {
  Modal.confirm({
    title,
    content,
    onOk,
    okText: '確認',
    cancelText: '取消',
  });
};

// 設備管理按鈕功能
export const deviceButtonHandlers = {
  // 新增設備
  addDevice: async (deviceData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/devices/`, deviceData);
      handleSuccess('設備新增成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '新增設備失敗');
      throw error;
    }
  },

  // 編輯設備
  editDevice: async (deviceId, deviceData, onSuccess) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/devices/${deviceId}`, deviceData);
      handleSuccess('設備更新成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '更新設備失敗');
      throw error;
    }
  },

  // 刪除設備
  deleteDevice: async (deviceId, onSuccess) => {
    showConfirm(
      '確認刪除',
      '確定要刪除此設備嗎？此操作無法撤銷。',
      async () => {
        try {
          await axios.delete(`${API_BASE_URL}/devices/${deviceId}`);
          handleSuccess('設備刪除成功');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '刪除設備失敗');
        }
      }
    );
  },

  // 設備控制
  controlDevice: async (deviceId, command, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/devices/${deviceId}/control`, {
        command,
        timestamp: new Date().toISOString()
      });
      handleSuccess('設備控制指令發送成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '設備控制失敗');
      throw error;
    }
  },

  // 設備重啟
  restartDevice: async (deviceId, onSuccess) => {
    showConfirm(
      '確認重啟',
      '確定要重啟此設備嗎？',
      async () => {
        try {
          await axios.post(`${API_BASE_URL}/devices/${deviceId}/restart`);
          handleSuccess('設備重啟指令發送成功');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '設備重啟失敗');
        }
      }
    );
  },

  // 設備測試
  testDevice: async (deviceId, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/devices/${deviceId}/test`);
      handleSuccess('設備測試完成');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '設備測試失敗');
      throw error;
    }
  }
};

// AI 分析按鈕功能
export const aiButtonHandlers = {
  // 創建 AI 模型
  createModel: async (modelData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai-models/`, modelData);
      handleSuccess('AI 模型創建成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '創建 AI 模型失敗');
      throw error;
    }
  },

  // 開始訓練
  startTraining: async (modelId, trainingData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai-models/${modelId}/train`, trainingData);
      handleSuccess('模型訓練開始');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '開始訓練失敗');
      throw error;
    }
  },

  // 部署模型
  deployModel: async (modelId, deploymentData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai-models/${modelId}/deploy`, deploymentData);
      handleSuccess('模型部署成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '模型部署失敗');
      throw error;
    }
  },

  // 停止訓練
  stopTraining: async (modelId, onSuccess) => {
    showConfirm(
      '確認停止',
      '確定要停止模型訓練嗎？',
      async () => {
        try {
          await axios.post(`${API_BASE_URL}/ai-models/${modelId}/stop-training`);
          handleSuccess('訓練已停止');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '停止訓練失敗');
        }
      }
    );
  },

  // 刪除模型
  deleteModel: async (modelId, onSuccess) => {
    showConfirm(
      '確認刪除',
      '確定要刪除此 AI 模型嗎？此操作無法撤銷。',
      async () => {
        try {
          await axios.delete(`${API_BASE_URL}/ai-models/${modelId}`);
          handleSuccess('模型刪除成功');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '刪除模型失敗');
        }
      }
    );
  },

  // 模型評估
  evaluateModel: async (modelId, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai-models/${modelId}/evaluate`);
      handleSuccess('模型評估完成');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '模型評估失敗');
      throw error;
    }
  }
};

// GPU 監控按鈕功能
export const gpuButtonHandlers = {
  // 模擬 GPU 監控
  simulateMonitoring: async (gpuId, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/gpu-devices/${gpuId}/simulate`);
      handleSuccess('GPU 監控模擬開始');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, 'GPU 監控模擬失敗');
      throw error;
    }
  },

  // 確認 GPU 警報
  acknowledgeGPUAlert: async (alertId, onSuccess) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/gpu-alerts/${alertId}/acknowledge`);
      handleSuccess('警報已確認');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '確認警報失敗');
      throw error;
    }
  },

  // 分配 GPU 資源
  allocateGPUResource: async (allocationData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/gpu-resource-allocations/`, allocationData);
      handleSuccess('GPU 資源分配成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, 'GPU 資源分配失敗');
      throw error;
    }
  },

  // 釋放 GPU 資源
  releaseGPUResource: async (allocationId, onSuccess) => {
    showConfirm(
      '確認釋放',
      '確定要釋放此 GPU 資源嗎？',
      async () => {
        try {
          await axios.delete(`${API_BASE_URL}/gpu-resource-allocations/${allocationId}`);
          handleSuccess('GPU 資源釋放成功');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '釋放 GPU 資源失敗');
        }
      }
    );
  }
};

// 警報管理按鈕功能
export const alertButtonHandlers = {
  // 確認警報
  acknowledgeAlert: async (alertId, onSuccess) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`);
      handleSuccess('警報已確認');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '確認警報失敗');
      throw error;
    }
  },

  // 刪除警報
  deleteAlert: async (alertId, onSuccess) => {
    showConfirm(
      '確認刪除',
      '確定要刪除此警報嗎？',
      async () => {
        try {
          await axios.delete(`${API_BASE_URL}/alerts/${alertId}`);
          handleSuccess('警報刪除成功');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '刪除警報失敗');
        }
      }
    );
  },

  // 批量確認警報
  bulkAcknowledgeAlerts: async (alertIds, onSuccess) => {
    showConfirm(
      '批量確認',
      `確定要確認 ${alertIds.length} 個警報嗎？`,
      async () => {
        try {
          await axios.post(`${API_BASE_URL}/alerts/bulk-acknowledge`, { alert_ids: alertIds });
          handleSuccess(`已確認 ${alertIds.length} 個警報`);
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '批量確認警報失敗');
        }
      }
    );
  }
};

// 工作流程按鈕功能
export const workflowButtonHandlers = {
  // 創建工作流程
  createWorkflow: async (workflowData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/workflows/`, workflowData);
      handleSuccess('工作流程創建成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '創建工作流程失敗');
      throw error;
    }
  },

  // 啟動工作流程
  startWorkflow: async (workflowId, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/workflows/${workflowId}/start`);
      handleSuccess('工作流程啟動成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '啟動工作流程失敗');
      throw error;
    }
  },

  // 停止工作流程
  stopWorkflow: async (workflowId, onSuccess) => {
    showConfirm(
      '確認停止',
      '確定要停止此工作流程嗎？',
      async () => {
        try {
          await axios.post(`${API_BASE_URL}/workflows/${workflowId}/stop`);
          handleSuccess('工作流程已停止');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '停止工作流程失敗');
        }
      }
    );
  },

  // 刪除工作流程
  deleteWorkflow: async (workflowId, onSuccess) => {
    showConfirm(
      '確認刪除',
      '確定要刪除此工作流程嗎？此操作無法撤銷。',
      async () => {
        try {
          await axios.delete(`${API_BASE_URL}/workflows/${workflowId}`);
          handleSuccess('工作流程刪除成功');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '刪除工作流程失敗');
        }
      }
    );
  }
};

// 規則引擎按鈕功能
export const ruleButtonHandlers = {
  // 創建規則
  createRule: async (ruleData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/rules/`, ruleData);
      handleSuccess('規則創建成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '創建規則失敗');
      throw error;
    }
  },

  // 啟用規則
  enableRule: async (ruleId, onSuccess) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/rules/${ruleId}`, { is_active: true });
      handleSuccess('規則已啟用');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '啟用規則失敗');
      throw error;
    }
  },

  // 禁用規則
  disableRule: async (ruleId, onSuccess) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/rules/${ruleId}`, { is_active: false });
      handleSuccess('規則已禁用');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '禁用規則失敗');
      throw error;
    }
  },

  // 刪除規則
  deleteRule: async (ruleId, onSuccess) => {
    showConfirm(
      '確認刪除',
      '確定要刪除此規則嗎？此操作無法撤銷。',
      async () => {
        try {
          await axios.delete(`${API_BASE_URL}/rules/${ruleId}`);
          handleSuccess('規則刪除成功');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '刪除規則失敗');
        }
      }
    );
  }
};

// OTA 更新按鈕功能
export const otaButtonHandlers = {
  // 創建 OTA 更新
  createOTAUpdate: async (updateData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ota-updates/`, updateData);
      handleSuccess('OTA 更新創建成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '創建 OTA 更新失敗');
      throw error;
    }
  },

  // 開始更新
  startUpdate: async (updateId, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ota-updates/${updateId}/start`);
      handleSuccess('OTA 更新開始');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '開始 OTA 更新失敗');
      throw error;
    }
  },

  // 取消更新
  cancelUpdate: async (updateId, onSuccess) => {
    showConfirm(
      '確認取消',
      '確定要取消此 OTA 更新嗎？',
      async () => {
        try {
          await axios.post(`${API_BASE_URL}/ota-updates/${updateId}/cancel`);
          handleSuccess('OTA 更新已取消');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '取消 OTA 更新失敗');
        }
      }
    );
  },

  // 刪除更新記錄
  deleteUpdate: async (updateId, onSuccess) => {
    showConfirm(
      '確認刪除',
      '確定要刪除此 OTA 更新記錄嗎？',
      async () => {
        try {
          await axios.delete(`${API_BASE_URL}/ota-updates/${updateId}`);
          handleSuccess('OTA 更新記錄刪除成功');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '刪除 OTA 更新記錄失敗');
        }
      }
    );
  }
};

// 數據庫連接按鈕功能
export const databaseButtonHandlers = {
  // 創建數據庫連接
  createConnection: async (connectionData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/database-connections/`, connectionData);
      handleSuccess('數據庫連接創建成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '創建數據庫連接失敗');
      throw error;
    }
  },

  // 測試連接
  testConnection: async (connectionId, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/database-connections/${connectionId}/test`);
      handleSuccess('連接測試成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '連接測試失敗');
      throw error;
    }
  },

  // 刪除連接
  deleteConnection: async (connectionId, onSuccess) => {
    showConfirm(
      '確認刪除',
      '確定要刪除此數據庫連接嗎？',
      async () => {
        try {
          await axios.delete(`${API_BASE_URL}/database-connections/${connectionId}`);
          handleSuccess('數據庫連接刪除成功');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '刪除數據庫連接失敗');
        }
      }
    );
  }
};

// 通訊協定按鈕功能
export const protocolButtonHandlers = {
  // 創建通訊協定配置
  createProtocol: async (protocolData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/communication-protocols/`, protocolData);
      handleSuccess('通訊協定配置創建成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '創建通訊協定配置失敗');
      throw error;
    }
  },

  // 測試協定連接
  testProtocol: async (protocolId, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/communication-protocols/${protocolId}/test`);
      handleSuccess('協定連接測試成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '協定連接測試失敗');
      throw error;
    }
  },

  // 刪除協定配置
  deleteProtocol: async (protocolId, onSuccess) => {
    showConfirm(
      '確認刪除',
      '確定要刪除此通訊協定配置嗎？',
      async () => {
        try {
          await axios.delete(`${API_BASE_URL}/communication-protocols/${protocolId}`);
          handleSuccess('通訊協定配置刪除成功');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '刪除通訊協定配置失敗');
        }
      }
    );
  }
};

// 角色管理按鈕功能
export const roleButtonHandlers = {
  // 創建角色
  createRole: async (roleData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/roles/`, roleData);
      handleSuccess('角色創建成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '創建角色失敗');
      throw error;
    }
  },

  // 分配權限
  assignPermissions: async (roleId, permissions, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/roles/${roleId}/permissions`, { permissions });
      handleSuccess('權限分配成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '分配權限失敗');
      throw error;
    }
  },

  // 刪除角色
  deleteRole: async (roleId, onSuccess) => {
    showConfirm(
      '確認刪除',
      '確定要刪除此角色嗎？此操作無法撤銷。',
      async () => {
        try {
          await axios.delete(`${API_BASE_URL}/roles/${roleId}`);
          handleSuccess('角色刪除成功');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '刪除角色失敗');
        }
      }
    );
  }
};

// 通知管理按鈕功能
export const notificationButtonHandlers = {
  // 創建通知群組
  createNotificationGroup: async (groupData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/notification-groups/`, groupData);
      handleSuccess('通知群組創建成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '創建通知群組失敗');
      throw error;
    }
  },

  // 發送測試通知
  sendTestNotification: async (notificationData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/notifications/test`, notificationData);
      handleSuccess('測試通知發送成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '發送測試通知失敗');
      throw error;
    }
  },

  // 更新通知偏好
  updateNotificationPreferences: async (preferences, onSuccess) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/notification-preferences/`, preferences);
      handleSuccess('通知偏好更新成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '更新通知偏好失敗');
      throw error;
    }
  }
};

// 報表系統按鈕功能
export const reportButtonHandlers = {
  // 創建報表模板
  createReportTemplate: async (templateData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/report-templates/`, templateData);
      handleSuccess('報表模板創建成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '創建報表模板失敗');
      throw error;
    }
  },

  // 生成報表
  generateReport: async (templateId, parameters, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reports/generate`, {
        template_id: templateId,
        parameters
      });
      handleSuccess('報表生成成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '生成報表失敗');
      throw error;
    }
  },

  // 下載報表
  downloadReport: async (reportId, onSuccess) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      
      // 創建下載連結
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      handleSuccess('報表下載成功');
      onSuccess && onSuccess();
    } catch (error) {
      handleError(error, '下載報表失敗');
      throw error;
    }
  },

  // 排程報表
  scheduleReport: async (scheduleData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reports/schedule`, scheduleData);
      handleSuccess('報表排程成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '排程報表失敗');
      throw error;
    }
  }
};

// 視頻識別按鈕功能
export const videoButtonHandlers = {
  // 創建視頻識別任務
  createVideoTask: async (taskData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/video-recognition-tasks/`, taskData);
      handleSuccess('視頻識別任務創建成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '創建視頻識別任務失敗');
      throw error;
    }
  },

  // 開始視頻處理
  startVideoProcessing: async (taskId, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/video-recognition-tasks/${taskId}/start`);
      handleSuccess('視頻處理開始');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '開始視頻處理失敗');
      throw error;
    }
  },

  // 停止視頻處理
  stopVideoProcessing: async (taskId, onSuccess) => {
    showConfirm(
      '確認停止',
      '確定要停止視頻處理嗎？',
      async () => {
        try {
          await axios.post(`${API_BASE_URL}/video-recognition-tasks/${taskId}/stop`);
          handleSuccess('視頻處理已停止');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '停止視頻處理失敗');
        }
      }
    );
  },

  // PTZ 控制
  ptzControl: async (deviceId, command, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/video-devices/${deviceId}/ptz`, command);
      handleSuccess('PTZ 控制指令發送成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, 'PTZ 控制失敗');
      throw error;
    }
  }
};

// ETL 處理按鈕功能
export const etlButtonHandlers = {
  // 創建 ETL 工作流
  createETLWorkflow: async (workflowData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/etl-workflows/`, workflowData);
      handleSuccess('ETL 工作流創建成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '創建 ETL 工作流失敗');
      throw error;
    }
  },

  // 執行 ETL 工作流
  executeETLWorkflow: async (workflowId, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/etl-workflows/${workflowId}/execute`);
      handleSuccess('ETL 工作流執行開始');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '執行 ETL 工作流失敗');
      throw error;
    }
  },

  // 停止 ETL 執行
  stopETLExecution: async (executionId, onSuccess) => {
    showConfirm(
      '確認停止',
      '確定要停止此 ETL 執行嗎？',
      async () => {
        try {
          await axios.post(`${API_BASE_URL}/etl-executions/${executionId}/stop`);
          handleSuccess('ETL 執行已停止');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '停止 ETL 執行失敗');
        }
      }
    );
  }
};

// 平台設定按鈕功能
export const platformButtonHandlers = {
  // 更新平台設定
  updatePlatformSettings: async (settings, onSuccess) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/platform/settings/`, settings);
      handleSuccess('平台設定更新成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '更新平台設定失敗');
      throw error;
    }
  },

  // 備份系統
  backupSystem: async (onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/system/backup`);
      handleSuccess('系統備份開始');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '系統備份失敗');
      throw error;
    }
  },

  // 恢復系統
  restoreSystem: async (backupId, onSuccess) => {
    showConfirm(
      '確認恢復',
      '確定要恢復系統嗎？此操作將覆蓋當前數據。',
      async () => {
        try {
          await axios.post(`${API_BASE_URL}/system/restore`, { backup_id: backupId });
          handleSuccess('系統恢復成功');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '系統恢復失敗');
        }
      }
    );
  }
};

// 用戶管理按鈕功能
export const userButtonHandlers = {
  // 創建用戶
  createUser: async (userData, onSuccess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/`, userData);
      handleSuccess('用戶創建成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '創建用戶失敗');
      throw error;
    }
  },

  // 更新用戶
  updateUser: async (userId, userData, onSuccess) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/users/${userId}`, userData);
      handleSuccess('用戶更新成功');
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (error) {
      handleError(error, '更新用戶失敗');
      throw error;
    }
  },

  // 刪除用戶
  deleteUser: async (userId, onSuccess) => {
    showConfirm(
      '確認刪除',
      '確定要刪除此用戶嗎？此操作無法撤銷。',
      async () => {
        try {
          await axios.delete(`${API_BASE_URL}/users/${userId}`);
          handleSuccess('用戶刪除成功');
          onSuccess && onSuccess();
        } catch (error) {
          handleError(error, '刪除用戶失敗');
        }
      }
    );
  },

  // 重置密碼
  resetPassword: async (userId, onSuccess) => {
    showConfirm(
      '確認重置',
      '確定要重置此用戶的密碼嗎？',
      async () => {
        try {
          const response = await axios.post(`${API_BASE_URL}/users/${userId}/reset-password`);
          handleSuccess('密碼重置成功');
          onSuccess && onSuccess(response.data);
        } catch (error) {
          handleError(error, '重置密碼失敗');
        }
      }
    );
  }
};

// 導出所有按鈕處理器
export default {
  device: deviceButtonHandlers,
  ai: aiButtonHandlers,
  gpu: gpuButtonHandlers,
  alert: alertButtonHandlers,
  workflow: workflowButtonHandlers,
  rule: ruleButtonHandlers,
  ota: otaButtonHandlers,
  database: databaseButtonHandlers,
  protocol: protocolButtonHandlers,
  role: roleButtonHandlers,
  notification: notificationButtonHandlers,
  report: reportButtonHandlers,
  video: videoButtonHandlers,
  etl: etlButtonHandlers,
  platform: platformButtonHandlers,
  user: userButtonHandlers
}; 