"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import zxcvbn from "zxcvbn";
import { resetPassword } from "@/services/auth.service";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!form.password) return null;
    return zxcvbn(form.password);
  }, [form.password]);

  const strengthPercent = passwordStrength
    ? (passwordStrength.score + 1) * 20
    : 0;

  const strengthLabel = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

  const strengthColor =
    passwordStrength?.score <= 1
      ? "bg-danger"
      : passwordStrength?.score === 2
      ? "bg-warning"
      : passwordStrength?.score === 3
      ? "bg-accent"
      : "bg-success";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.password || !form.confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordStrength?.score < 2) {
      toast.error("Password is too weak");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(token, { password: form.password });

      toast.success("Password reset successfully");
      setDone(true);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Reset link is invalid or expired"
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-8 text-center">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight">
            Password updated
          </h2>
          <p className="text-sm text-secondaryText max-w-xs mx-auto leading-relaxed">
            Your password has been successfully updated. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Set a new password
        </h2>
        <p className="text-sm text-secondaryText max-w-xs mx-auto leading-relaxed">
          Enter a new secure password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent pr-10"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondaryText"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {passwordStrength && (
          <div className="space-y-2">
            <div className="w-full h-2 bg-muted dark:bg-darkSurface/60 rounded-full overflow-hidden">
              <div
                className={`h-full ${strengthColor} transition-all`}
                style={{ width: `${strengthPercent}%` }}
              />
            </div>

            <p className="text-xs text-secondaryText">
              {strengthLabel[passwordStrength.score]}
            </p>
          </div>
        )}

        <input
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
          className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent/90 transition disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}