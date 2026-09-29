import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

/**
 * Khởi tạo Axios Client tập trung kết nối FastAPI Backend.
 * withCredentials: true cho phép trình duyệt tự động đính kèm và nhận HttpOnly Cookies (access_token, refresh_token).
 * Loại bỏ hoàn toàn việc lưu JWT trong localStorage, triệt tiêu 100% rủi ro đánh cắp token qua XSS (Trụ cột 2.5 - Bảo mật Y tế).
 */
export const api = axios.create({
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
 * Response Interceptor: Tự động xử lý Refresh Token Rotation khi gặp 401
 * Trình duyệt tự gửi HttpOnly cookie 'refresh_token' qua withCredentials: true mà không cần JavaScript can thiệp.
 */
api.interceptors.response.use(
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

    // Nếu request này đã thử refresh một lần rồi mà vẫn 401 -> Chuyển về trang đăng nhập
    if (originalRequest._retry) {
      if (typeof window !== "undefined") {
        window.location.href = "/login?session_expired=true";
      }
      return Promise.reject(error);
    }

    // Nếu đang có một tiến trình refresh token chạy ngầm, đưa request này vào hàng đợi chờ
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
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
      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr as AxiosError);
      if (typeof window !== "undefined") {
        window.location.href = "/login?session_expired=true";
      }
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
