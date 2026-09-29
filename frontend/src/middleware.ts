import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Danh sách các tiền tố đường dẫn yêu cầu người dùng phải đăng nhập
const PROTECTED_ROUTES = [
  "/dashboard",
  "/screening",
  "/history",
  "/profile",
  "/what-if",
];

// Danh sách các tuyến chỉ dành cho khách (chưa đăng nhập)
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Kiểm tra sự tồn tại của HttpOnly cookies (access_token hoặc refresh_token)
  // hoặc cờ đăng nhập medrisk_logged_in từ backend
  const hasAuthToken =
    request.cookies.has("access_token") ||
    request.cookies.has("refresh_token") ||
    request.cookies.has("medrisk_logged_in") ||
    request.cookies.has("medrisk_token");

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // 1. Chặn người dùng chưa đăng nhập truy cập các trang yêu cầu bảo vệ
  if (isProtectedRoute && !hasAuthToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Tự động chuyển hướng về Dashboard nếu người dùng đã đăng nhập vào trang login/register
  if (isAuthRoute && hasAuthToken) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/screening/:path*",
    "/history/:path*",
    "/profile/:path*",
    "/what-if/:path*",
    "/login",
    "/register",
  ],
};
