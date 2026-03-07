"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const router = useRouter();

  const called = useRef(false);

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [failed, setFailed] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!token || called.current) return;
    called.current = true;

    const verifyEmail = async () => {
      try {
        await api.get(`/api/auth/verify-email/${token}`);

        setVerified(true);
        setLoading(false);

        toast.success("Email verified successfully");
      } catch (err) {
        setFailed(true);
        setLoading(false);

        toast.error(
          err.response?.data?.message ||
            "Verification link is invalid or expired"
        );
      }
    };

    verifyEmail();
  }, [token]);

  useEffect(() => {
  if (!verified) return;

  const interval = setInterval(() => {
    setCountdown((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [verified]);

useEffect(() => {
  if (countdown === 0) {
    router.push("/login");
  }
}, [countdown, router]);


  if (loading) {
    return (
      <div className="space-y-8 text-center">
        <div className="flex justify-center">
          <Loader2 className="animate-spin text-accent" size={36} />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight">
            Verifying your email
          </h2>
          <p className="text-sm text-secondaryText max-w-xs mx-auto leading-relaxed">
            Please wait while we confirm your account.
          </p>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="space-y-8 text-center">
        <div className="flex justify-center">
          <CheckCircle2
            size={42}
            className="text-success animate-in zoom-in duration-300"
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight">
            Email verified
          </h2>

          <p className="text-sm text-secondaryText max-w-xs mx-auto leading-relaxed">
            Your account has been successfully verified.
          </p>

          <p className="text-xs text-secondaryText">
            Redirecting to login in {countdown}s...
          </p>
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="space-y-8 text-center">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight">
            Verification failed
          </h2>

          <p className="text-sm text-secondaryText max-w-xs mx-auto leading-relaxed">
            The verification link is invalid or expired.
          </p>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="w-full bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent/90 transition"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return null;
}