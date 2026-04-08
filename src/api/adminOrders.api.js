import axiosClient from "./axiosClient";

const adminOrdersApi = {
  list: (params) => axiosClient.get("/admin/orders", { params }), // { message, orders, pagination }
  getById: (id) => axiosClient.get(`/admin/orders/${id}`), // { message, data: Order }
  updateStatus: (id, payload) =>
    axiosClient.put(`/admin/orders/${id}/status`, payload), // { message, data }
};

export default adminOrdersApi;
