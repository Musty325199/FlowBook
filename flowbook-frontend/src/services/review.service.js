import api from "@/lib/api";

export const createReview = async (data) => {
  const res = await api.post("/api/reviews", data);
  return res.data;
};

export const getBusinessReviews = async (businessId) => {
  const res = await api.get(`/api/reviews/${businessId}`);
  return res.data;
};