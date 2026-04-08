import axiosClient from "./axiosClient";

const adminProductsApi = {
  list: (params) => axiosClient.get("/admin/products", { params }), // { message, products, pagination }
  getById: (id) => axiosClient.get(`/admin/products/${id}`), // { message, data: Product }
  create: (payload) => axiosClient.post("/admin/products", payload), // { message, data }
  update: (id, payload) => axiosClient.put(`/admin/products/${id}`, payload), // { message, data }
  remove: (id) => axiosClient.delete(`/admin/products/${id}`), // { message, data: null }
  /** Server-side fetch để tránh CORS khi chuyển URL ảnh thành File (multipart) */
  fetchRemoteImageBlob: (url) =>
    axiosClient.post("/admin/fetch-remote-image", { url }, { responseType: "blob" }),
};

export default adminProductsApi;
