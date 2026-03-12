"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";
import {
  getPayouts,
  approvePayout,
  rejectPayout,
} from "@/services/admin.service";

import {
  Wallet,
  Search,
  DollarSign,
  TrendingUp,
  Clock,
  CalendarDays,
  Store,
  ChevronLeft,
  ChevronRight
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

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const perPage = 10;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0
    }).format(amount || 0);

  const fetchPayouts = async () => {
    try {
      const data = await getPayouts();
      setPayouts(data || []);
    } catch {
      toast.error("Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await approvePayout(id);
      toast.success("Payout approved");
      fetchPayouts();
    } catch {
      toast.error("Failed to approve payout");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(id);
      await rejectPayout(id);
      toast.success("Payout rejected");
      fetchPayouts();
    } catch {
      toast.error("Failed to reject payout");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = useMemo(() => {
    let data = [...payouts];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.business?.owner?.name?.toLowerCase().includes(q) ||
          p.business?.name?.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((p) => p.status === statusFilter);
    }

    return data;
  }, [payouts, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const summary = useMemo(() => {
    let total = 0;
    let pending = 0;
    let paid = 0;

    payouts.forEach((p) => {
      total += p.amount;
      if (p.status === "pending") pending += p.amount;
      if (p.status === "paid") paid += p.amount;
    });

    return {
      total,
      pending,
      paid,
    };
  }, [payouts]);

  const chartData = useMemo(() => {
    const map = {};

    payouts.forEach((p) => {
      const date = new Date(p.createdAt).toLocaleDateString("en-NG", {
        month: "short",
      });

      if (!map[date]) map[date] = 0;

      map[date] += p.amount;
    });

    return Object.keys(map).map((k) => ({
      month: k,
      amount: map[k],
    }));
  }, [payouts]);

  return (
    <AdminLayout>

      <div className="flex items-center gap-3 mt-3 mb-8">
        <Wallet className="text-accent" size={20} />
        <h1 className="text-lg font-semibold tracking-tight">
          Vendor Payouts
        </h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-secondaryText">Total Payouts</p>
            <p className="text-2xl font-semibold mt-1">
              {formatCurrency(summary.total)}
            </p>
          </div>

          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <DollarSign size={18} className="text-accent" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-secondaryText">Pending Payouts</p>
            <p className="text-2xl font-semibold mt-1">
              {formatCurrency(summary.pending)}
            </p>
          </div>

          <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <Clock size={18} className="text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-secondaryText">Paid Out</p>
            <p className="text-2xl font-semibold mt-1">
              {formatCurrency(summary.paid)}
            </p>
          </div>

          <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <TrendingUp size={18} className="text-green-500" />
          </div>
        </motion.div>

      </div>

      <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 mb-8">

        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={16} />
          <h2 className="text-sm font-semibold">Payout History</h2>
        </div>

        <div className="h-64">

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>

              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

              <XAxis dataKey="month" />

              <YAxis tickFormatter={(v)=>formatCurrency(v)} />

              <Tooltip formatter={(v)=>formatCurrency(v)} />

              <Line
                type="monotone"
                dataKey="amount"
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
            placeholder="Search vendor or business..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-darkBorder bg-background dark:bg-darkBackground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "paid"].map((status) => {
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
          No payouts found
        </div>
      )}

      {!loading && paginated.length > 0 && (
        <>
          <div className="lg:hidden space-y-4">
            {paginated.map((p) => {
              const statusBadge = () => {
                if (p.status === "pending") {
                  return (
                    <span className="text-yellow-600 text-xs font-medium">
                      Pending
                    </span>
                  );
                }

                if (p.status === "paid") {
                  return (
                    <span className="text-green-600 text-xs font-medium">
                      Paid
                    </span>
                  );
                }

                return <span className="text-xs">{p.status}</span>;
              };

              return (
                <div
                  key={p._id}
                  className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">
                      {p.business?.owner?.name}
                    </span>

                    {statusBadge()}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Store size={14} />
                    {p.business?.name}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={14} />
                    {formatCurrency(p.amount)}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays size={14} />
                    {new Date(p.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>

                  {p.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleApprove(p._id)}
                        disabled={actionLoading === p._id}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs rounded-md bg-green-500 text-white"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(p._id)}
                        disabled={actionLoading === p._id}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs rounded-md bg-red-500 text-white"
                      >
                        Reject
                      </button>
                    </div>
                  )}
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
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((p) => {
                  const statusBadge = () => {
                    if (p.status === "pending") {
                      return (
                        <span className="text-yellow-600 text-xs font-medium">
                          Pending
                        </span>
                      );
                    }

                    if (p.status === "paid") {
                      return (
                        <span className="text-green-600 text-xs font-medium">
                          Paid
                        </span>
                      );
                    }

                    return <span className="text-xs">{p.status}</span>;
                  };

                  return (
                    <tr
                      key={p._id}
                      className="border-b border-border dark:border-darkBorder hover:bg-muted/40 dark:hover:bg-darkSurface/60 transition"
                    >
                      <td className="px-6 py-3 font-medium">
                        {p.business?.owner?.name}
                      </td>

                      <td className="px-6 py-3">{p.business?.name}</td>

                      <td className="px-6 py-3">
                        {formatCurrency(p.amount)}
                      </td>

                      <td className="px-6 py-3">
                        {new Date(p.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-3">{statusBadge()}</td>

                      <td className="px-6 py-3 flex justify-end gap-2">
                        {p.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(p._id)}
                              disabled={actionLoading === p._id}
                              className="px-2 py-1 text-xs rounded-md bg-green-500 text-white"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => handleReject(p._id)}
                              disabled={actionLoading === p._id}
                              className="px-2 py-1 text-xs rounded-md bg-red-500 text-white"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
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
    </AdminLayout>
  );
}