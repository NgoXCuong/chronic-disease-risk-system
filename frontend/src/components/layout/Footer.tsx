import React from "react";
import Link from "next/link";
import { HeartPulse, ShieldAlert } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 transition-colors py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-100 dark:border-slate-800">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
                <HeartPulse className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                ChronicCare <span className="text-teal-600 dark:text-teal-400">CDSS</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Hệ thống hỗ trợ ra quyết định lâm sàng và theo dõi nguy cơ bệnh mạn tính không lây nhiễm bằng Machine Learning & Explainable AI (TreeSHAP).
            </p>
          </div>

          {/* Cột 2: Điều hướng nhanh */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Khám phá & Sàng lọc
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/screening" className="hover:text-teal-600 transition-colors">
                  Khảo sát Nguy cơ 4 Bệnh Mạn tính
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-teal-600 transition-colors">
                  Bảng Điều khiển Sức khỏe
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-600 transition-colors">
                  Đăng nhập Hồ sơ Bệnh nhân
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Tuyên bố pháp lý & An toàn y tế */}
          <div className="space-y-2 bg-teal-50/50 dark:bg-teal-950/20 p-4 rounded-xl border border-teal-100 dark:border-teal-900/40">
            <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-xs">
              <ShieldAlert className="h-4 w-4 text-teal-600 shrink-0" />
              <span>Tuyên bố Miễn trừ Y tế</span>
            </div>
            <p className="text-[11px] text-teal-900/80 dark:text-teal-300/80 leading-relaxed">
              Hệ thống đóng vai trò hỗ trợ sàng lọc sớm và nâng cao nhận thức sức khỏe. Điểm số rủi ro không thay thế kết luận chẩn đoán chính thức hay phác đồ điều trị của bác sĩ chuyên khoa.
            </p>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 ChronicCare CDSS. Đồ án Tốt nghiệp Đại học CNTT.</p>
          <p className="text-[11px]">Tuân thủ tiêu chuẩn bảo mật y tế & đạo đức AI.</p>
        </div>
      </div>
    </footer>
  );
}
