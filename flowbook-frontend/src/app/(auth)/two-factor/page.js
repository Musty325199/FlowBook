"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function TwoFactorPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { verifyTwoFactor, pending2FA } = useAuth();

  useEffect(() => {
    if (!pending2FA) {
      router.replace("/login");
    }
  }, [pending2FA, router]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error("Enter a valid 6-digit code");
      return;
    }

    try {
      setLoading(true);

      await verifyTwoFactor(code);

      toast.success("Login successful");
      router.push("/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid authentication code"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Two-Factor Authentication
        </h2>

        <p className="text-sm text-secondaryText max-w-xs mx-auto leading-relaxed">
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6 text-sm">

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, ""))
          }
          placeholder="Enter 6-digit code"
          className="w-full text-center tracking-[0.5em] px-4 py-3 rounded-lg border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent text-lg font-medium"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent/90 transition disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>

      </form>
    </div>
  );
}