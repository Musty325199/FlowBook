import api from "@/lib/api";

export const getPublicBusinesses = async ({
  search = "",
  rating = "",
  service = "",
  sort = "",
} = {}) => {

  const res = await api.get("/api/business/public", {
    params: {
      search,
      rating,
      service,
      sort,
    },
  });

  return res.data;
};