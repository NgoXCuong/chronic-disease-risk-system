"""
Dịch vụ Xuất Báo cáo Tóm tắt Y tế Định dạng PDF (Sprint 18: FR-16).
Sử dụng ReportLab kết hợp phông chữ Unicode Tiếng Việt, xuất phiếu kết quả sàng lọc
chuẩn y khoa phục vụ người bệnh mang đi khám chuyên khoa hoặc lưu trữ cá nhân.
Tuân thủ Trụ cột 1 (Ngắn gọn), Trụ cột 4 (Kiến trúc phân tầng) và Trụ cột 5 (Bảo mật PHI).
"""
from datetime import datetime
import io
import os
from typing import Any, Dict, List, Optional
import uuid

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.models.enums import RiskLevel
from app.models.profile import PatientProfile
from app.models.record import HealthRecord
from app.models.user import User
from app.services.ml_service import DISEASE_NAME_VI_MAP

# 1. Đăng ký phông chữ Unicode Tiếng Việt (Arial / DejaVuSans)
FONT_NAME = "ArialVN"
BOLD_FONT_NAME = "ArialVN-Bold"

def _setup_fonts():
    global FONT_NAME, BOLD_FONT_NAME
    font_candidates = [
        ("C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/arialbd.ttf"),
        ("C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/segoeuib.ttf"),
        ("C:/Windows/Fonts/tahoma.ttf", "C:/Windows/Fonts/tahomabd.ttf"),
        ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    ]
    for reg, bold in font_candidates:
        if os.path.exists(reg):
            try:
                pdfmetrics.registerFont(TTFont(FONT_NAME, reg))
                if os.path.exists(bold):
                    pdfmetrics.registerFont(TTFont(BOLD_FONT_NAME, bold))
                else:
                    pdfmetrics.registerFont(TTFont(BOLD_FONT_NAME, reg))
                return
            except Exception:
                pass
    # Mặc định Helvetica nếu không tìm thấy TrueType font
    FONT_NAME = "Helvetica"
    BOLD_FONT_NAME = "Helvetica-Bold"

_setup_fonts()


class PDFReportService:
    """Xây dựng và xuất bản tệp PDF Báo cáo Đánh giá Nguy cơ Bệnh Mạn tính chuẩn y tế."""

    @classmethod
    def generate_screening_report_pdf(
        cls,
        record: HealthRecord,
        user: User,
        profile: Optional[PatientProfile] = None,
    ) -> bytes:
        """Sinh tệp PDF chứa đầy đủ thông tin hành chính, chỉ số và phân tầng nguy cơ."""
        if profile is None:
            try:
                profile = user.profile
            except Exception:
                profile = None
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName=BOLD_FONT_NAME,
            fontSize=16,
            leading=20,
            alignment=1, # Center
            textColor=colors.HexColor("#0f766e"), # Teal-700
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontName=FONT_NAME,
            fontSize=10,
            leading=13,
            alignment=1,
            textColor=colors.HexColor("#64748b"),
        )
        h2_style = ParagraphStyle(
            "Heading2",
            parent=styles["Normal"],
            fontName=BOLD_FONT_NAME,
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=8,
            spaceAfter=4,
        )
        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontName=FONT_NAME,
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#334155"),
        )
        small_style = ParagraphStyle(
            "Small",
            parent=styles["Normal"],
            fontName=FONT_NAME,
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#64748b"),
        )
        disclaimer_style = ParagraphStyle(
            "Disclaimer",
            parent=styles["Normal"],
            fontName=FONT_NAME,
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#991b1b"), # Red-800
            alignment=4, # Justify
        )

        story = []

        # --- Header Đơn vị ---
        story.append(Paragraph("HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH Y TẾ (CHRONICCARE CDSS)", subtitle_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph("PHIẾU BÁO CÁO KẾT QUẢ SÀNG LỌC NGUY CƠ BỆNH MẠN TÍNH", title_style))
        story.append(Spacer(1, 2))
        created_str = record.created_at.strftime("%d/%m/%Y lúc %H:%M (UTC)") if record.created_at else "Chưa rõ"
        story.append(Paragraph(f"Mã hồ sơ: {record.id}  •  Thời gian thực hiện: {created_str}", subtitle_style))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0d9488"), spaceAfter=10))

        # --- I. Thông tin người bệnh ---
        story.append(Paragraph("I. THÔNG TIN HÀNH CHÍNH & NHÂN TRẮC HỌC", h2_style))
        if profile is None:
            profile = getattr(user, "profile", None)
        full_name = profile.full_name if profile and profile.full_name else (user.email or "Bệnh nhân")
        gender_str = "Nam" if profile and profile.gender.value == "MALE" else "Nữ" if profile and profile.gender.value == "FEMALE" else "Khác"
        dob_str = profile.date_of_birth.strftime("%d/%m/%Y") if profile and profile.date_of_birth else "Chưa cập nhật"
        height_str = f"{profile.height_cm:.1f} cm" if profile and profile.height_cm else "Chưa đo"
        weight_str = f"{profile.weight_kg:.1f} kg" if profile and profile.weight_kg else "Chưa đo"
        bmi_val = profile.bmi if profile and profile.bmi else 0.0
        bmi_str = f"{bmi_val:.1f} kg/m²" if bmi_val > 0 else "Chưa rõ"

        patient_data = [
            [
                Paragraph(f"<b>Họ và tên:</b> {full_name}", body_style),
                Paragraph(f"<b>Ngày sinh:</b> {dob_str}", body_style),
                Paragraph(f"<b>Giới tính:</b> {gender_str}", body_style),
            ],
            [
                Paragraph(f"<b>Chiều cao:</b> {height_str}", body_style),
                Paragraph(f"<b>Cân nặng:</b> {weight_str}", body_style),
                Paragraph(f"<b>Chỉ số BMI:</b> {bmi_str}", body_style),
            ],
        ]
        patient_table = Table(patient_data, colWidths=[180, 170, 170])
        patient_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ])
        )
        story.append(patient_table)
        story.append(Spacer(1, 12))

        # --- II. Kết quả phân tầng nguy cơ Machine Learning ---
        story.append(Paragraph("II. KẾT QUẢ ĐÁNH GIÁ NGUY CƠ 5 BỆNH MẠN TÍNH (MACHINE LEARNING)", h2_style))
        
        results_header = [
            Paragraph("<b>Bệnh lý sàng lọc</b>", body_style),
            Paragraph("<b>Mức nguy cơ (%)</b>", body_style),
            Paragraph("<b>Phân tầng</b>", body_style),
            Paragraph("<b>Ngưỡng tối ưu</b>", body_style),
            Paragraph("<b>Đánh giá lâm sàng</b>", body_style),
        ]
        results_rows = [results_header]

        for sr in record.screening_results:
            d_name = DISEASE_NAME_VI_MAP.get(sr.disease_type.value, sr.disease_type.value)
            pct_str = f"{sr.risk_percentage:.1f}%"
            threshold_str = f"{sr.optimal_threshold:.3f}"
            level_str = (
                "NGUY CƠ CAO" if sr.risk_level == RiskLevel.HIGH
                else "TRUNG BÌNH" if sr.risk_level == RiskLevel.MEDIUM
                else "NGUY CƠ THẤP"
            )
            eval_str = "Vượt ngưỡng khuyến cáo" if sr.risk_score >= sr.optimal_threshold else "Trong giới hạn an toàn"

            # Màu sắc phân tầng
            color_hex = "#b91c1c" if sr.risk_level == RiskLevel.HIGH else "#b45309" if sr.risk_level == RiskLevel.MEDIUM else "#047857"
            level_p = Paragraph(f"<font color='{color_hex}'><b>{level_str}</b></font>", body_style)

            results_rows.append([
                Paragraph(f"<b>{d_name}</b>", body_style),
                Paragraph(f"<b>{pct_str}</b>", body_style),
                level_p,
                Paragraph(threshold_str, body_style),
                Paragraph(eval_str, small_style),
            ])

        results_table = Table(results_rows, colWidths=[150, 85, 95, 80, 110])
        results_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#ccfbf1")), # Teal-100
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#0d9488")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ])
        )
        story.append(results_table)
        story.append(Spacer(1, 12))

        # --- III. Các yếu tố nguy cơ chính (SHAP XAI) ---
        story.append(Paragraph("III. YẾU TỐ ẢNH HƯỞNG CHÍNH (TREE-SHAP EXPLAINABLE AI)", h2_style))
        for sr in record.screening_results:
            if sr.top_risk_factors:
                d_name = DISEASE_NAME_VI_MAP.get(sr.disease_type.value, sr.disease_type.value)
                factors_str = " • ".join([
                    f"<b>{f.get('feature_name_vi', f.get('feature'))}:</b> {f.get('impact', '')}"
                    for f in sr.top_risk_factors[:3]
                ])
                story.append(Paragraph(f"• <b>{d_name}:</b> {factors_str}", small_style))
                story.append(Spacer(1, 2))
        story.append(Spacer(1, 8))

        # --- IV. Khuyến nghị can thiệp lối sống (WHO & Bộ Y tế) ---
        story.append(Paragraph("IV. KHUYẾN NGHỊ CAN THIỆP LỐI SỐNG BAN ĐẦU", h2_style))
        recs = [
            "Dinh dưỡng: Giảm lượng muối dưới 5g/ngày (< 1 muỗng cà phê), hạn chế đường tinh luyện và mỡ động vật.",
            "Vận động thể lực: Tối thiểu 150 phút/tuần với cường độ trung bình (đi bộ nhanh, đạp xe, bơi lội).",
            "Theo dõi định kỳ: Định kỳ kiểm tra huyết áp tại nhà và xét nghiệm đường huyết/HbA1c mỗi 6 tháng.",
            "Tham vấn chuyên khoa: Với các chỉ số ở mức Nguy cơ Cao, cần đến cơ sở y tế để được bác sĩ thăm khám.",
        ]
        for r in recs:
            story.append(Paragraph(f"• {r}", small_style))
            story.append(Spacer(1, 2))
        story.append(Spacer(1, 14))

        # --- V. Tuyên bố pháp lý Y tế (Medical Disclaimer) ---
        disclaimer_box = [
            [
                Paragraph(
                    "<b>TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM Y KHOA:</b> Báo cáo này là kết quả trích xuất từ Hệ thống hỗ trợ ra quyết định lâm sàng (CDSS) bằng Machine Learning, chỉ mang tính chất sàng lọc sớm và nâng cao nhận thức sức khỏe. Báo cáo <b>TUYỆT ĐỐI KHÔNG THAY THẾ</b> cho kết luận chẩn đoán, phác đồ điều trị hay đơn thuốc của bác sĩ chuyên khoa.",
                    disclaimer_style,
                )
            ]
        ]
        disc_table = Table(disclaimer_box, colWidths=[520])
        disc_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fef2f2")), # Red-50
                ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#f87171")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ])
        )
        story.append(disc_table)

        doc.build(story)
        return buffer.getvalue()
