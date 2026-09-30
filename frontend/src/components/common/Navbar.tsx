"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, LogOut, Menu, Stethoscope, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NavMobileDrawer } from "@/components/common/NavMobileDrawer";
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

      {/* Menu Drawer trên thiết bị di động */}
      <NavMobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        logout={logout}
      />
    </header>
  );
}
