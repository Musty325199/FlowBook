"use client";

import { useState } from "react";
import { toast } from "sonner";
import { forgotPassword } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Enter your email address");
      return;
    }

    try {
      setLoading(true);

      await forgotPassword({ email });

      setSent(true);
      toast.success("Reset link sent to your email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-8 text-center">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight">
            Check your email
          </h2>
          <p className="text-sm text-secondaryText max-w-xs mx-auto leading-relaxed">
            If an account exists for that email, a password reset link has been
            sent. Please check your inbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="space-y-3 text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Reset your password
        </h2>
        <p className="text-sm text-secondaryText max-w-xs mx-auto leading-relaxed">
          Enter your email to receive a password reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-sm">

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent/90 transition disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

      </form>

    </div>
  );
}