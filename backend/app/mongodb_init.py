#!/usr/bin/env python3
"""
MongoDB 集合初始化腳本
"""

import os
from pymongo import MongoClient
from datetime import datetime
import json

def init_mongodb_collections():
    """初始化 MongoDB 集合"""
    
    # 連接到 MongoDB
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017/')
    client = MongoClient(mongo_url)
    db = client.iot_platform
    
    print("🔧 開始初始化 MongoDB 集合...")
    
    # 1. 設備配置集合
    device_configs = db.device_configs
    device_configs.create_index([("device_id", 1)], unique=True)
    device_configs.create_index([("device_type", 1)])
    print("✅ 設備配置集合初始化完成")
    
    # 2. AI 模型集合
    ai_models = db.ai_models
    ai_models.create_index([("model_name", 1)], unique=True)
    ai_models.create_index([("model_type", 1)])
    ai_models.create_index([("status", 1)])
    print("✅ AI 模型集合初始化完成")
    
    # 3. 系統日誌集合
    system_logs = db.system_logs
    system_logs.create_index([("timestamp", -1)])
    system_logs.create_index([("level", 1)])
    system_logs.create_index([("module", 1)])
    system_logs.create_index([("created_at", -1)])
    print("✅ 系統日誌集合初始化完成")
    
    # 4. 報表集合
    reports = db.reports
    reports.create_index([("report_type", 1)])
    reports.create_index([("created_by", 1)])
    reports.create_index([("created_at", -1)])
    print("✅ 報表集合初始化完成")
    
    # 5. API 文檔集合
    api_documentation = db.api_documentation
    api_documentation.create_index([("version", 1)])
    api_documentation.create_index([("endpoint", 1)])
    api_documentation.create_index([("method", 1)])
    print("✅ API 文檔集合初始化完成")
    
    # 6. SDK 下載記錄集合
    sdk_downloads = db.sdk_downloads
    sdk_downloads.create_index([("sdk_type", 1)])
    sdk_downloads.create_index([("version", 1)])
    sdk_downloads.create_index([("download_date", -1)])
    print("✅ SDK 下載記錄集合初始化完成")
    
    # 7. Webhook 發送記錄集合
    webhook_deliveries = db.webhook_deliveries
    webhook_deliveries.create_index([("webhook_id", 1)])
    webhook_deliveries.create_index([("status", 1)])
    webhook_deliveries.create_index([("delivery_date", -1)])
    print("✅ Webhook 發送記錄集合初始化完成")
    
    # 8. 使用者行為分析集合
    user_behaviors = db.user_behaviors
    user_behaviors.create_index([("user_id", 1)])
    user_behaviors.create_index([("action", 1)])
    user_behaviors.create_index([("timestamp", -1)])
    print("✅ 使用者行為分析集合初始化完成")
    
    # 9. 使用者會話集合
    user_sessions = db.user_sessions
    user_sessions.create_index([("user_id", 1)])
    user_sessions.create_index([("session_id", 1)], unique=True)
    user_sessions.create_index([("start_time", -1)])
    user_sessions.create_index([("end_time", -1)])
    print("✅ 使用者會話集合初始化完成")
    
    # 10. 功能使用統計集合
    feature_usage = db.feature_usage
    feature_usage.create_index([("feature_name", 1)])
    feature_usage.create_index([("user_id", 1)])
    feature_usage.create_index([("usage_date", -1)])
    print("✅ 功能使用統計集合初始化完成")
    
    # 11. API Token 集合
    api_tokens = db.api_tokens
    api_tokens.create_index([("token", 1)], unique=True)
    api_tokens.create_index([("user_id", 1)])
    api_tokens.create_index([("expires_at", 1)])
    print("✅ API Token 集合初始化完成")
    
    # 12. Webhook 配置集合
    webhooks = db.webhooks
    webhooks.create_index([("user_id", 1)])
    webhooks.create_index([("url", 1)])
    webhooks.create_index([("is_active", 1)])
    print("✅ Webhook 配置集合初始化完成")
    
    # 13. API 使用統計集合
    api_usage = db.api_usage
    api_usage.create_index([("token_id", 1)])
    api_usage.create_index([("endpoint", 1)])
    api_usage.create_index([("usage_date", -1)])
    print("✅ API 使用統計集合初始化完成")
    
    print("🎉 MongoDB 集合初始化完成！")
    
    # 創建一些示例數據
    create_sample_data(db)
    
    client.close()

def create_sample_data(db):
    """創建示例數據"""
    
    # 示例設備配置
    sample_device_config = {
        "device_id": 1,
        "device_type": "sensor",
        "config": {
            "sampling_rate": 1000,
            "threshold": 25.5,
            "alerts_enabled": True,
            "data_format": "json"
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    db.device_configs.insert_one(sample_device_config)
    print("✅ 示例設備配置已創建")
    
    # 示例 AI 模型
    sample_ai_model = {
        "model_name": "anomaly_detection_v1",
        "model_type": "anomaly_detection",
        "version": "1.0.0",
        "status": "active",
        "file_path": "/models/anomaly_detection_v1.pkl",
        "parameters": {
            "algorithm": "isolation_forest",
            "contamination": 0.1,
            "n_estimators": 100
        },
        "performance": {
            "accuracy": 0.95,
            "precision": 0.92,
            "recall": 0.88
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    db.ai_models.insert_one(sample_ai_model)
    print("✅ 示例 AI 模型已創建")
    
    # 示例系統日誌
    sample_system_log = {
        "timestamp": datetime.utcnow(),
        "level": "INFO",
        "module": "device_manager",
        "message": "設備 1 已成功連線",
        "details": {
            "device_id": 1,
            "ip_address": "192.168.1.100",
            "connection_time": 1.5
        },
        "created_at": datetime.utcnow()
    }
    
    db.system_logs.insert_one(sample_system_log)
    print("✅ 示例系統日誌已創建")

if __name__ == "__main__":
    init_mongodb_collections() 