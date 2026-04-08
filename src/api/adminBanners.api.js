import axiosClient from "./axiosClient";

const adminBannersApi = {
  list: (params) => axiosClient.get("/admin/banners", { params }), // { message, data: { banners, ... } }
  getById: (id) => axiosClient.get(`/admin/banners/${id}`), // { message, data }
  create: (payload) => axiosClient.post("/admin/banners", payload), // { message, data }
  update: (id, payload) => axiosClient.put(`/admin/banners/${id}`, payload), // { message, data }
  remove: (id) => axiosClient.delete(`/admin/banners/${id}`), // { message }
};

export default adminBannersApi;
