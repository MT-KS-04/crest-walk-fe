import axiosClient from "./axiosClient";

const brandsApi = {
  list: () => axiosClient.get("/brands"), // Public API
};

export default brandsApi;
