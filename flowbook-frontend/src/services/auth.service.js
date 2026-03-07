import api from "@/lib/api";

export const register = async (data) => {
  const res = await api.post("/api/auth/register", data);
  return res.data;
};

export const login = async (data) => {
  const res = await api.post("/api/auth/login", data);
  return res.data;
};

export const logout = async () => {
  const res = await api.post("/api/auth/logout");
  return res.data;
};

export const refreshToken = async () => {
  const res = await api.post("/api/auth/refresh");
  return res.data;
};

export const forgotPassword = async (data) => {
  const res = await api.post("/api/auth/forgot-password", data);
  return res.data;
};

export const resetPassword = async (token, data) => {
  const res = await api.post(`/api/auth/reset-password/${token}`, data);
  return res.data;
};

export const verifyEmail = async (token) => {
  const res = await api.get(`/api/auth/verify-email/${token}`);
  return res.data;
};

export const enable2FA = async () => {
  const res = await api.post("/api/auth/enable-2fa");
  return res.data;
};

export const confirm2FA = async (token) => {
  const res = await api.post("/api/auth/confirm-2fa", { token });
  return res.data;
};

export const disable2FA = async () => {
  const res = await api.post("/api/auth/disable-2fa");
  return res.data;
};

export const googleLogin = async (idToken) => {
  const res = await api.post("/api/auth/google", { idToken });
  return res.data;
};