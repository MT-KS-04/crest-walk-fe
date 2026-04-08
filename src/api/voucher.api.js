import axiosClient from "./axiosClient";

const voucherApi = {
  getAll: (params) => {
    return axiosClient.get("/admin/vouchers", { params });
  },

  getById: (id) => {
    return axiosClient.get(`/admin/vouchers/${id}`);
  },

  create: (data) => {
    return axiosClient.post("/admin/vouchers", data);
  },

  update: (id, data) => {
    return axiosClient.put(`/admin/vouchers/${id}`, data);
  },

  delete: (id) => {
    return axiosClient.delete(`/admin/vouchers/${id}`);
  },
};

export default voucherApi;
