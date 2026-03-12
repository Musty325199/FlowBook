"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";
import { getSubscriptions } from "@/services/admin.service";

import {
  CreditCard,
  Search,
  Users,
  TrendingUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const perPage = 10;

  const [selected, setSelected] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      const data = await getSubscriptions();
      setSubscriptions(data || []);
    } catch {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    const interval = setInterval(fetchSubscriptions, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    let data = [...subscriptions];

    if (search) {
      const q = search.toLowerCase();

      data = data.filter(
        (s) =>
          s.business?.name?.toLowerCase().includes(q) ||
          s.business?.owner?.name?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((s) => s.status === statusFilter);
    }

    return data;
  }, [subscriptions, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const summary = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active").length;
    const inactive = subscriptions.filter((s) => s.status === "inactive").length;

    return {
      active,
      inactive,
      total: subscriptions.length,
    };
  }, [subscriptions]);

  const chartData = useMemo(() => {
    const map = {};

    subscriptions.forEach((s) => {
      const date = new Date(s.startedAt || s.createdAt).toLocaleDateString(
        "en-NG",
        { month: "short" }
      );

      if (!map[date]) map[date] = 0;
      map[date] += 1;
    });

    return Object.keys(map).map((k) => ({
      month: k,
      subscriptions: map[k],
    }));
  }, [subscriptions]);

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mt-3 mb-8">
        <CreditCard className="text-accent" size={20} />
        <h1 className="text-lg font-semibold tracking-tight">
          Subscriptions
        </h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-secondaryText">Total Subscriptions</p>
            <p className="text-2xl font-semibold mt-1">{summary.total}</p>
          </div>

          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Users size={18} className="text-accent" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-secondaryText">Active</p>
            <p className="text-2xl font-semibold mt-1">{summary.active}</p>
          </div>

          <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <TrendingUp size={18} className="text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-secondaryText">Inactive</p>
            <p className="text-2xl font-semibold mt-1">{summary.inactive}</p>
          </div>

          <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <CalendarDays size={18} className="text-yellow-500" />
          </div>
        </motion.div>
      </div>

      <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={16} />
          <h2 className="text-sm font-semibold">
            Subscription Activity
          </h2>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="subscriptions"
                stroke="#6366F1"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="relative w-full lg:w-80">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondaryText"
          />

          <input
            placeholder="Search business..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-darkBorder bg-background dark:bg-darkBackground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "active", "inactive"].map((status) => {
            const active = statusFilter === status;

            return (
              <button
                key={status}
                onClick={() => {
                  setPage(1);
                  setStatusFilter(status);
                }}
                className={`px-3 py-1.5 text-xs rounded-full border transition ${
                  active
                    ? "bg-accent text-white border-accent"
                    : "border-border dark:border-darkBorder hover:bg-muted/40 dark:hover:bg-darkSurface"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      )}

      {!loading && paginated.length === 0 && (
        <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-12 text-center">
          No subscriptions found
        </div>
      )}

      {!loading && paginated.length > 0 && (
        <>
          <div className="lg:hidden space-y-4">
            {paginated.map((s) => {
              const statusBadge = () => {
                if (s.status === "active") {
                  return (
                    <span className="text-green-600 text-xs font-medium">
                      Active
                    </span>
                  );
                }
                return (
                  <span className="text-yellow-600 text-xs font-medium">
                    Inactive
                  </span>
                );
              };

              return (
                <div
                  key={s._id}
                  onClick={() => setSelected(s)}
                  className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-4 space-y-3 cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">
                      {s.business?.owner?.name}
                    </span>
                    {statusBadge()}
                  </div>

                  <div className="text-sm">{s.business?.name}</div>

                  <div className="text-sm">Reference: {s.reference}</div>

                  <div className="text-sm">
                    Started{" "}
                    {new Date(
                      s.startedAt || s.createdAt
                    ).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden lg:block bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border dark:border-darkBorder">
                <tr className="text-left text-secondaryText">
                  <th className="px-6 py-3">Vendor</th>
                  <th className="px-6 py-3">Business</th>
                  <th className="px-6 py-3">Reference</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((s) => {
                  const statusBadge = () => {
                    if (s.status === "active") {
                      return (
                        <span className="text-green-600 text-xs font-medium">
                          Active
                        </span>
                      );
                    }
                    return (
                      <span className="text-yellow-600 text-xs font-medium">
                        Inactive
                      </span>
                    );
                  };

                  return (
                    <tr
                      key={s._id}
                      onClick={() => setSelected(s)}
                      className="border-b border-border dark:border-darkBorder hover:bg-muted/40 dark:hover:bg-darkSurface/60 transition cursor-pointer"
                    >
                      <td className="px-6 py-3 font-medium">
                        {s.business?.owner?.name}
                      </td>

                      <td className="px-6 py-3">{s.business?.name}</td>

                      <td className="px-6 py-3">{s.reference}</td>

                      <td className="px-6 py-3">
                        {new Date(
                          s.startedAt || s.createdAt
                        ).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-3">{statusBadge()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-lg border border-border dark:border-darkBorder disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-sm font-medium">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg border border-border dark:border-darkBorder disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold">Subscription Details</h2>

                <button onClick={() => setSelected(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondaryText">Vendor</span>
                  <span>{selected.business?.owner?.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-secondaryText">Business</span>
                  <span>{selected.business?.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-secondaryText">Plan</span>
                  <span className="capitalize">{selected.plan}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-secondaryText">Price</span>
                  <span>₦{selected.price?.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-secondaryText">Billing Cycle</span>
                  <span className="capitalize">
                    {selected.billingCycle}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-secondaryText">Reference</span>
                  <span>{selected.reference}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-secondaryText">Status</span>
                  <span
                    className={
                      selected.status === "active"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }
                  >
                    {selected.status}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-secondaryText">Started</span>
                  <span>
                    {selected.startedAt &&
                      new Date(selected.startedAt).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-secondaryText">Expires</span>
                  <span>
                    {selected.expiresAt &&
                      new Date(selected.expiresAt).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-secondaryText">
                    Next Billing
                  </span>
                  <span>
                    {selected.nextBillingDate &&
                      new Date(
                        selected.nextBillingDate
                      ).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}