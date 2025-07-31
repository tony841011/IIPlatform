import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.models import Base
from app.database import engine

def init_db():
    Base.metadata.create_all(bind=engine)
    print("資料庫初始化完成！")

if __name__ == "__main__":
    init_db() 