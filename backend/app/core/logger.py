"""
Cấu hình hệ thống ghi nhật ký (Logging) tập trung cho toàn bộ ứng dụng Backend.
Cung cấp định dạng log chuyên nghiệp, thân thiện và dễ đọc trong Terminal.
"""
import logging
import sys

# Định dạng hiển thị nhật ký: Thời gian | Mức độ | Tên module: Thông điệp
LOG_FORMAT = "%(asctime)s | %(levelname)-7s | %(name)s : %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Đảm bảo terminal Windows hỗ trợ UTF-8 cho log Tiếng Việt
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    datefmt=DATE_FORMAT,
    handlers=[logging.StreamHandler(sys.stdout)],
)

# Logger chính cho toàn hệ thống
logger = logging.getLogger("chronic_app")
