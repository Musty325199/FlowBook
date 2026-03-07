"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { getBusiness } from "@/services/business.service";
import {
  startSubscription,
  cancelSubscription,
  verifySubscription,
} from "@/services/subscription.service";

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentPlan, setCurrentPlan] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);

  const plans = [
    {
      id: "monthly",
      name: "Monthly Plan",
      price: "₦9,000",
      duration: "/month",
      features: [
        "Unlimited bookings",
        "Secure payments",
        "Weekly payouts",
        "Basic reporting",
      ],
    },
    {
      id: "yearly",
      name: "Yearly Plan",
      price: "₦90,000",
      duration: "/year",
      badge: "2 months free",
      features: [
        "Everything in Monthly",
        "Advanced reporting",
        "Priority support",
        "Early feature access",
      ],
    },
  ];

 useEffect(() => {
  fetchBusiness();
  handlePaymentReturn();
}, []);

const handlePaymentReturn = async () => {
  const success = searchParams.get("success");
  const reference = localStorage.getItem("flowbook_payment_ref");

  if (success && reference) {
    try {
      await verifySubscription(reference);
      toast.success("Subscription activated successfully");
      await fetchBusiness();
      localStorage.removeItem("flowbook_payment_ref");
    } catch {
      toast.error("Unable to verify payment");
    } finally {
      router.replace("/dashboard/subscription");
    }
  }
};

const fetchBusiness = async () => {
  try {
    const data = await getBusiness();
    setSubscriptionStatus(data.subscriptionStatus || "free");
    setCurrentPlan(data.subscriptionPlan || null);

    if (data.subscriptionExpiresAt) {
      const date = new Date(data.subscriptionExpiresAt);
      setExpiresAt(isNaN(date) ? null : date);
    } else {
      setExpiresAt(null);
    }
  } catch {}
};

const handleUpgrade = async (planId) => {
  if (planId === currentPlan && subscriptionStatus === "active") {
    toast.info("You are already on this plan");
    return;
  }

  try {
    setLoadingPlan(planId);
    const data = await startSubscription(planId);

    if (data?.authorizationUrl) {
      localStorage.setItem("flowbook_payment_ref", data.reference);
      window.location.href = data.authorizationUrl;
    } else {
      toast.error("Unable to start subscription");
    }
  } catch (err) {
    toast.error(err?.message || "Subscription failed");
  } finally {
    setLoadingPlan(null);
  }
};

const handleCancel = async () => {
  try {
    await cancelSubscription();
    toast.success("Subscription cancelled");
    await fetchBusiness();
    setConfirmCancel(false);
  } catch {
    toast.error("Unable to cancel subscription");
  }
};

const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const isActive =
  subscriptionStatus === "active" && expiresAt && expiresAt > new Date();

  return (
    <div className="space-y-10 w-full max-w-5xl mx-auto px-4 sm:px-6">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Subscription
        </h2>
        <p className="text-sm text-secondaryText">
          Manage your subscription and billing
        </p>
      </div>

      {!isActive && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          Your subscription is inactive. Please subscribe to continue accepting
          bookings.
        </div>
      )}

      <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 shadow-soft space-y-3">
        <p className="text-sm text-secondaryText">Current Plan</p>

        <div className="flex items-center gap-3">
          <p className="text-lg font-semibold capitalize">
            {isActive
              ? currentPlan
                ? `${currentPlan} plan`
                : "Active Subscription"
              : subscriptionStatus === "expired"
                ? "Expired"
                : "Inactive"}
          </p>

          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isActive ? "active" : "inactive"}
          </span>
        </div>

        <p className="text-sm text-secondaryText">
          Expires: {formatDate(expiresAt)}
        </p>

        {isActive && (
          <button
            onClick={() => setConfirmCancel(true)}
            className="mt-3 text-sm text-danger hover:underline"
          >
            Manage subscription
          </button>
        )}
      </div>

      {!isActive && (
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative border rounded-xl p-6 shadow-soft space-y-6 ${
                currentPlan === plan.id
                  ? "border-accent bg-accent/5"
                  : "border-border dark:border-darkBorder bg-surface dark:bg-darkSurface"
              }`}
            >
              {plan.badge && (
                <div className="absolute top-4 right-4 text-xs bg-accent text-white px-3 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{plan.name}</h3>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-secondaryText">
                    {plan.duration}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 text-sm">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check size={16} className="text-accent mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={loadingPlan === plan.id || currentPlan === plan.id}
                onClick={() => handleUpgrade(plan.id)}
                className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                  currentPlan === plan.id
                    ? "bg-muted dark:bg-darkSurface/60 text-secondaryText cursor-not-allowed"
                    : "bg-accent text-white hover:bg-accent/90"
                }`}
              >
                {currentPlan === plan.id
                  ? "Current Plan"
                  : loadingPlan === plan.id
                    ? "Processing..."
                    : "Choose Plan"}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {confirmCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-darkSurface rounded-xl p-6 w-full max-w-md space-y-4"
            >
              <h3 className="text-lg font-semibold">Cancel Subscription</h3>

              <p className="text-sm text-secondaryText">
                Are you sure you want to cancel your subscription?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-border dark:border-darkBorder"
                >
                  Keep Plan
                </button>

                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm rounded-lg bg-danger text-white"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
