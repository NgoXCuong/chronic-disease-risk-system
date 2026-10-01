import React from "react";
import Link from "next/link";
import { User as UserIcon, PlusCircle, History, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  fullName?: string | null;
  email?: string;
  lastUpdated?: string | null;
}

export function DashboardHeader({ fullName, email, lastUpdated }: Props) {
  const displayName = fullName || email?.split("@")[0] || "Người dùng";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
          <UserIcon className="h-7 w-7" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Xin chào, {displayName}
            </h1>
            <Badge variant="outline" className="border-teal-200 bg-teal-50/50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 text-[11px] font-medium">
              Bệnh nhân
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Theo dõi chỉ số sức khỏe cá nhân & rủi ro bệnh mạn tính không lây</span>
            {lastUpdated && (
              <>
                <span>•</span>
                <span>Cập nhật: {new Date(lastUpdated).toLocaleDateString("vi-VN")}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Các nút tác vụ nhanh */}
      <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
        <Link href="/screening">
          <Button className="h-11 min-h-[44px] px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20 flex items-center gap-2 cursor-pointer transition-all">
            <PlusCircle className="h-4 w-4" />
            Sàng lọc mới
          </Button>
        </Link>
        <Link href="/history">
          <Button variant="outline" className="h-11 min-h-[44px] px-4 rounded-xl border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all">
            <History className="h-4 w-4 text-slate-500" />
            Lịch sử
          </Button>
        </Link>
      </div>
    </div>
  );
}
