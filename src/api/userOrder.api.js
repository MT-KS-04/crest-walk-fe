import axiosClient from "./axiosClient";

const userOrderApi = {
  checkout: (data) => {
    // data: { address, phone, payment_method }
    return axiosClient.post("/user/order/checkout", data);
  },

  getOrderHistory: () => {
    return axiosClient.get("/user/order");
  },

  getOrderDetail: (id) => {
    return axiosClient.get(`/user/order/${id}`);
  },
};

export default userOrderApi;
