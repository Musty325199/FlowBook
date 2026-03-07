"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

export default function AuthLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background dark:bg-darkBackground flex">

      <div className="hidden lg:flex lg:w-1/2 relative bg-muted dark:bg-darkSurface/40 border-r border-border dark:border-darkBorder">

        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">
              FlowBook
            </h1>
            <ThemeToggle />
          </div>

          <div className="max-w-md space-y-6">
            <h2 className="text-3xl font-bold leading-tight">
              Run your salon professionally with structured bookings & weekly payouts.
            </h2>
            <p className="text-secondaryText text-sm">
              Designed for Nigerian barbers and salons who want to operate like modern businesses.
            </p>
          </div>

          <div className="text-xs text-secondaryText">
            © {new Date().getFullYear()} FlowBook
          </div>

        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">

        <div className="absolute top-6 right-6 lg:hidden">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-2xl shadow-soft p-8 sm:p-10">
          {children}
        </div>

      </div>

    </div>
  );
}