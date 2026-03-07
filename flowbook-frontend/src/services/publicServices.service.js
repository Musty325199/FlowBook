import api from "@/lib/api";

export const getPublicServices = async (slug) => {
  const res = await api.get(`/api/services/public/${slug}`);
  return res.data;
};