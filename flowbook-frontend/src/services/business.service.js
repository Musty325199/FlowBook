import api from "@/lib/api";

export const getBusiness = async () => {
  const res = await api.get("/api/business");
  return res.data;
};

export const updateBusiness = async (data) => {
  const res = await api.put("/api/business", data);
  return res.data;
};

export const uploadBusinessAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await api.put("/api/business/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return res.data;
};

export const uploadBusinessCover = async (file) => {
  const formData = new FormData();
  formData.append("coverImage", file);

  const res = await api.put("/api/business/cover", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return res.data;
};