import api from "@/lib/api";

export const getBusiness = async () => {
  const res = await api.get("/api/business");
  return res.data;
};

export const updateBusiness = async (data) => {
  const payload = {
    name: data.name,
    phone: data.phone,
    location: data.location,
    description: data.description,
    cancellationPolicy: data.cancellationPolicy,
    workingHours: data.workingHours,
    bankName: data.bankName,
    accountNumber: data.accountNumber,
    accountName: data.accountName
  };

  const res = await api.put("/api/business", payload);
  return res.data;
};