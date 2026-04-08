import axiosClient from "./axiosClient";

const cartApi = {
  /**
   * Lấy danh sách giỏ hàng hiện tại của người dùng
   */
  get: () => {
    return axiosClient.get("/cart");
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param {Object} payload { product_id, size, quantity }
   */
  add: (payload) => {
    return axiosClient.post("/cart/add", payload);
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   * @param {Object} payload { product_id, size, quantity }
   */
  update: (payload) => {
    return axiosClient.put("/cart/update", payload);
  },

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * @param {Object} payload { product_id, size }
   */
  remove: (payload) => {
    return axiosClient.delete("/cart/remove", { data: payload });
  }
};

export default cartApi;
