import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

/**
 * Khởi tạo Axios Client tập trung kết nối FastAPI Backend.
 * withCredentials: true cho phép trình duyệt tự động đính kèm và nhận HttpOnly Cookies (access_token, refresh_token).
 * Loại bỏ hoàn toàn việc lưu JWT trong localStorage, triệt tiêu 100% rủi ro đánh cắp token qua XSS (Trụ cột 5 - Bảo mật Y tế).
 */
export const client = axios.create({
  baseURL: "/api/backend",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Biến cờ ngăn chặn gọi refresh token trùng lặp (race condition)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

/**
 * Điều hướng an toàn khi phiên làm việc thực sự hết hạn trên trang bảo vệ.
 * Tuyệt đối không reload trang hoặc redirect nếu người dùng đã ở sẵn trang /login, /register hoặc trang chủ /.
 */
function safeSessionExpiredRedirect() {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path.startsWith("/login") || path.startsWith("/register") || path === "/") {
    return;
  }
  window.location.href = `/login?callbackUrl=${encodeURIComponent(path)}&session_expired=true`;
}

/**
 * Response Interceptor: Tự động xử lý Refresh Token Rotation khi gặp 401
 * Trình duyệt tự gửi HttpOnly cookie 'refresh_token' qua withCredentials: true mà không cần JavaScript can thiệp.
 */
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Bỏ qua nếu không có phản hồi hoặc không phải lỗi 401
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Không kích hoạt refresh nếu chính request đăng nhập/đăng ký/refresh bị 401
    const requestUrl = originalRequest.url || "";
    if (
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // Nếu /auth/me bị 401 (người dùng chưa đăng nhập), chỉ reject để state user=null, KHÔNG redirect
    if (requestUrl.includes("/auth/me")) {
      return Promise.reject(error);
    }

    // Nếu request này đã thử refresh một lần rồi mà vẫn 401 -> Chuyển về trang đăng nhập an toàn
    if (originalRequest._retry) {
      safeSessionExpiredRedirect();
      return Promise.reject(error);
    }

    // Nếu đang có một tiến trình refresh token chạy ngầm, đưa request này vào hàng đợi chờ
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => client(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Gọi refresh: Trình duyệt tự động đính kèm HttpOnly cookie refresh_token
      await axios.post(
        "/api/backend/auth/refresh",
        {},
        { withCredentials: true }
      );

      processQueue(null);
      // Gọi lại request ban đầu với cookie access_token mới đã được trình duyệt cập nhật
      return client(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr as AxiosError);
      safeSessionExpiredRedirect();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;
