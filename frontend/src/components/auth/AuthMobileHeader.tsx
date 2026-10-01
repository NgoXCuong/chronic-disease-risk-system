import React from "react";
import Link from "next/link";
import { HeartPulse } from "lucide-react";

interface AuthMobileHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthMobileHeader({ title, subtitle }: AuthMobileHeaderProps) {
  return (
    <div className="mb-6 lg:mb-8 text-center sm:text-left">
      <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20 group-hover:bg-teal-700 transition-colors">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div className="text-left">
          <span className="block text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            ChronicCare CDSS
          </span>
          <span className="block text-[10px] text-teal-600 dark:text-teal-400 font-semibold tracking-wide uppercase">
            Hệ thống Sàng lọc Y tế
          </span>
        </div>
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </h1>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}
