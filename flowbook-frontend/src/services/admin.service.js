import api from "@/lib/api";

export const getDashboard = async () => {
  const res = await api.get("/api/admin/dashboard");
  return res.data;
};

export const getVendors = async () => {
  const res = await api.get("/api/admin/vendors");
  return res.data;
};

export const suspendVendor = async (id) => {
  const res = await api.patch(`/api/admin/vendors/${id}/suspend`);
  return res.data;
};

export const activateVendor = async (id) => {
  const res = await api.patch(`/api/admin/vendors/${id}/activate`);
  return res.data;
};

export const getBookings = async () => {
  const res = await api.get("/api/admin/bookings");
  return res.data;
};

export const getPayouts = async () => {
  const res = await api.get("/api/admin/payouts");
  return res.data;
};

export const approvePayout = async (id) => {
  const res = await api.patch(`/api/admin/payouts/${id}/approve`);
  return res.data;
};

export const rejectPayout = async (id) => {
  const res = await api.patch(`/api/admin/payouts/${id}/reject`);
  return res.data;
};

export const getSubscriptions = async () => {
  const res = await api.get("/api/admin/subscriptions");
  return res.data;
};

export const searchAdmin = async (query) => {
  const res = await api.get(`/api/admin/search?q=${query}`);
  return res.data;
};

export const updateAdminProfile = async (data) => {
  const res = await api.patch("/api/admin/profile", data);
  return res.data;
};