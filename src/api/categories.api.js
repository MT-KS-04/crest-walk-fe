import axiosClient from "./axiosClient";

const categoriesApi = {
  list: () => axiosClient.get("/categories"), // Public API
};

export default categoriesApi;
