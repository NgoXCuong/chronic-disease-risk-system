"""
Cấu hình hệ thống ghi nhật ký (Logging) tập trung cho toàn bộ ứng dụng Backend.
Cung cấp định dạng log chuyên nghiệp, thân thiện và dễ đọc trong Terminal.
"""
import logging
import sys

# Định dạng hiển thị nhật ký: Thời gian | Mức độ | Tên module: Thông điệp
LOG_FORMAT = "%(asctime)s | %(levelname)-7s | %(name)s : %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    datefmt=DATE_FORMAT,
    handlers=[logging.StreamHandler(sys.stdout)],
)

# Logger chính cho toàn hệ thống
logger = logging.getLogger("chronic_app")
