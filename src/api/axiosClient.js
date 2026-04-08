import axios from "axios";
import config from "../config/index.config";

let accessToken = localStorage.getItem('accessToken') || null;

export const setAccessToken = (token) => {
  accessToken = token;
};

const axiosClient = axios.create({
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Cho phép gửi nhận Cookie
});

// Interceptor cho Request: Đính kèm AccessToken vào mỗi yêu cầu
axiosClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor cho Response: Xử lý làm mới Token khi hết hạn (Lỗi 401)
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Unauthorized) và chưa từng thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Gọi API refresh token
        // Lưu ý: Endpoint này phải khớp với backend của bạn
        const response = await axios.post(
          `${config.API_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
          },
        );

        const newAccessToken = response.data.accessToken;
        setAccessToken(newAccessToken);

        // Thử lại yêu cầu ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token cũng lỗi (hết hạn hoàn toàn), đăng xuất người dùng
        accessToken = null;
        // Có thể redirect về trang login ở đây hoặc bắn ra event để AuthContext xử lý
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
