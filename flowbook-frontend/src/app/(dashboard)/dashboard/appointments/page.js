"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ChevronDown,
  X,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import {
  getBookings,
  updateBookingStatus,
  sendBookingMessage,
} from "@/services/bookings.service";
import { getBusiness } from "@/services/business.service";
import Spinner from "@/components/ui/Spinner";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openFilter, setOpenFilter] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmStatus, setConfirmStatus] = useState(null);
  const [ownerMessage, setOwnerMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [expiresAt, setExpiresAt] = useState(null);

  const isSubscriptionActive =
    subscriptionStatus === "active" &&
    expiresAt &&
    new Date(expiresAt) > new Date();

  const fetchBookings = async () => {
    try {
      const data = await getBookings();
      setAppointments(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchBusiness = async () => {
    try {
      const data = await getBusiness();
      setSubscriptionStatus(data.subscriptionStatus || "free");
      setExpiresAt(data.subscriptionExpiresAt || null);
    } catch {}
  };

  useEffect(() => {
    fetchBookings();
    fetchBusiness();
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, []);

  const requestStatusUpdate = (status) => {
    if (!isSubscriptionActive) {
      toast.error("Subscription inactive. Renew to manage bookings.");
      return;
    }
    setConfirmStatus(status);
  };

  const handleStatusUpdate = async () => {
    if (!selected || !confirmStatus) return;

    if (!isSubscriptionActive) {
      toast.error("Subscription inactive. Renew to manage bookings.");
      return;
    }

    try {
      const id = selected._id;
      const status = confirmStatus;

      await updateBookingStatus(id, status);

      setAppointments((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b)),
      );

      setConfirmStatus(null);
      setSelected(null);

      toast.success("Booking status updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update booking status");
    }
  };

  const handleSendMessage = async () => {
    if (!selected || !ownerMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!isSubscriptionActive) {
      toast.error("Subscription inactive. Renew to manage bookings.");
      return;
    }

    try {
      setSendingMessage(true);

      await sendBookingMessage(selected._id, ownerMessage);

      toast.success("Instructions sent to customer");

      setOwnerMessage("");
      setSelected(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const matchesSearch =
        a.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.customerName?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || a.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const statusStyle = (status) =>
    status === "confirmed"
      ? "bg-accent/10 text-accent"
      : status === "completed"
        ? "bg-success/10 text-success"
        : status === "cancelled"
          ? "bg-danger/10 text-danger"
          : "bg-muted text-secondaryText";

  const statusButtonStyle = (status) => {
    if (status === "confirmed") return "bg-accent text-white";
    if (status === "completed") return "bg-success text-white";
    return "bg-danger text-white";
  };

  const disabledStyle = "opacity-50 cursor-not-allowed";

  const groupedByDay = useMemo(() => {
    const map = {};

    filtered.forEach((booking) => {
      const day = new Date(booking.date).toLocaleDateString();

      if (!map[day]) map[day] = [];

      map[day].push(booking);
    });

    return map;
  }, [filtered]);
  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays size={22} />
          <h2 className="text-2xl font-bold tracking-tight">Appointments</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search service or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-surface dark:bg-darkSurface text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <div className="relative">
            <button
              onClick={() => setOpenFilter(!openFilter)}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-surface dark:bg-darkSurface text-sm hover:bg-muted dark:hover:bg-darkSurface/60 transition cursor-pointer"
            >
              {statusFilter === "all"
                ? "All Status"
                : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}

              <ChevronDown size={16} />
            </button>

            {openFilter && (
              <div className="absolute right-0 mt-2 w-44 bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-md shadow-soft text-sm z-20">
                {["all", "pending", "confirmed", "completed", "cancelled"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setOpenFilter(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-muted dark:hover:bg-darkSurface/60 transition cursor-pointer"
                    >
                      {status === "all"
                        ? "All Status"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-sm rounded-md border ${
                viewMode === "list" ? "bg-accent text-white" : ""
              } cursor-pointer`}
            >
              List
            </button>

            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 text-sm rounded-md border ${
                viewMode === "calendar" ? "bg-accent text-white" : ""
              } cursor-pointer`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {viewMode === "list" && (
        <>
          <div className="hidden md:block bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl shadow-soft">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border dark:border-darkBorder text-left text-xs uppercase tracking-wide text-secondaryText">
                <tr>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center">
                      <Spinner size={28} />
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((a) => (
                    <tr
                      key={a._id}
                      onClick={() => setSelected(a)}
                      className="border-b border-border dark:border-darkBorder hover:bg-muted dark:hover:bg-darkSurface/60 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-medium">
                        {a.service?.name}
                      </td>

                      <td className="px-6 py-4 text-secondaryText">
                        {a.customerName}
                      </td>

                      <td className="px-6 py-4 text-secondaryText">
                        {new Date(a.date).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(
                            a.status,
                          )}`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-16 text-center text-sm text-secondaryText"
                    >
                      No appointments match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <Spinner size={32} />
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((a) => (
                <div
                  key={a._id}
                  onClick={() => setSelected(a)}
                  className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-5 shadow-soft space-y-3 cursor-pointer"
                >
                  <div className="flex justify-between">
                    <p className="font-medium">{a.service?.name}</p>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(
                        a.status,
                      )}`}
                    >
                      {a.status}
                    </span>
                  </div>

                  <p className="text-sm text-secondaryText">{a.customerName}</p>

                  <p className="text-sm text-secondaryText">
                    {new Date(a.date).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-sm text-secondaryText">
                No appointments found.
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === "calendar" && (
        <div className="space-y-6">
          {Object.keys(groupedByDay).length === 0 ? (
            <div className="text-center py-24 text-secondaryText">
              No bookings available.
            </div>
          ) : (
            Object.entries(groupedByDay).map(([day, bookings]) => (
              <div
                key={day}
                className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl shadow-soft"
              >
                <div className="px-6 py-4 border-b border-border dark:border-darkBorder font-semibold">
                  {day}
                </div>

                <div className="divide-y divide-border dark:divide-darkBorder">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id}
                      onClick={() => setSelected(booking)}
                      className="px-6 py-4 flex items-center justify-between hover:bg-muted dark:hover:bg-darkSurface/60 cursor-pointer"
                    >
                      <div>
                        <p className="font-medium">{booking.service?.name}</p>

                        <p className="text-sm text-secondaryText">
                          {booking.customerName}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm">
                          {new Date(booking.date).toLocaleTimeString()}
                        </p>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(
                            booking.status,
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-start md:items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-surface dark:bg-darkSurface w-full max-w-lg rounded-xl shadow-soft p-6 space-y-6 relative my-auto">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-semibold">Appointment Details</h3>

            <div className="space-y-3 text-sm">
              <p>
                <strong>Service:</strong> {selected.service?.name}
              </p>

              <p>
                <strong>Customer:</strong> {selected.customerName}
              </p>

              <p className="flex items-center gap-2">
                <Mail size={14} />
                {selected.customerEmail}
              </p>

              {selected.customerPhone && (
                <p className="flex items-center gap-2">
                  <Phone size={14} />
                  {selected.customerPhone}
                </p>
              )}

              {selected.address && (
                <p className="flex items-center gap-2">
                  <MapPin size={14} />
                  {selected.address}
                </p>
              )}

              {selected.notes && (
                <p className="flex items-start gap-2">
                  <MessageSquare size={14} />
                  {selected.notes}
                </p>
              )}

              <p>
                <strong>Date:</strong>{" "}
                {new Date(selected.date).toLocaleString()}
              </p>

              <div className="pt-4">
                <p className="text-xs font-semibold text-secondaryText mb-3">
                  Booking Progress
                </p>

                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 flex-1 rounded-full ${
                      selected.status !== "pending" ? "bg-accent" : "bg-muted"
                    }`}
                  />

                  <div
                    className={`h-2 flex-1 rounded-full ${
                      selected.status === "confirmed" ||
                      selected.status === "completed"
                        ? "bg-accent"
                        : "bg-muted"
                    }`}
                  />

                  <div
                    className={`h-2 flex-1 rounded-full ${
                      selected.status === "completed"
                        ? "bg-success"
                        : "bg-muted"
                    }`}
                  />
                </div>

                <div className="flex justify-between text-xs text-secondaryText mt-1">
                  <span>Pending</span>
                  <span>Confirmed</span>
                  <span>Completed</span>
                </div>
              </div>

              {selected.status !== "completed" && (
                <div className="flex gap-2 pt-4">
                  <button
                    disabled={
                      !isSubscriptionActive ||
                      selected.status === "confirmed" ||
                      selected.status === "completed"
                    }
                    onClick={() => requestStatusUpdate("confirmed")}
                    className={`px-3 py-1 text-xs rounded-md ${statusButtonStyle(
                      "confirmed",
                    )} ${
                      !isSubscriptionActive || selected.status === "confirmed"
                        ? disabledStyle
                        : "cursor-pointer"
                    }`}
                  >
                    Confirmed
                  </button>

                  <button
                    disabled={
                      !isSubscriptionActive || selected.status === "completed"
                    }
                    onClick={() => requestStatusUpdate("completed")}
                    className={`px-3 py-1 text-xs rounded-md ${statusButtonStyle(
                      "completed",
                    )} ${
                      !isSubscriptionActive || selected.status === "completed"
                        ? disabledStyle
                        : "cursor-pointer"
                    }`}
                  >
                    Completed
                  </button>

                  <button
                    disabled={
                      !isSubscriptionActive ||
                      selected.status === "cancelled" ||
                      selected.status === "completed"
                    }
                    onClick={() => requestStatusUpdate("cancelled")}
                    className={`px-3 py-1 text-xs rounded-md ${statusButtonStyle(
                      "cancelled",
                    )} ${
                      !isSubscriptionActive || selected.status === "cancelled"
                        ? disabledStyle
                        : "cursor-pointer"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="pt-6 space-y-3">
                <h4 className="text-sm font-semibold">Send Instructions</h4>

                <textarea
                  value={ownerMessage}
                  onChange={(e) => setOwnerMessage(e.target.value)}
                  placeholder="Send instructions to the customer..."
                  disabled={!isSubscriptionActive}
                  className="w-full px-3 py-2 border text-black border-border dark:border-darkBorder rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={
                    !isSubscriptionActive ||
                    sendingMessage ||
                    selected.status === "completed"
                  }
                  className={`w-full py-2 text-sm rounded-md bg-accent text-white ${
                    sendingMessage || !isSubscriptionActive
                      ? disabledStyle
                      : "cursor-pointer"
                  }`}
                >
                  {sendingMessage ? <Spinner size={16} /> : "Send Instructions"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmStatus && (
        <div className="fixed inset-0 bg-black/40 flex items-start md:items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-surface dark:bg-darkSurface w-full max-w-lg rounded-xl shadow-soft p-6 space-y-6 relative mt-16 md:mt-0">
            <h3 className="text-lg font-semibold">Confirm Status Change</h3>

            <p className="text-sm text-secondaryText">
              Are you sure you want to mark this booking as {confirmStatus}?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmStatus(null)}
                className="px-4 py-2 text-sm rounded-md border border-border dark:border-darkBorder cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleStatusUpdate}
                disabled={!isSubscriptionActive}
                className={`px-4 py-2 text-sm rounded-md bg-accent text-white ${
                  !isSubscriptionActive ? disabledStyle : "cursor-pointer"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
