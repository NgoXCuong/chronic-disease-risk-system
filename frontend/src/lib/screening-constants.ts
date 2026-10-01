/**
 * Các hằng số, bảng ánh xạ và danh mục y tế phục vụ Khảo sát Sàng lọc BRFSS & Pima (Sprint 13).
 */

// Bảng ánh xạ 13 nhóm tuổi chuẩn CDC BRFSS
export const CDC_AGE_OPTIONS = [
  { value: 1, label: "18 - 24 tuổi" },
  { value: 2, label: "25 - 29 tuổi" },
  { value: 3, label: "30 - 34 tuổi" },
  { value: 4, label: "35 - 39 tuổi" },
  { value: 5, label: "40 - 44 tuổi" },
  { value: 6, label: "45 - 49 tuổi" },
  { value: 7, label: "50 - 54 tuổi" },
  { value: 8, label: "55 - 59 tuổi" },
  { value: 9, label: "60 - 64 tuổi" },
  { value: 10, label: "65 - 69 tuổi" },
  { value: 11, label: "70 - 74 tuổi" },
  { value: 12, label: "75 - 79 tuổi" },
  { value: 13, label: "Từ 80 tuổi trở lên" },
];

// Chuyển đổi từ ngày sinh hoặc số tuổi thực tế sang mã nhóm tuổi CDC BRFSS (1-13)
export function calculateCdcAgeCategory(ageOrDob: number | string | null | undefined): number {
  let age = 30; // Mặc định 30 tuổi nếu chưa có dữ liệu

  if (typeof ageOrDob === "number") {
    age = ageOrDob;
  } else if (typeof ageOrDob === "string" && ageOrDob) {
    const birthYear = new Date(ageOrDob).getFullYear();
    const currentYear = new Date().getFullYear();
    if (!isNaN(birthYear) && birthYear > 1900) {
      age = currentYear - birthYear;
    }
  }

  if (age < 25) return 1;
  if (age < 30) return 2;
  if (age < 35) return 3;
  if (age < 40) return 4;
  if (age < 45) return 5;
  if (age < 50) return 6;
  if (age < 55) return 7;
  if (age < 60) return 8;
  if (age < 65) return 9;
  if (age < 70) return 10;
  if (age < 75) return 11;
  if (age < 80) return 12;
  return 13;
}

// Đánh giá sức khỏe tổng quát (GenHlth: 1 - 5)
export const GEN_HEALTH_OPTIONS = [
  { value: 1, label: "Rất tốt (Excellent)", desc: "Thể lực dồi dào, không bệnh tật" },
  { value: 2, label: "Tốt (Very Good)", desc: "Khỏe mạnh, sinh hoạt bình thường" },
  { value: 3, label: "Khá (Good)", desc: "Sức khỏe tương đối ổn định" },
  { value: 4, label: "Trung bình (Fair)", desc: "Thỉnh thoảng mệt mỏi, suy giảm thể lực" },
  { value: 5, label: "Kém (Poor)", desc: "Thường xuyên đau yếu, hạn chế vận động" },
];

// Trình độ học vấn (Education: 1 - 6)
export const EDUCATION_OPTIONS = [
  { value: 1, label: "Chưa từng đi học" },
  { value: 2, label: "Tiểu học (Lớp 1 - 8)" },
  { value: 3, label: "Trung học cơ sở (Lớp 9 - 11)" },
  { value: 4, label: "Tốt nghiệp THPT / Tương đương" },
  { value: 5, label: "Trung cấp / Cao đẳng / Đang học ĐH" },
  { value: 6, label: "Tốt nghiệp Đại học hoặc Sau đại học" },
];

// Khung thu nhập gia đình hàng tháng (Income: 1 - 8)
export const INCOME_OPTIONS = [
  { value: 1, label: "Dưới 5 triệu VNĐ" },
  { value: 2, label: "5 - 10 triệu VNĐ" },
  { value: 3, label: "10 - 15 triệu VNĐ" },
  { value: 4, label: "15 - 20 triệu VNĐ" },
  { value: 5, label: "20 - 30 triệu VNĐ" },
  { value: 6, label: "30 - 50 triệu VNĐ" },
  { value: 7, label: "50 - 75 triệu VNĐ" },
  { value: 8, label: "Trên 75 triệu VNĐ" },
];

/**
 * Đánh giá thể trạng theo tiêu chuẩn WHO khu vực Tây Thái Bình Dương (WPRO / IDI cho người châu Á)
 */
export function getAsianBmiCategory(bmi: number) {
  if (bmi < 18.5) {
    return {
      label: "Thiếu cân",
      level: "UNDERWEIGHT",
      color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
      description: "Nguy cơ suy dinh dưỡng và giảm đề kháng",
    };
  }
  if (bmi < 23.0) {
    return {
      label: "Thể trạng Lý tưởng",
      level: "NORMAL",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
      description: "Cân đối, nguy cơ chuyển hóa thấp",
    };
  }
  if (bmi < 25.0) {
    return {
      label: "Thừa cân (Tiền béo phì)",
      level: "OVERWEIGHT",
      color: "text-amber-800 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
      description: "Gia tăng nguy cơ đái tháo đường & tim mạch",
    };
  }
  if (bmi < 30.0) {
    return {
      label: "Béo phì độ I",
      level: "OBESE_I",
      color: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
      description: "Nguy cơ cao mắc bệnh mạn tính chuyển hóa",
    };
  }
  return {
    label: "Béo phì độ II (Rất cao)",
    level: "OBESE_II",
    color: "text-rose-800 bg-rose-100 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700",
    description: "Cần can thiệp y khoa và điều chỉnh lối sống",
  };
}

export function calculateBmi(heightCm?: number | null, weightKg?: number | null): number {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return 22.0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}
