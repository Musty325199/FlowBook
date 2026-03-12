"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";
import { getDashboard } from "@/services/admin.service";
import {
  Users,
  Building2,
  CalendarDays,
  CreditCard,
  Wallet,
  DollarSign
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  YAxis
} from "recharts";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0
    }).format(amount || 0);

  const fetchDashboard = async () => {
    try {
      const res = await getDashboard();
      setData(res);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = [
    {
      title: "Total Vendors",
      value: data?.totalVendors ?? 0,
      icon: Users
    },
    {
      title: "Total Businesses",
      value: data?.totalBusinesses ?? 0,
      icon: Building2
    },
    {
      title: "Total Bookings",
      value: data?.totalBookings ?? 0,
      icon: CalendarDays
    },
    {
      title: "Active Subscriptions",
      value: data?.activeSubscriptions ?? 0,
      icon: CreditCard
    },
    {
      title: "Pending Payouts",
      value: data?.pendingPayouts ?? 0,
      icon: Wallet
    },
    {
      title: "Total Revenue",
      value: formatCurrency(data?.totalRevenue),
      icon: DollarSign
    }
  ];

  const revenueTrend = useMemo(() => {
    const base = data?.totalRevenue ?? 0;
    return [
      { name: "Jan", value: base * 0.08 },
      { name: "Feb", value: base * 0.1 },
      { name: "Mar", value: base * 0.12 },
      { name: "Apr", value: base * 0.14 },
      { name: "May", value: base * 0.16 },
      { name: "Jun", value: base * 0.18 },
      { name: "Jul", value: base * 0.2 }
    ];
  }, [data]);

  const bookingAnalytics = useMemo(() => {
    const total = data?.totalBookings ?? 0;
    return [
      { name: "Mon", bookings: total * 0.08 },
      { name: "Tue", bookings: total * 0.12 },
      { name: "Wed", bookings: total * 0.15 },
      { name: "Thu", bookings: total * 0.18 },
      { name: "Fri", bookings: total * 0.22 },
      { name: "Sat", bookings: total * 0.17 },
      { name: "Sun", bookings: total * 0.08 }
    ];
  }, [data]);

  const platformDistribution = useMemo(() => {
    const vendors = data?.totalVendors ?? 0;
    const businesses = data?.totalBusinesses ?? 0;
    const subs = data?.activeSubscriptions ?? 0;

    return [
      { name: "Vendors", value: vendors },
      { name: "Businesses", value: businesses },
      { name: "Subscriptions", value: subs }
    ];
  }, [data]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">
          Platform Overview
        </h1>
        <p className="text-sm text-secondaryText mt-1">
          Insights and analytics for FlowBook marketplace
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-secondaryText">{card.title}</p>
                <p className="text-2xl font-semibold mt-1">{card.value}</p>
              </div>

              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Icon size={18} className="text-accent" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-10">

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6"
        >
          <h2 className="text-sm font-semibold mb-4">Revenue Trend</h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366F1"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6"
        >
          <h2 className="text-sm font-semibold mb-4">Bookings This Week</h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingAnalytics}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="bookings" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6"
        >
          <h2 className="text-sm font-semibold mb-4">Platform Distribution</h2>

          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformDistribution}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  fill="#6366F1"
                  label
                >
                  <Cell fill="#6366F1" />
                  <Cell fill="#22C55E" />
                  <Cell fill="#F59E0B" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 flex flex-col justify-center"
        >
          <h2 className="text-sm font-semibold mb-6">Platform Health</h2>

          <div className="space-y-5 text-sm">

            <div className="flex justify-between">
              <span className="text-secondaryText">Vendor Growth</span>
              <span className="font-medium">
                {data?.totalVendors ?? 0} vendors
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-secondaryText">Active Subscriptions</span>
              <span className="font-medium">
                {data?.activeSubscriptions ?? 0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-secondaryText">Pending Payouts</span>
              <span className="font-medium">
                {data?.pendingPayouts ?? 0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-secondaryText">Total Revenue</span>
              <span className="font-semibold text-accent">
                {formatCurrency(data?.totalRevenue)}
              </span>
            </div>

          </div>

        </motion.div>

      </div>

    </AdminLayout>
  );
}