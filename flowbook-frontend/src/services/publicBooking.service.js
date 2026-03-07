import api from "@/lib/api";

export const getBusinessPublic = async (slug) => {
  const res = await api.get(`/api/business/public/${slug}`);
  return res.data;
};

export const getServicesPublic = async (slug) => {
  const res = await api.get(`/api/services/public/${slug}`);
  return res.data;
};

export const getBookedSlots = async (slug, date) => {
  const res = await api.get(`/api/bookings/public/${slug}/${date}`);
  return res.data;
};

export const createPublicBooking = async (slug, data) => {
  const res = await api.post(`/api/bookings/public/${slug}`, data);
  return res.data;
};