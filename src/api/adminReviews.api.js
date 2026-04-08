import axiosClient from "./axiosClient";

const adminReviewsApi = {
  list: (params) => axiosClient.get("/admin/reviews", { params }), // { message, data: { reviews, ... } }
  getById: (id) => axiosClient.get(`/admin/reviews/${id}`), // { message, data }
  updateStatus: (id, status) =>
    axiosClient.put(`/admin/reviews/${id}/status`, { status }), // { message, data }
  remove: (id) => axiosClient.delete(`/admin/reviews/${id}`), // { message }
};

export default adminReviewsApi;
