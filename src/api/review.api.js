import axiosClient from "./axiosClient";

const reviewApi = {
  /**
   * Lấy danh sách đánh giá của sản phẩm
   */
  getProductReviews: (productId, params) => {
    // params: { page, limit }
    return axiosClient.get(`/reviews/product/${productId}`, { params });
  },

  /**
   * Kiểm tra quyền đánh giá của user đối với sản phẩm này
   */
  checkCanReview: (productId) => {
    return axiosClient.get(`/reviews/can-review/${productId}`);
  },

  /**
   * Gửi đánh giá mới
   */
  createReview: (data) => {
    // data: { product_id, rating, comment }
    return axiosClient.post("/reviews", data);
  },
};

export default reviewApi;
