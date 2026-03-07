import api from "@/lib/api";

export const getPublicBusinesses = async (search = "") => {
  const res = await api.get("/api/business/public", {
    params: { search },
  });

  return res.data;
};