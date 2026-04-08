import axiosClient from "./axiosClient";

const adminStatsApi = {
  revenue: (params) => axiosClient.get("/admin/stats/revenue", { params }), // { message, data: { interval, timeline, summary } }
  bestsellers: (params) =>
    axiosClient.get("/admin/stats/bestsellers", { params }), // { message, data: [] }
};

export default adminStatsApi;
