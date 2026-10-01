import React from "react";
import { ShieldCheck, HeartPulse, Stethoscope, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthBrandingPanelProps {
  className?: string;
}

export function AuthBrandingPanel({ className }: AuthBrandingPanelProps) {
  const highlights = [
    {
      icon: Stethoscope,
      title: "Sàng lọc Sớm & Đa diện Nguy cơ Bệnh",
      desc: "Chủ động tầm soát sớm nguy cơ Đái tháo đường, Tăng huyết áp, Tim mạch và Đột quỵ thông qua lối sống và chỉ số sinh học.",
    },
    {
      icon: ClipboardCheck,
      title: "Phân tích Yếu tố Ảnh hưởng Cá nhân hóa",
      desc: "Chỉ rõ các chỉ số cơ thể và thói quen sinh hoạt đang tác động tích cực hay tiềm ẩn rủi ro đối với sức khỏe của bạn.",
    },
    {
      icon: ShieldCheck,
      title: "Bảo mật & Quyền Riêng tư Y tế Tuyệt đối",
      desc: "Toàn bộ thông tin thể chất và hồ sơ theo dõi sức khỏe của bạn được bảo vệ nghiêm ngặt theo tiêu chuẩn an toàn dữ liệu y tế.",
    },
  ];

  return (
    <div
      className={cn(
        "relative hidden w-full lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 p-8 xl:p-12 text-white overflow-hidden",
        className
      )}
    >
      {/* Nền hiệu ứng y tế */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_50%)]" />

      {/* Header thương hiệu */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2.5 rounded-full bg-teal-500/20 px-4 py-1.5 backdrop-blur-md border border-teal-400/30">
          <HeartPulse className="w-5 h-5 text-teal-300 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-teal-200">
            Hệ thống Hỗ trợ Sàng lọc Y tế (CDSS)
          </span>
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
          Sàng lọc & Theo dõi <br />
          <span className="text-teal-300">Nguy cơ Bệnh Mạn tính</span>
        </h1>
        <p className="mt-4 text-sm text-teal-100/90 leading-relaxed max-w-md">
          Đồng hành cùng bạn trong chủ động dự phòng, phát hiện sớm nguy cơ và xây dựng lộ trình nâng cao sức khỏe bền vững.
        </p>
      </div>

      {/* Danh sách giá trị lâm sàng cốt lõi */}
      <div className="relative z-10 space-y-6 my-8">
        {highlights.map((item, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600/40 border border-teal-400/30 text-teal-200 shadow-sm">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">{item.title}</h2>
              <p className="text-xs text-teal-200/80 leading-relaxed mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tuyên bố miễn trừ y tế */}
      <div className="relative z-10 border-t border-teal-500/30 pt-6">
        <p className="text-xs text-teal-200/70 leading-relaxed">
          * Khuyến cáo y tế: Kết quả đánh giá chỉ mang tính chất tham vấn sàng lọc và hỗ trợ nhận thức sức khỏe, tuyệt đối không thay thế kết luận lâm sàng hay phác đồ điều trị của bác sĩ.
        </p>
      </div>
    </div>
  );
}
