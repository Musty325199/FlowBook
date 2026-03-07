"use client";

import { Calendar, Wallet, TrendingUp, CreditCard, Star, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";

export default function StatsCards({ data }) {
  const formatCurrency = (amount) => {
    if (!amount) return "₦0";
    return `₦${amount.toLocaleString()}`;
  };

  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[110px] rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const nextPayout =
    data?.payoutHistory?.find((p) => p.status === "pending") || null;

  const cards = [
    {
      title: "Total Bookings",
      value: data?.totalBookings || 0,
      icon: ClipboardList,
      color: "from-sky-500 to-sky-600"
    },
    {
      title: "Upcoming Bookings",
      value: data?.upcomingBookings || 0,
      icon: Calendar,
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Weekly Revenue",
      value: formatCurrency(data?.revenueThisWeek),
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Average Rating",
      value: data?.averageRating || 0,
      icon: Star,
      color: "from-yellow-500 to-yellow-600"
    },
    {
      title: "Available Balance",
      value: formatCurrency(data?.availableBalance),
      icon: Wallet,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Next Payout",
      value: nextPayout ? formatCurrency(nextPayout.net) : "—",
      icon: CreditCard,
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden rounded-xl border border-border dark:border-darkBorder bg-surface dark:bg-darkSurface shadow-soft p-6 hover:shadow-lg transition"
          >
            <div
              className={`absolute inset-0 opacity-10 bg-gradient-to-br ${card.color}`}
            />

            <div className="flex justify-between items-start relative">
              <div>
                <p className="text-xs uppercase tracking-wide text-secondaryText">
                  {card.title}
                </p>

                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>

              <div
                className={`p-3 rounded-lg bg-gradient-to-br ${card.color} text-white`}
              >
                <Icon size={18} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}