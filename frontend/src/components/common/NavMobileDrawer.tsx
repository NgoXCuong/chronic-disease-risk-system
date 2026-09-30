"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/types/auth";

interface NavMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  user: User | null;
  logout: () => void;
}

export function NavMobileDrawer({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  logout,
}: NavMobileDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3 dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <nav className="flex flex-col space-y-1">
        <Link
          href="/"
          onClick={onClose}
          className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Trang chủ
        </Link>
        <Link
          href="/#features"
          onClick={onClose}
          className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          5 Mô hình AI
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              href="/screening"
              onClick={onClose}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Bắt đầu Khảo sát Nguy cơ
            </Link>
            <Link
              href="/dashboard"
              onClick={onClose}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Bảng điều khiển
            </Link>
            <Link
              href="/history"
              onClick={onClose}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Lịch sử sàng lọc
            </Link>
            <Link
              href="/profile"
              onClick={onClose}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Hồ sơ cá nhân &amp; Nhân trắc
            </Link>
          </>
        ) : (
          <Link
            href="/register"
            onClick={onClose}
            className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Bắt đầu Khảo sát Nguy cơ
          </Link>
        )}
      </nav>

      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
        {isAuthenticated && user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
              <UserIcon className="w-4 h-4 text-medical-600 dark:text-medical-400" />
              <span className="truncate">{user.profile?.full_name || user.email}</span>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2 text-rose-600 hover:text-rose-700 border-rose-200 dark:border-rose-900/60 dark:text-rose-400 min-h-[44px]"
              onClick={() => {
                onClose();
                logout();
              }}
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </Button>
          </div>
        ) : (
          <>
            <Link href="/login" onClick={onClose}>
              <Button variant="outline" className="w-full min-h-[44px]">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register" onClick={onClose}>
              <Button className="w-full gap-2 min-h-[44px]">
                Đăng ký tài khoản
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
