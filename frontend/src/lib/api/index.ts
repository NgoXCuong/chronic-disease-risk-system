import client from "./client";
import { authApi } from "./auth";
import { usersApi } from "./users";
import { screeningApi } from "./screening";

export { client, client as api, authApi, usersApi, screeningApi };

// Hàm tiện ích lấy mô hình AI đã nạp (tương thích ngược hoàn toàn)
export const getLoadedModels = screeningApi.getModels;

export default client;
