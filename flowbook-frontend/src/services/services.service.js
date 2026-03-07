import api from "@/lib/api";

export const getServices = async () => {
  const res = await api.get("/api/services", {
    withCredentials: true,
  });
  return res.data;
};

export const createService = async (data) => {
  const res = await api.post("/api/services", data, {
    withCredentials: true,
  });
  return res.data;
};

export const updateService = async (id, data) => {
  const res = await api.put(`/api/services/${id}`, data, {
    withCredentials: true,
  });
  return res.data;
};

export const deleteService = async (id) => {
  const res = await api.delete(`/api/services/${id}`, {
    withCredentials: true,
  });
  return res.data;
};

export const getPublicServices = async (slug) => {
  const res = await api.get(`/api/services/public/${slug}`);
  return res.data;
};