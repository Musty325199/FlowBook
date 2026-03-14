import axios from "axios";
import { toast } from "sonner";

import axios from "axios";
import { toast } from "sonner";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];
let suspensionHandled = false;

const processQueue = (error) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 403 &&
      error.response?.data?.message?.toLowerCase().includes("suspended") &&
      !originalRequest.url.includes("/api/auth/me")
    ) {
      if (!suspensionHandled && typeof window !== "undefined") {
        suspensionHandled = true;

        toast.error("Your account has been suspended. Contact support.");

        setTimeout(() => {
          window.location.href = "/account-suspended";
        }, 1200);
      }

      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/public/")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/api/auth/refresh");

        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        processQueue(err);

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;