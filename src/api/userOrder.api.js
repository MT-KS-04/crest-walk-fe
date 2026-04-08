import axiosClient from "./axiosClient";

const userOrderApi = {
  checkout: (data) => {
    // data: { address, phone, payment_method }
    return axiosClient.post("/orders/checkout", data);
  },

  getOrderHistory: () => {
    return axiosClient.get("/orders");
  },

  getOrderDetail: (id) => {
    return axiosClient.get(`/orders/${id}`);
  },

  /** Tra cứu công khai: orderId + phone (khách); chủ đơn đăng nhập có thể chỉ cần orderId */
  trackOrder: (params) => {
    return axiosClient.get("/orders/track", { params });
  },
  cancelOrder: (id) => {
    return axiosClient.patch(`/orders/${id}/cancel`);
  },
};

export default userOrderApi;
