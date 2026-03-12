"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Spinner from "@/components/ui/Spinner";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const { login, refreshUser, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter your admin email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await login({ email, password });

      if (res?.requiresTwoFactor) {
        toast.error("Two-factor authentication required");
        return;
      }

      await refreshUser();

      if (!user || user.role !== "admin") {
        toast.error("You do not have admin access");
        return;
      }

      toast.success("Welcome back, Admin");

      router.push("/admin/dashboard");
    } catch {
      toast.error("Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-darkBackground px-4">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-2xl p-8 shadow-sm space-y-8">

          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10">
              <ShieldCheck className="text-accent" size={22} />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-sm text-secondaryText">
                Sign in to manage FlowBook platform
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondaryText"
              />

              <input
                type="email"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border dark:border-darkBorder bg-background dark:bg-darkBackground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondaryText"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border dark:border-darkBorder bg-background dark:bg-darkBackground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {loading && <Spinner />}
              {loading ? "Signing in..." : "Login"}
            </motion.button>

          </form>

        </div>
      </motion.div>
    </div>
  );
}