import axiosClient from "./axiosClient";

const wishlistApi = {
  getWishlist: () => {
    return axiosClient.get("/wishlist");
  },

  addToWishlist: (productId) => {
    return axiosClient.post("/wishlist/add", { product_id: productId });
  },
};

export default wishlistApi;
