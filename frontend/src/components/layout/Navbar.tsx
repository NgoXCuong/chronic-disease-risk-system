"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartPulse,
  LayoutDashboard,
  ClipboardList,
  User,
  LogOut,
  Menu,
  Home,
  ShieldAlert,
  SlidersHorizontal,
  Bot,
  MapPin,
  History,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/screening", label: "Sàng lọc", icon: ClipboardList },
    { href: "/simulation", label: "Mô phỏng", icon: SlidersHorizontal },
    { href: "/facilities", label: "Cơ sở Y tế", icon: MapPin },
    { href: "/chat", label: "Trợ lý AI", icon: Bot },
    ...(isAuthenticated
      ? [
          { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
          { href: "/history", label: "Lịch sử & Diễn tiến", icon: History },
        ]
      : []),
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Logo Thương hiệu Y tế CDSS */}
        <Link href="/" className="flex items-center gap-2.5 group focus:outline-none shrink-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20 group-hover:bg-teal-700 transition-colors shrink-0">
            <HeartPulse className="h-5 w-5 animate-pulse" />
          </div>
          <div className="text-left whitespace-nowrap">
            <span className="block text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              ChronicCare <span className="text-teal-600 dark:text-teal-400 font-extrabold">CDSS</span>
            </span>
            <span className="hidden xl:block text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase">
              Hệ thống Sàng lọc Y tế
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all whitespace-nowrap ${
                  active
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 shadow-xs"
                    : "text-slate-600 hover:text-teal-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-teal-400 dark:hover:bg-slate-900"
                }`}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Controls & Dropdown */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
          {!isLoading && (
            <>
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-teal-50/50 dark:hover:bg-teal-950/40 gap-2.5 font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-white text-xs font-bold">
                        {(user.profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <span className="max-w-[140px] truncate text-xs">
                        {user.profile?.full_name || user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-lg border-slate-200 dark:border-slate-800">
                    <DropdownMenuLabel className="px-2.5 py-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {user.profile?.full_name || "Bệnh nhân"}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {user.email}
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/dashboard" className="flex items-center gap-2 text-xs font-medium py-2">
                        <LayoutDashboard className="h-4 w-4 text-teal-600" />
                        Bảng điều khiển sức khỏe
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/history" className="flex items-center gap-2 text-xs font-medium py-2">
                        <History className="h-4 w-4 text-teal-600" />
                        Lịch sử & Diễn tiến nguy cơ
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/screening" className="flex items-center gap-2 text-xs font-medium py-2">
                        <ClipboardList className="h-4 w-4 text-teal-600" />
                        Khảo sát sàng lọc mới
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/profile" className="flex items-center gap-2 text-xs font-medium py-2">
                        <User className="h-4 w-4 text-slate-500" />
                        Hồ sơ & Thể chất cá nhân
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="rounded-lg cursor-pointer text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/40 text-xs font-semibold py-2 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất tài khoản
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="h-10 rounded-xl px-4 text-xs font-semibold text-slate-700 hover:text-teal-700 dark:text-slate-300"
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      className="h-10 rounded-xl px-4 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/20"
                    >
                      Đăng ký Hồ sơ
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Navigation Drawer (Shadcn Sheet Primitive) */}
        <div className="flex lg:hidden items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl text-slate-700 dark:text-slate-300"
                aria-label="Mở menu điều hướng"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px] p-6 rounded-l-2xl">
              <SheetHeader className="text-left pb-4 border-b border-slate-100 dark:border-slate-800">
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
                    <HeartPulse className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                      ChronicCare CDSS
                    </span>
                    <span className="block text-[10px] text-teal-600 font-semibold uppercase">
                      Hệ thống Sàng lọc Y tế
                    </span>
                  </div>
                </SheetTitle>
              </SheetHeader>

              {/* Danh sách link mobile */}
              <div className="py-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                      isActive(link.href)
                        ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Auth Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {isAuthenticated && user ? (
                  <div className="space-y-3">
                    <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {user.profile?.full_name || "Bệnh nhân"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="w-full h-11 min-h-[44px] rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30 gap-2 text-xs font-semibold"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất tài khoản
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full h-11 min-h-[44px] rounded-xl text-xs font-semibold">
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full h-11 min-h-[44px] rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold">
                        Đăng ký
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Medical Safety Disclaimer Note */}
                <div className="pt-4 flex items-start gap-2 text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-teal-600 mt-0.5" />
                  <span>Công cụ hỗ trợ ra quyết định lâm sàng (CDSS), không thay thế chẩn đoán bác sĩ.</span>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
