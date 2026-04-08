import axiosClient from "./axiosClient";

const authApi = {
  login: (email, password) => {
    return axiosClient.post("/auth/login", { email, password });
  },

  register: ({ full_name, email, password }) => {
    return axiosClient.post("/auth/register", { full_name, email, password });
  },

  refreshToken: () => {
    return axiosClient.post("/auth/refresh-token");
  },

  getMe: () => {
    return axiosClient.get("/auth/me");
  },

  logout: () => {
    return axiosClient.post("/auth/logout");
  },
};

export default authApi;

