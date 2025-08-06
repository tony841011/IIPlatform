#!/usr/bin/env python3
"""
修復 database_connections 表結構
"""

import sqlite3
import os
from pathlib import Path

def fix_database_connections_table():
    """修復 database_connections 表結構"""
    print("🔧 修復 database_connections 表結構...")
    
    db_path = "iot.db"
    if not os.path.exists(db_path):
        print("❌ 資料庫文件不存在")
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 檢查現有欄位
        cursor.execute("PRAGMA table_info(database_connections)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"現有欄位: {columns}")
        
        # 需要添加的欄位
        missing_columns = [
            ("last_test_time", "DATETIME"),
            ("last_test_result", "VARCHAR(50)"),
            ("last_test_error", "TEXT"),
            ("response_time", "FLOAT"),
            ("description", "TEXT"),
            ("auth_source", "VARCHAR(50)"),
            ("auth_mechanism", "VARCHAR(50)"),
            ("replica_set", "VARCHAR(100)"),
            ("ssl_enabled", "BOOLEAN DEFAULT 0"),
            ("ssl_cert_reqs", "VARCHAR(50)"),
            ("max_pool_size", "INTEGER DEFAULT 100"),
            ("min_pool_size", "INTEGER DEFAULT 0"),
            ("max_idle_time_ms", "INTEGER DEFAULT 30000"),
            ("server_selection_timeout_ms", "INTEGER DEFAULT 30000"),
            ("socket_timeout_ms", "INTEGER DEFAULT 20000"),
            ("connect_timeout_ms", "INTEGER DEFAULT 20000"),
            ("retry_writes", "BOOLEAN DEFAULT 1"),
            ("retry_reads", "BOOLEAN DEFAULT 1"),
            ("read_preference", "VARCHAR(50)"),
            ("write_concern", "VARCHAR(50)"),
            ("read_concern", "VARCHAR(50)"),
            ("journal", "BOOLEAN DEFAULT 1"),
            ("wtimeout", "INTEGER"),
            ("w", "VARCHAR(50)"),
            ("j", "BOOLEAN DEFAULT 1"),
            ("fsync", "BOOLEAN DEFAULT 0"),
            ("direct_connection", "BOOLEAN DEFAULT 0"),
            ("app_name", "VARCHAR(100)"),
            ("compressors", "VARCHAR(100)"),
            ("zlib_compression_level", "INTEGER"),
            ("uuid_representation", "VARCHAR(50)"),
            ("unicode_decode_error_handler", "VARCHAR(50)"),
            ("tz_aware", "BOOLEAN DEFAULT 0"),
            ("connect", "BOOLEAN DEFAULT 1"),
            ("max_connecting", "INTEGER"),
            ("load_balanced", "BOOLEAN DEFAULT 0"),
            ("server_api", "VARCHAR(50)"),
            ("heartbeat_frequency_ms", "INTEGER"),
            ("local_threshold_ms", "INTEGER")
        ]
        
        # 添加缺失的欄位
        for column_name, column_type in missing_columns:
            if column_name not in columns:
                print(f" 添加欄位: {column_name}")
                cursor.execute(f"ALTER TABLE database_connections ADD COLUMN {column_name} {column_type}")
        
        # 提交變更
        conn.commit()
        print("✅ database_connections 表結構修復完成")
        
        # 驗證修復結果
        cursor.execute("PRAGMA table_info(database_connections)")
        updated_columns = [column[1] for column in cursor.fetchall()]
        print(f"修復後欄位: {updated_columns}")
        
        return True
        
    except Exception as e:
        print(f"❌ 修復過程中發生錯誤: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def main():
    """主函數"""
    print(" 修復 database_connections 表結構")
    print("=" * 50)
    
    if fix_database_connections_table():
        print("🎉 資料庫結構修復成功！")
    else:
        print("❌ 資料庫結構修復失敗")

if __name__ == "__main__":
    main() 