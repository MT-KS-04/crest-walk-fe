import axiosClient from "./axiosClient";

const adminProductsApi = {
  list: (params) => axiosClient.get("/admin/products", { params }), // { message, products, pagination }
  getById: (id) => axiosClient.get(`/admin/products/${id}`), // { message, data: Product }
  create: (payload) => axiosClient.post("/admin/products", payload), // { message, data }
  update: (id, payload) => axiosClient.put(`/admin/products/${id}`, payload), // { message, data }
  remove: (id) => axiosClient.delete(`/admin/products/${id}`), // { message, data: null }
};

export default adminProductsApi;
