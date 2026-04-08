import axiosClient from "./axiosClient";

const adminInventoryApi = {
  list: (params) => axiosClient.get("/admin/inventory", { params }), // { message, inventory, pagination, threshold }
  updateSizeStock: (productId, size, payload) =>
    axiosClient.patch(`/admin/inventory/${productId}/size/${size}`, payload), // { message, data }
};

export default adminInventoryApi;
