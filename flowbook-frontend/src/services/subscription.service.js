import api from "@/lib/api";

export const startSubscription = async (plan) => {
  const res = await api.post("/api/subscriptions/start", { plan });
  return res.data;
};

export const cancelSubscription = async () => {
  const res = await api.post("/api/subscriptions/cancel");
  return res.data;
};

export const verifySubscription = async (reference) => {
  const res = await api.post("/api/subscriptions/verify", { reference });
  return res.data;
};