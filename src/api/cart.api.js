import axiosClient from "./axiosClient";

const cartApi = {
  getCart: () => {
    return axiosClient.get("/user/cart");
  },

  addToCart: (data) => {
    // data: { product_id, size, quantity }
    return axiosClient.post("/user/cart/add", data);
  },

  updateCart: (data) => {
    // data: { product_id, size, quantity }
    return axiosClient.put("/user/cart/update", data);
  },

  removeFromCart: (data) => {
    // data: { product_id, size }
    return axiosClient.delete("/user/cart/remove", { data });
  },
};

export default cartApi;
