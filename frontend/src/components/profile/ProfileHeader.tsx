import * as React from "react";
import { Mail } from "lucide-react";
import { User } from "@/types/auth";

interface ProfileHeaderProps {
  user: User | null;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const profile = user?.profile;
  const initial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "U";

  return (
    <div className="mb-8 p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-medical-50 dark:bg-medical-950/80 flex items-center justify-center text-medical-600 dark:text-medical-400 font-extrabold text-xl border border-medical-200 dark:border-medical-800">
          {initial}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {profile?.full_name || "Chưa đặt tên"}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-medical-100 text-medical-800 dark:bg-medical-950/80 dark:text-medical-300 border border-medical-200 dark:border-medical-800">
              {user?.role || "USER"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3.5 h-3.5" />
            {user?.email}
          </p>
        </div>
      </div>
      <div className="text-xs text-slate-400 dark:text-slate-500">
        Tham gia: {user?.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "---"}
      </div>
    </div>
  );
}
