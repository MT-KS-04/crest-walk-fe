import axiosClient from "./axiosClient";

const adminCategoriesApi = {
  list: () => axiosClient.get("/admin/categories"), // { message, data: Category[] }
  getById: (id) => axiosClient.get(`/admin/categories/${id}`), // { message, data: Category }
  create: (payload) => axiosClient.post("/admin/categories", payload), // { message, data }
  update: (id, payload) => axiosClient.put(`/admin/categories/${id}`, payload), // { message, data }
  remove: (id) => axiosClient.delete(`/admin/categories/${id}`), // { message, data: null }
};

export default adminCategoriesApi;
