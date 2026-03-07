"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Check } from "lucide-react";
import zxcvbn from "zxcvbn";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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

    if (
      !form.businessName ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      toast.error("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!form.agree) {
      toast.error("You must accept the terms");
      return;
    }

    if (passwordStrength?.score < 2) {
      toast.error("Password is too weak");
      return;
    }

    try {
      setLoading(true);

      await register({
        businessName: form.businessName,
        email: form.email,
        password: form.password,
        name: form.businessName,
      });

      toast.success("Verification email sent");
      setEmailSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);

      await googleLogin(credentialResponse.credential);

      toast.success("Account created");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-8 text-center">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight">
            Verify your email
          </h2>
          <p className="text-sm text-secondaryText max-w-xs mx-auto leading-relaxed">
            We sent a verification link to your email address. Please check
            your inbox and click the link to activate your account.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-block bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Create your account
        </h2>
        <p className="text-sm text-secondaryText max-w-xs mx-auto leading-relaxed">
          Start managing your salon professionally with FlowBook.
        </p>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error("Google signup failed")}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border dark:bg-darkBorder" />
        <span className="text-xs text-secondaryText whitespace-nowrap">
          or sign up with email
        </span>
        <div className="flex-1 h-px bg-border dark:bg-darkBorder" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        <input
          type="text"
          placeholder="Business Name"
          value={form.businessName}
          onChange={(e) =>
            setForm({ ...form, businessName: e.target.value })
          }
          className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <input
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
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

        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, agree: !form.agree })}
            className={`mt-1 h-5 w-5 rounded-md border flex items-center justify-center transition ${
              form.agree
                ? "bg-accent border-accent"
                : "border-border dark:border-darkBorder bg-background dark:bg-darkBackground"
            }`}
          >
            {form.agree && <Check size={12} className="text-white" />}
          </button>

          <p className="text-xs text-secondaryText leading-relaxed">
            I agree to the Terms and Privacy Policy.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent/90 transition disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-xs text-center text-secondaryText">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}