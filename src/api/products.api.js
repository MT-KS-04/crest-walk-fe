import axiosClient from "./axiosClient";

const productsApi = {
  /**
   * Lấy danh sách sản phẩm (có phân trang)
   */
  list: (params) => {
    return axiosClient.get("/products", { params });
  },

  /**
   * Tìm kiếm sản phẩm theo từ khóa
   * @param {string} keyword 
   */
  search: (keyword) => {
    return axiosClient.get("/products/search", { params: { keyword } });
  },

  /**
   * Lọc sản phẩm theo nhiều tiêu chí
   */
  filter: (params) => {
    return axiosClient.get("/products/filter", { params });
  },

  /**
   * Lấy chi tiết sản phẩm theo ID
   */
  getById: (id) => {
    return axiosClient.get(`/products/${id}`);
  }
};

export default productsApi;
