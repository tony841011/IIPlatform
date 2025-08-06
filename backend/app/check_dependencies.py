#!/usr/bin/env python3
"""
依賴檢查腳本
檢查所有必要的套件是否已正確安裝
"""

import sys
import importlib
from typing import Dict, List, Tuple

def check_dependency(module_name: str, package_name: str = None) -> Tuple[bool, str]:
    """檢查單個依賴"""
    try:
        importlib.import_module(module_name)
        return True, f"✅ {package_name or module_name} 已安裝"
    except ImportError:
        return False, f"❌ {package_name or module_name} 未安裝"

def check_dependencies() -> Dict[str, List[str]]:
    """檢查所有依賴"""
    results = {
        "core": [],
        "database": [],
        "iot": [],
        "ai": [],
        "optional": []
    }
    
    # 核心依賴
    core_deps = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("sqlalchemy", "SQLAlchemy"),
        ("pydantic", "Pydantic"),
        ("requests", "Requests"),
        ("numpy", "NumPy"),
        ("pandas", "Pandas")
    ]
    
    for module, name in core_deps:
        success, message = check_dependency(module, name)
        results["core"].append(message)
    
    # 資料庫依賴
    db_deps = [
        ("pymongo", "MongoDB"),
        ("influxdb_client", "InfluxDB"),
        ("psycopg2", "PostgreSQL")
    ]
    
    for module, name in db_deps:
        success, message = check_dependency(module, name)
        results["database"].append(message)
    
    # IoT 協定依賴
    iot_deps = [
        ("paho.mqtt.client", "MQTT"),
        ("pymodbus", "Modbus")
    ]
    
    for module, name in iot_deps:
        success, message = check_dependency(module, name)
        results["iot"].append(message)
    
    # AI 依賴
    ai_deps = [
        ("sklearn", "Scikit-learn")
    ]
    
    for module, name in ai_deps:
        success, message = check_dependency(module, name)
        results["ai"].append(message)
    
    # 可選依賴
    optional_deps = [
        ("cv2", "OpenCV"),
        ("matplotlib", "Matplotlib"),
        ("seaborn", "Seaborn"),
        ("tensorflow", "TensorFlow"),
        ("torch", "PyTorch")
    ]
    
    for module, name in optional_deps:
        success, message = check_dependency(module, name)
        results["optional"].append(message)
    
    return results

def main():
    """主函數"""
    print("�� 檢查 IIPlatform 後端依賴...")
    print("=" * 50)
    
    results = check_dependencies()
    
    # 顯示結果
    for category, messages in results.items():
        print(f"\n�� {category.upper()} 依賴:")
        for message in messages:
            print(f"  {message}")
    
    # 統計
    total = sum(len(messages) for messages in results.values())
    installed = sum(1 for messages in results.values() for msg in messages if "✅" in msg)
    
    print(f"\n�� 統計:")
    print(f"  總依賴數: {total}")
    print(f"  已安裝: {installed}")
    print(f"  未安裝: {total - installed}")
    
    if installed == total:
        print("🎉 所有依賴都已正確安裝！")
    else:
        print("⚠️  部分依賴未安裝，請檢查 requirements.txt")

if __name__ == "__main__":
    main() 