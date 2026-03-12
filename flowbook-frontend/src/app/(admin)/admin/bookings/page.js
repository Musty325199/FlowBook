"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";
import { getBookings } from "@/services/admin.service";
import {
  Search,
  CalendarDays,
  Store,
  User,
  Scissors,
  ListFilter,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  XCircle
} from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadBookings = async () => {
    try {
      const data = await getBookings();
      setBookings(data || []);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filtered = useMemo(() => {
    let data = bookings;

    if (search) {
      const q = search.toLowerCase();

      data = data.filter((b) =>
        b.customerName?.toLowerCase().includes(q) ||
        b.customerEmail?.toLowerCase().includes(q) ||
        b.business?.name?.toLowerCase().includes(q) ||
        b.service?.name?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((b) => b.status === statusFilter);
    }

    return data;
  }, [bookings, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const statusBadge = (status) => {
    if (status === "pending")
      return <span className="text-yellow-600 text-[11px] font-medium">Pending</span>;

    if (status === "confirmed")
      return <span className="text-blue-600 text-[11px] font-medium">Confirmed</span>;

    if (status === "completed")
      return <span className="text-green-600 text-[11px] font-medium">Completed</span>;

    if (status === "cancelled")
      return <span className="text-red-500 text-[11px] font-medium">Cancelled</span>;

    return <span className="text-[11px]">{status}</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const statuses = [
    { value: "all", label: "All", icon: ListFilter },
    { value: "pending", label: "Pending", icon: Clock3 },
    { value: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { value: "completed", label: "Completed", icon: CheckCircle2 },
    { value: "cancelled", label: "Cancelled", icon: XCircle }
  ];

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mt-3 mb-7">
        <ClipboardList className="text-accent" size={20} />
        <h1 className="text-lg font-semibold tracking-tight">Bookings</h1>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        <div className="relative w-full lg:w-[320px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondaryText"
          />

          <input
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-darkBorder bg-background dark:bg-darkBackground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {statuses.map((s) => {
            const Icon = s.icon;
            const active = statusFilter === s.value;

            return (
              <motion.button
                key={s.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setPage(1);
                  setStatusFilter(s.value);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition
                ${active
                    ? "bg-accent text-white border-accent"
                    : "border-border dark:border-darkBorder hover:bg-muted/40 dark:hover:bg-darkSurface"
                  }`}
              >
                <Icon size={12} />
                {s.label}
              </motion.button>
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
        <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-2xl p-12 text-center">
          No bookings found
        </div>
      )}

      {!loading && paginated.length > 0 && (
        <>
          <div className="lg:hidden space-y-4">

            {paginated.map((b) => (
              <div
                key={b._id}
                className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-2xl p-4 space-y-4"
              >

                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">
                    {b.customerName}
                  </div>
                  {statusBadge(b.status)}
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm">

                  <div className="flex items-center gap-2">
                    <Store size={14} />
                    {b.business?.name}
                  </div>

                  <div className="flex items-center gap-2">
                    <Scissors size={14} />
                    {b.service?.name}
                  </div>

                  <div className="flex items-center gap-2">
                    <User size={14} />
                    {b.customerEmail}
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} />
                    {formatDate(b.date)} • {formatTime(b.date)}
                  </div>

                </div>

              </div>
            ))}

          </div>

          <div className="hidden lg:block bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-2xl">

            <table className="w-full table-fixed text-xs">

              <thead className="border-b border-border dark:border-darkBorder">
                <tr className="text-left text-secondaryText">
                  <th className="px-4 py-3 w-[14%] font-medium">Customer</th>
                  <th className="px-4 py-3 w-[18%] font-medium">Business</th>
                  <th className="px-4 py-3 w-[18%] font-medium">Service</th>
                  <th className="px-4 py-3 w-[22%] font-medium">Email</th>
                  <th className="px-4 py-3 w-[10%] font-medium">Date</th>
                  <th className="px-4 py-3 w-[8%] font-medium">Time</th>
                  <th className="px-4 py-3 w-[10%] font-medium">Status</th>
                </tr>
              </thead>

              <tbody>

                {paginated.map((b) => (
                  <tr
                    key={b._id}
                    className="border-b border-border dark:border-darkBorder hover:bg-muted/40 dark:hover:bg-darkSurface/60 transition"
                  >

                    <td className="px-4 py-3 truncate font-medium">
                      {b.customerName}
                    </td>

                    <td className="px-4 py-3 truncate">
                      {b.business?.name}
                    </td>

                    <td className="px-4 py-3 truncate">
                      {b.service?.name}
                    </td>

                    <td className="px-4 py-3 truncate">
                      {b.customerEmail}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(b.date)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatTime(b.date)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {statusBadge(b.status)}
                    </td>

                  </tr>
                ))}

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