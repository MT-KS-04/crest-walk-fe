import axiosClient from "./axiosClient";

const bannersApi = {
  list: (params) => axiosClient.get("/banners", { params }),
};

export default bannersApi;
