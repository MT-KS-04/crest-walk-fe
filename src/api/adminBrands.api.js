import axiosClient from "./axiosClient";

const adminBrandsApi = {
  list: () => axiosClient.get("/admin/brands"), // { message, data: Brand[] }
  getById: (id) => axiosClient.get(`/admin/brands/${id}`), // { message, data: Brand }
  create: (payload) => axiosClient.post("/admin/brands", payload), // { message, data }
  update: (id, payload) => axiosClient.put(`/admin/brands/${id}`, payload), // { message, data }
  remove: (id) => axiosClient.delete(`/admin/brands/${id}`), // { message, data: null }
};

export default adminBrandsApi;
