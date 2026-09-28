"""
Trình nạp và quản lý vòng đời bộ nhớ các mô hình Machine Learning (Model Lifespan Loader).
Tuân thủ Trụ cột 3 (Tối ưu hóa): Nạp toàn bộ 5 mô hình vào RAM một lần duy nhất khi máy chủ khởi động (0ms Disk I/O).
"""
import json
import os
import warnings
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

# Khắc phục tính tương thích phiên bản scikit-learn giữa môi trường Colab và máy chủ
import sklearn.compose._column_transformer as ct
if not hasattr(ct, "_RemainderColsList"):
    class _RemainderColsList(list):
        pass
    ct._RemainderColsList = _RemainderColsList

import joblib
from app.core.config import settings
from app.core.logger import logger

warnings.filterwarnings("ignore", category=UserWarning)


@dataclass
class LoadedDiseaseModel:
    """Cấu trúc dữ liệu đại diện cho một mô hình bệnh lý đã nạp sẵn vào bộ nhớ RAM."""
    disease: str
    model_type: str
    optimal_threshold: float
    features_order: List[str]
    risk_levels: Dict[str, List[float]]
    metrics: Dict[str, Any]
    preprocessor: Any
    calibrated_model: Any
    base_model: Any
    trained_date: Optional[str] = None


def _patch_sklearn_estimator(obj: Any) -> None:
    """Khắc phục tính tương thích thuộc tính nội bộ của scikit-learn khi deserialize trên các phiên bản mới."""
    if hasattr(obj, "transformers_"):
        for item in obj.transformers_:
            if len(item) >= 2:
                _patch_sklearn_estimator(item[1])
    elif hasattr(obj, "steps"):
        for _, step in obj.steps:
            _patch_sklearn_estimator(step)
    elif hasattr(obj, "statistics_") and not hasattr(obj, "_fill_dtype"):
        import numpy as np
        obj._fill_dtype = getattr(obj.statistics_, "dtype", np.float64)


class ModelRegistry:
    """
    Kho lưu trữ trong bộ nhớ RAM (In-Memory Registry) quản lý 5 mô hình ML.
    Cung cấp quyền truy cập tức thì cho tầng Dịch vụ suy luận mà không cần đọc lại ổ đĩa.
    """
    _models: Dict[str, LoadedDiseaseModel] = {}

    @classmethod
    def load_all_models(cls) -> Dict[str, LoadedDiseaseModel]:
        """
        Nạp toàn bộ 5 mô hình bệnh lý từ thư mục artifacts vào RAM.
        Được gọi duy nhất một lần bên trong FastAPI Lifespan Handler.
        """
        models_dir = Path(settings.MODEL_DIR)
        if not models_dir.exists():
            logger.warning("[ML LIFESPAN] Không tìm thấy thư mục mô hình tại: %s", models_dir)
            return cls._models

        expected_diseases = [
            "diabetes_binary",
            "hypertension",
            "cardiovascular",
            "stroke",
            "diabetes_clinical",
        ]

        loaded_count = 0
        for disease_name in expected_diseases:
            disease_path = models_dir / disease_name
            metadata_file = disease_path / "metadata.json"
            preprocessor_file = disease_path / "preprocessor.joblib"
            calibrated_file = disease_path / "calibrated_model.joblib"
            base_file = disease_path / "base_model.joblib"

            required_files = [metadata_file, preprocessor_file, calibrated_file, base_file]
            if not all(f.exists() for f in required_files):
                logger.warning("[ML LIFESPAN] Bỏ qua '%s' vì thiếu tệp artifacts.", disease_name)
                continue

            try:
                metadata = json.loads(metadata_file.read_text(encoding="utf-8"))
                preprocessor = joblib.load(preprocessor_file)
                _patch_sklearn_estimator(preprocessor)
                calibrated_model = joblib.load(calibrated_file)
                base_model = joblib.load(base_file)

                loaded_model = LoadedDiseaseModel(
                    disease=disease_name,
                    model_type=metadata.get("model_type", "XGBoost_Calibrated"),
                    optimal_threshold=float(metadata.get("optimal_threshold", 0.5)),
                    features_order=metadata.get("features_order", []),
                    risk_levels=metadata.get("risk_levels", {
                        "low": [0.0, 0.3],
                        "medium": [0.3, 0.65],
                        "high": [0.65, 1.0],
                    }),
                    metrics=metadata.get("metrics", {}),
                    preprocessor=preprocessor,
                    calibrated_model=calibrated_model,
                    base_model=base_model,
                    trained_date=metadata.get("trained_date"),
                )
                cls._models[disease_name] = loaded_model
                loaded_count += 1
            except Exception as e:
                logger.error("[ML LIFESPAN] Lỗi khi nạp mô hình '%s': %s", disease_name, e)

        logger.info(
            "[ML LIFESPAN] Đã nạp thành công %d/5 mô hình Machine Learning vào RAM: %s",
            loaded_count,
            list(cls._models.keys()),
        )
        return cls._models

    @classmethod
    def get_model(cls, disease: str) -> Optional[LoadedDiseaseModel]:
        """Truy xuất một mô hình cụ thể từ bộ nhớ RAM theo tên bệnh."""
        return cls._models.get(disease)

    @classmethod
    def get_all_models(cls) -> Dict[str, LoadedDiseaseModel]:
        """Truy xuất toàn bộ danh sách mô hình đã nạp trong RAM."""
        return cls._models
