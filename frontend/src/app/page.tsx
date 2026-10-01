import React from "react";
import Link from "next/link";
import {
  HeartPulse,
  Activity,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  ClipboardList,
  Sparkles,
  CheckCircle2,
  Brain,
  Droplet,
  Heart,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const diseases = [
    {
      title: "Đái tháo đường Týp 2",
      badge: "2 Tầng mô hình",
      desc: "Tầm soát sớm qua thói quen sinh hoạt và chỉ số xét nghiệm sinh hóa đường huyết.",
      icon: Droplet,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
    },
    {
      title: "Tăng huyết áp mạn tính",
      badge: "CDC BRFSS",
      desc: "Nhận diện sớm các dấu hiệu huyết áp tiềm ẩn từ thể trạng, thói quen và dinh dưỡng.",
      icon: Activity,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40",
    },
    {
      title: "Bệnh lý Tim mạch",
      badge: "Mạch vành & Đau tim",
      desc: "Ước tính nguy cơ biến cố tim mạch và xơ vữa động mạch dựa trên các yếu tố rủi ro.",
      icon: Heart,
      color: "text-red-600 bg-red-50 dark:bg-red-950/40",
    },
    {
      title: "Biến cố Đột quỵ não",
      badge: "Cảnh báo sớm",
      desc: "Sàng lọc nguy cơ tai biến mạch máu não để kịp thời thay đổi lối sống phòng ngừa.",
      icon: Brain,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40",
    },
  ];

  const features = [
    {
      title: "Sàng lọc Toàn diện 1 Lần",
      desc: "Chỉ với 1 bảng khảo sát (~18 câu hỏi thân thiện), hệ thống tự động suy luận đồng thời qua 4 mô hình ML.",
      icon: ClipboardList,
    },
    {
      title: "Giải thích XAI Đa chiều (TreeSHAP)",
      desc: "Không dừng lại ở điểm số rủi ro, hệ thống chỉ rõ từng yếu tố thể chất/lối sống đang bảo vệ hay thúc đẩy nguy cơ.",
      icon: Sparkles,
    },
    {
      title: "Hiệu chuẩn Xác suất Lâm sàng",
      desc: "Áp dụng CalibratedClassifierCV giúp điểm số phản ánh chân thực xác suất mắc bệnh trong thực tế y khoa.",
      icon: Stethoscope,
    },
    {
      title: "Bảo mật & Chuẩn Dữ liệu Y tế",
      desc: "Mã hóa an toàn, phân quyền nghiêm ngặt theo hàng, bảo vệ tuyệt đối quyền riêng tư và dữ liệu sức khỏe.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-teal-50/40 via-white to-slate-50 dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-950">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/80 px-4 py-1.5 border border-teal-200/80 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold shadow-xs">
              <HeartPulse className="h-4 w-4 text-teal-600 animate-pulse" />
              <span>Hệ thống Hỗ trợ Ra Quyết định Y tế (Clinical Decision Support System)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight sm:leading-tight">
              Sàng lọc & Theo dõi <br className="hidden sm:block" />
              <span className="text-teal-600 dark:text-teal-400">Nguy cơ Bệnh Mạn tính</span> bằng AI
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Nền tảng ứng dụng 5 mô hình Machine Learning & Explainable AI (TreeSHAP) hỗ trợ cá nhân và cộng đồng tự tầm soát sớm, thấu hiểu căn nguyên sức khỏe và chủ động dự phòng các bệnh không lây nhiễm.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/screening" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 min-h-[44px] px-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm gap-2 shadow-lg shadow-teal-600/25">
                  Bắt đầu Khảo sát Nguy cơ <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-12 min-h-[44px] px-6 rounded-xl border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                  Đăng ký Hồ sơ Y tế
                </Button>
              </Link>
            </div>

            {/* Cam kết y tế an toàn */}
            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600" /> Hoàn toàn miễn phí
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600" /> Không lưu cookies độc hại
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600" /> Kết quả tức thì &lt; 1 giây
              </span>
            </div>
          </div>
        </section>

        {/* Danh mục 4 Bệnh Mạn tính */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Phạm vi 4 Bệnh Mạn tính Cốt lõi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Các mô hình được huấn luyện trên bộ dữ liệu dịch tễ học quy mô lớn (CDC BRFSS & Pima Indians) với độ nhạy (Recall) ưu tiên trên 80%.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {diseases.map((d, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${d.color}`}>
                    <d.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold rounded-lg">
                    {d.badge}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    {d.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4 Trụ cột Công nghệ Y tế */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Ưu điểm Vượt trội của Hệ thống
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                Kết hợp chặt chẽ giữa học máy tiên tiến, khả năng giải thích minh bạch và đạo đức y học.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
