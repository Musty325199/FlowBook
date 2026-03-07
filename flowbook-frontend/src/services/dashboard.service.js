import api from "@/lib/api";

export const getDashboardSummary = async () => {
  const res = await api.get("/api/dashboard/summary");
  return res.data;
};