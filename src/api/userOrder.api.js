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
};

export default userOrderApi;
