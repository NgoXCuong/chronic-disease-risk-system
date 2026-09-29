import * as React from "react";
import Link from "next/link";
import { Activity, BrainCircuit, ShieldCheck, Stethoscope } from "lucide-react";

export function AuthBrandingPanel() {
  const highlights = [
    {
      icon: Activity,
      title: "5 Mô hình Sàng lọc Nguy cơ",
      desc: "Đánh giá nguy cơ Đái tháo đường, Tăng huyết áp, Tim mạch và Đột quỵ dựa trên các tiêu chí dịch tễ học lâm sàng.",
    },
    {
      icon: BrainCircuit,
      title: "Giải thích Rõ ràng Yếu tố Sức khỏe",
      desc: "Chỉ rõ từng chỉ số thể trạng và thói quen sinh hoạt đang làm tăng hoặc giảm nguy cơ bệnh của bạn.",
    },
    {
      icon: ShieldCheck,
      title: "Bảo vệ Thông tin Sức khỏe Cá nhân",
      desc: "Hồ sơ y tế và kết quả sàng lọc được mã hóa và bảo mật nghiêm ngặt, bảo vệ quyền riêng tư tuyệt đối cho người bệnh.",
    },
  ];

  return (
    <div className="hidden lg:flex flex-col justify-between w-full h-full bg-gradient-to-br from-medical-900 via-slate-900 to-medical-950 text-white p-12 lg:p-16 relative overflow-hidden select-none">
      {/* Background Decorative Medical Wave */}
      <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-medical-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Logo */}
      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-medical-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-1">
              MedRisk <span className="text-medical-400 font-black">AI</span>
            </span>
            <span className="block text-[11px] font-medium text-slate-400">
              Sàng lọc Nguy cơ Bệnh Mạn tính
            </span>
          </div>
        </Link>
      </div>

      {/* Main Clinical Mission Content */}
      <div className="relative z-10 my-8 space-y-6 max-w-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-800/60 border border-medical-700/60 text-medical-300 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          Hệ thống Hỗ trợ Ra Quyết định Y tế (CDSS)
        </div>

        <h1 className="text-3xl xl:text-4xl font-black leading-tight text-white tracking-tight">
          Chủ động Nhận diện &amp; Kiểm soát Sớm{" "}
          <span className="text-medical-400">Nguy cơ Sức khỏe</span>
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed">
          Ứng dụng các mô hình học máy tiên tiến đã hiệu chuẩn xác suất y học để cung cấp bức tranh toàn diện và khách quan về thể trạng của bạn.
        </p>

        {/* 3 Medical Highlights */}
        <div className="space-y-4 pt-2">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-medical-800/50 border border-medical-700/50 flex items-center justify-center text-medical-300 shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legal Medical Disclaimer Footnote */}
      <div className="relative z-10 pt-4 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
        <strong>Lưu ý y tế:</strong> Hệ thống đóng vai trò hỗ trợ sàng lọc nhận thức ban đầu, tuyệt đối không thay thế kết luận lâm sàng và phác đồ điều trị của bác sĩ chuyên khoa.
      </div>
    </div>
  );
}
