import api from "@/lib/api";

export const getBookings = async () => {
  const { data } = await api.get("/api/bookings");
  return data;
};

export const updateBookingStatus = async (id, status) => {
  const { data } = await api.patch(`/api/bookings/${id}/status`, { status });
  return data;
};

export const sendBookingMessage = async (id, message) => {
  const { data } = await api.post(`/api/bookings/${id}/message`, { message });
  return data;
};