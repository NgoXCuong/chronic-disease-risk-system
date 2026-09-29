"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, LogOut, Menu, Stethoscope, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 transition-colors">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-medical-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-lg leading-tight tracking-tight flex items-center gap-1">
              MedRisk <span className="text-medical-600 dark:text-medical-400 font-black">AI</span>
            </span>
            <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Sàng lọc Nguy cơ Bệnh Mạn tính
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-medical-600 dark:text-slate-300 dark:hover:text-medical-400 transition-colors"
          >
            Trang chủ
          </Link>
          <Link
            href="/#features"
            className="text-sm font-medium text-slate-600 hover:text-medical-600 dark:text-slate-300 dark:hover:text-medical-400 transition-colors"
          >
            5 Mô hình AI
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/screening"
                className="text-sm font-medium text-slate-600 hover:text-medical-600 dark:text-slate-300 dark:hover:text-medical-400 transition-colors"
              >
                Khảo sát Nguy cơ
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-600 hover:text-medical-600 dark:text-slate-300 dark:hover:text-medical-400 transition-colors"
              >
                Bảng điều khiển
              </Link>
            </>
          ) : (
            <Link
              href="/register"
              className="text-sm font-medium text-slate-600 hover:text-medical-600 dark:text-slate-300 dark:hover:text-medical-400 transition-colors"
            >
              Khảo sát Nguy cơ
            </Link>
          )}
        </nav>

        {/* Action Controls & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Switcher */}
          <ThemeToggle />

          {/* Desktop Auth Controls */}
          <div className="hidden sm:flex items-center gap-2">
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="gap-1.5 border-medical-200 dark:border-medical-800 text-medical-700 dark:text-medical-300">
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="max-w-[130px] truncate">{user.profile?.full_name || user.email}</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => logout()}
                      className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
                      title="Đăng xuất khỏi hệ thống"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" size="sm">
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="gap-1.5">
                        Đăng ký
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle (Touch target >= 44px) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden w-11 h-11 text-slate-700 dark:text-slate-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Mở menu điều hướng"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3 dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Trang chủ
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              5 Mô hình AI
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/screening"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Bắt đầu Khảo sát Nguy cơ
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Bảng điều khiển (Dashboard)
                </Link>
                <Link
                  href="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Lịch sử sàng lọc
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Hồ sơ cá nhân &amp; Nhân trắc
                </Link>
              </>
            ) : (
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
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
                  <User className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                  <span className="truncate">{user.profile?.full_name || user.email}</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2 text-rose-600 hover:text-rose-700 border-rose-200 dark:border-rose-900/60 dark:text-rose-400"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full gap-2">
                    Đăng ký tài khoản
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
