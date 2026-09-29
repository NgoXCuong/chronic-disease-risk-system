import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";

export function AuthMobileHeader() {
  return (
    <div className="w-full flex items-center justify-between pb-6 mb-2">
      <Link href="/" className="inline-flex items-center gap-2 group">
        <div className="w-9 h-9 rounded-xl bg-medical-600 flex items-center justify-center text-white shadow-sm">
          <Stethoscope className="w-5 h-5" />
        </div>
        <span className="font-extrabold text-xl text-slate-900 dark:text-slate-100 tracking-tight">
          MedRisk <span className="text-medical-600 dark:text-medical-400 font-black">AI</span>
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trang chủ</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
