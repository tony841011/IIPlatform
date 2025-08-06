from pymodbus.client import ModbusTcpClient
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class ModbusHandler:
    def __init__(self, host="localhost", port=502):
        self.host = host
        self.port = port
        self.client = None
        
    def connect(self, host=None, port=None):
        """連接到 Modbus 設備"""
        if host:
            self.host = host
        if port:
            self.port = port
            
        try:
            self.client = ModbusTcpClient(self.host, self.port)
            if self.client.connect():
                logger.info(f"Modbus TCP 連線成功: {self.host}:{self.port}")
                return True
            else:
                logger.error(f"Modbus TCP 連線失敗: {self.host}:{self.port}")
                return False
        except Exception as e:
            logger.error(f"Modbus TCP 連線異常: {str(e)}")
            return False
    
    def disconnect(self):
        """斷開 Modbus 連線"""
        if self.client:
            self.client.close()
            logger.info("Modbus TCP 連線已斷開")
    
    def read_holding_registers(self, address, count):
        """讀取保持寄存器"""
        try:
            if self.client and self.client.is_socket_open():
                result = self.client.read_holding_registers(address, count)
                if result.isError():
                    logger.error(f"讀取保持寄存器失敗: {result}")
                    return None
                
                registers = result.registers
                
                # 使用數據處理服務處理 Modbus 數據
                try:
                    import asyncio
                    from app.services.data_processing_service import data_processing_service
                    
                    # 創建事件循環來執行異步處理
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    
                    try:
                        # 處理數據
                        device_id = f"{self.host}_{self.port}"
                        result = loop.run_until_complete(
                            data_processing_service.process_modbus_data(device_id, registers)
                        )
                        
                        if result.success:
                            # 保存處理結果
                            data_processing_service.save_processing_result(result)
                            logger.info(f"Modbus 數據處理成功: {device_id}")
                        else:
                            logger.warning(f"Modbus 數據處理失敗: {result.error_message}")
                        
                    finally:
                        loop.close()
                        
                except Exception as e:
                    logger.error(f"數據處理服務調用失敗: {str(e)}")
                
                return registers
            else:
                logger.error("Modbus 客戶端未連線")
                return None
        except Exception as e:
            logger.error(f"讀取保持寄存器異常: {str(e)}")
            return None
    
    def write_holding_register(self, address, value):
        """寫入保持寄存器"""
        try:
            if self.client and self.client.is_socket_open():
                result = self.client.write_register(address, value)
                if result.isError():
                    logger.error(f"寫入保持寄存器失敗: {result}")
                    return False
                logger.info(f"寫入保持寄存器成功: 地址={address}, 值={value}")
                return True
            else:
                logger.error("Modbus 客戶端未連線")
                return False
        except Exception as e:
            logger.error(f"寫入保持寄存器異常: {str(e)}")
            return False
    
    def read_input_registers(self, address, count):
        """讀取輸入寄存器"""
        try:
            if self.client and self.client.is_socket_open():
                result = self.client.read_input_registers(address, count)
                if result.isError():
                    logger.error(f"讀取輸入寄存器失敗: {result}")
                    return None
                return result.registers
            else:
                logger.error("Modbus 客戶端未連線")
                return None
        except Exception as e:
            logger.error(f"讀取輸入寄存器異常: {str(e)}")
            return None 