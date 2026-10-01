import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

/**
 * Cấu hình Axios Client tập trung cho toàn bộ ứng dụng
 * Tự động gửi nhận HttpOnly Cookies và xử lý gia hạn phiên làm việc (Refresh Token Rotation)
 */

const getBaseUrl = (): string => {
  // Trình duyệt (Client-side): dùng Next.js rewrite proxy để an toàn cookie SameSite
  if (typeof window !== "undefined") {
    return "/api/backend";
  }
  // Máy chủ (Server-side rendering): trỏ thẳng vào FastAPI Backend
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true, // BẮT BUỘC: Đính kèm HttpOnly Cookies cho mọi request
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

// Response Interceptor: Bắt lỗi 401 và tự động gọi /auth/refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Không kích hoạt refresh nếu chính request login/refresh/logout bị lỗi 401
    const isAuthEndpoint = originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/logout");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/auth/refresh");
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Trích xuất thông điệp lỗi tiếng Việt dễ hiểu từ FastAPI Response
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((d) => d.msg || d.message).join(", ");
    }
    if (error.code === "ECONNABORTED") {
      return "Máy chủ phản hồi quá thời gian quy định (Timeout). Vui lòng thử lại sau.";
    }
    if (error.message === "Network Error") {
      return "Không thể kết nối đến máy chủ y tế. Vui lòng kiểm tra kết nối mạng của bạn.";
    }
  }
  return "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.";
}

export default apiClient;

