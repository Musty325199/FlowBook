import api from "@/lib/api";

export const getPayouts = async () => {
  const res = await api.get("api/payouts");
  return res.data;
};

export const withdraw = async (amount) => {
  const res = await api.post("api/payouts/withdraw", { amount });
  return res.data;
};