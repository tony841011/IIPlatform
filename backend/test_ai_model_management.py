#!/usr/bin/env python3
"""
AI Model 管理功能測試腳本
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, create_ai_model, get_ai_models, update_ai_model, delete_ai_model, toggle_ai_model_status
from app.schemas import AIModelCreate, AIModelUpdate
from datetime import datetime
import logging

# 設定日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_ai_model_management():
    """測試 AI Model 管理功能"""
    logger.info("🧪 開始測試 AI Model 管理功能...")
    
    db = SessionLocal()
    
    try:
        # 測試創建 AI Model
        logger.info("📝 測試創建 AI Model...")
        
        # 創建 GPT-4 模型
        gpt4_model = AIModelCreate(
            name="GPT-4",
            version="4.0",
            type="llm",
            framework="openai",
            source="openai",
            description="OpenAI 最新的大語言模型，支援多種任務",
            endpoint="https://api.openai.com/v1/chat/completions",
            status="active",
            size="1.7TB",
            accuracy=95.2,
            latency=120,
            config={
                "max_tokens": 4096,
                "temperature": 0.7,
                "top_p": 0.9
            },
            tags=["NLP", "對話", "生成"]
        )
        
        created_gpt4 = create_ai_model(db, gpt4_model, created_by="admin")
        logger.info(f"✅ 創建 GPT-4 模型成功: ID={created_gpt4.id}")
        
        # 創建 Claude-3 模型
        claude3_model = AIModelCreate(
            name="Claude-3",
            version="3.0",
            type="llm",
            framework="anthropic",
            source="anthropic",
            description="Anthropic 的 Claude 3 模型，擅長推理和寫作",
            endpoint="https://api.anthropic.com/v1/messages",
            status="active",
            size="1.2TB",
            accuracy=94.8,
            latency=150,
            config={
                "max_tokens": 4096,
                "temperature": 0.5,
                "top_p": 0.8
            },
            tags=["NLP", "推理", "寫作"]
        )
        
        created_claude3 = create_ai_model(db, claude3_model, created_by="admin")
        logger.info(f"✅ 創建 Claude-3 模型成功: ID={created_claude3.id}")
        
        # 創建 ResNet-50 模型
        resnet_model = AIModelCreate(
            name="ResNet-50",
            version="1.0",
            type="vision",
            framework="pytorch",
            source="huggingface",
            description="經典的圖像分類模型，適用於多種視覺任務",
            endpoint="http://localhost:8000/vision/resnet50",
            status="inactive",
            size="98MB",
            accuracy=92.1,
            latency=45,
            config={
                "input_size": [224, 224],
                "num_classes": 1000,
                "batch_size": 32
            },
            tags=["CV", "分類", "圖像"]
        )
        
        created_resnet = create_ai_model(db, resnet_model, created_by="admin")
        logger.info(f"✅ 創建 ResNet-50 模型成功: ID={created_resnet.id}")
        
        # 測試獲取模型列表
        logger.info("📋 測試獲取模型列表...")
        all_models = get_ai_models(db)
        logger.info(f"✅ 獲取到 {len(all_models)} 個模型")
        
        # 測試按類型篩選
        llm_models = get_ai_models(db, type_filter="llm")
        logger.info(f"✅ 獲取到 {len(llm_models)} 個 LLM 模型")
        
        vision_models = get_ai_models(db, type_filter="vision")
        logger.info(f"✅ 獲取到 {len(vision_models)} 個視覺模型")
        
        # 測試更新模型
        logger.info("✏️ 測試更新模型...")
        update_data = AIModelUpdate(
            description="更新後的 GPT-4 模型描述",
            accuracy=96.0,
            latency=100
        )
        
        updated_model = update_ai_model(db, created_gpt4.id, update_data)
        if updated_model:
            logger.info(f"✅ 更新 GPT-4 模型成功: 準確率={updated_model.accuracy}%, 延遲={updated_model.latency}ms")
        
        # 測試切換模型狀態
        logger.info("🔄 測試切換模型狀態...")
        toggled_model = toggle_ai_model_status(db, created_resnet.id)
        if toggled_model:
            logger.info(f"✅ 切換 ResNet-50 狀態成功: {toggled_model.status}")
        
        # 測試獲取單個模型
        logger.info("🔍 測試獲取單個模型...")
        single_model = get_ai_models(db, limit=1)
        if single_model:
            model = single_model[0]
            logger.info(f"✅ 獲取模型: {model.name} v{model.version}")
            logger.info(f"   類型: {model.type}")
            logger.info(f"   框架: {model.framework}")
            logger.info(f"   狀態: {model.status}")
            logger.info(f"   準確率: {model.accuracy}%")
            logger.info(f"   延遲: {model.latency}ms")
        
        # 測試刪除模型（可選，取消註釋以測試）
        # logger.info("🗑️ 測試刪除模型...")
        # deleted_model = delete_ai_model(db, created_resnet.id)
        # if deleted_model:
        #     logger.info(f"✅ 刪除 ResNet-50 模型成功")
        
        logger.info("🎉 AI Model 管理功能測試完成！")
        return True
        
    except Exception as e:
        logger.error(f"❌ 測試失敗: {str(e)}")
        return False
    finally:
        db.close()

def test_model_statistics():
    """測試模型統計功能"""
    logger.info("📊 測試模型統計功能...")
    
    db = SessionLocal()
    
    try:
        from app.database import get_ai_model_stats
        
        stats = get_ai_model_stats(db)
        logger.info(f"✅ 模型統計信息:")
        logger.info(f"   總模型數: {stats['total']}")
        logger.info(f"   運行中: {stats['active']}")
        logger.info(f"   上傳中: {stats['uploading']}")
        logger.info(f"   類型分布: {stats['types']}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 統計測試失敗: {str(e)}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("🚀 開始 AI Model 管理功能測試...")
    
    # 測試基本功能
    if test_ai_model_management():
        logger.info("✅ 基本功能測試通過")
    else:
        logger.error("❌ 基本功能測試失敗")
        sys.exit(1)
    
    # 測試統計功能
    if test_model_statistics():
        logger.info("✅ 統計功能測試通過")
    else:
        logger.error("❌ 統計功能測試失敗")
        sys.exit(1)
    
    logger.info("🎉 所有測試完成！")
    sys.exit(0) 