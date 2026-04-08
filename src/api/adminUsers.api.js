import axiosClient from "./axiosClient";

const adminUsersApi = {
  list: (params) => axiosClient.get("/admin/users", { params }), // { message, users, pagination }
  getById: (id) => axiosClient.get(`/admin/users/${id}`), // { message, data: User }
  updateStatus: (id, payload) =>
    axiosClient.put(`/admin/users/${id}/status`, payload), // { message, data }
  resetPassword: (id, newPassword) =>
    axiosClient.put(`/admin/users/${id}/reset-password`, { newPassword }), // { message, data: null }
};

export default adminUsersApi;
