import api from "@/lib/api";

export const getPublicBusinessBySlug = async (slug) => {
  const res = await api.get(`/api/business/public/${slug}`);
  return res.data;
};