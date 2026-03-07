"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
  const [calendarView, setCalendarView] = useState("day");
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [expiresAt, setExpiresAt] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const scrollRef = useRef(null);

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
    const interval = setInterval(fetchBookings, 8000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const matchesSearch =
        a.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.customerName?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || a.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const groupedByDay = useMemo(() => {
    const map = {};

    filtered.forEach((booking) => {
      const day = new Date(booking.date).toLocaleDateString();

      if (!map[day]) map[day] = [];

      map[day].push(booking);
    });

    return map;
  }, [filtered]);

  const todayStats = useMemo(() => {
    const today = new Date().toLocaleDateString();

    const todayBookings = appointments.filter(
      (b) => new Date(b.date).toLocaleDateString() === today,
    );

    const completedToday = todayBookings.filter(
      (b) => b.status === "completed",
    );

    const pendingToday = todayBookings.filter((b) => b.status === "pending");

    const upcoming = appointments.filter((b) => new Date(b.date) > new Date());

    return {
      todayBookings,
      completedToday,
      pendingToday,
      upcoming,
    };
  }, [appointments]);

  const todaysSchedule = useMemo(() => {
    const today = new Date().toLocaleDateString();

    return appointments
      .filter((b) => new Date(b.date).toLocaleDateString() === today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [appointments]);

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

  const timeSlots = useMemo(() => {
    const slots = [];

    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = String(h).padStart(2, "0");
        const min = String(m).padStart(2, "0");
        slots.push(`${hour}:${min}`);
      }
    }

    return slots;
  }, []);

  const getWeekDays = () => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }

    return days;
  };

  const goToNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const goToPrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

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

  const scrollToCurrentTime = () => {
    if (!scrollRef.current) return;

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    const slotIndex = hour * 2 + (minute >= 30 ? 1 : 0);

    const scrollPosition = slotIndex * 64;

    scrollRef.current.scrollTop = scrollPosition - 200;
  };

  useEffect(() => {
    if (viewMode === "calendar" && calendarView === "day") {
      setTimeout(scrollToCurrentTime, 200);
    }
  }, [viewMode, calendarView]);

  const getBookingsForSlot = (slot, date) => {
    return filtered.filter((b) => {
      const d = new Date(b.date);

      const slotHour = slot.split(":")[0];
      const slotMin = slot.split(":")[1];

      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");

      const sameTime = `${h}:${m}` === `${slotHour}:${slotMin}`;
      const sameDay = d.toLocaleDateString() === date.toLocaleDateString();

      return sameTime && sameDay;
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-4">
          <p className="text-xs text-secondaryText">Today Bookings</p>
          <p className="text-xl font-semibold">
            {todayStats.todayBookings.length}
          </p>
        </div>

        <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-4">
          <p className="text-xs text-secondaryText">Completed Today</p>
          <p className="text-xl font-semibold">
            {todayStats.completedToday.length}
          </p>
        </div>

        <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-4">
          <p className="text-xs text-secondaryText">Pending</p>
          <p className="text-xl font-semibold">
            {todayStats.pendingToday.length}
          </p>
        </div>

        <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-4">
          <p className="text-xs text-secondaryText">Upcoming</p>
          <p className="text-xl font-semibold">{todayStats.upcoming.length}</p>
        </div>
      </div>

      <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">Today's Schedule</h3>

        {todaysSchedule.length > 0 ? (
          <div className="space-y-2">
            {todaysSchedule.map((b) => {
              const d = new Date(b.date);

              return (
                <div
                  key={b._id}
                  onClick={() => setSelected(b)}
                  className="flex justify-between items-center text-sm hover:bg-muted dark:hover:bg-darkSurface/60 rounded-md px-2 py-2 cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{b.service?.name}</p>

                    <p className="text-xs text-secondaryText">
                      {b.customerName}
                    </p>
                  </div>

                  <span className="text-xs">
                    {d.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-secondaryText">No bookings today</p>
        )}
      </div>
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

          {viewMode === "calendar" && (
            <div className="flex gap-2">
              <button
                onClick={() => setCalendarView("day")}
                className={`px-4 py-2 text-sm rounded-md border ${
                  calendarView === "day" ? "bg-accent text-white" : ""
                }`}
              >
                Day
              </button>

              <button
                onClick={() => setCalendarView("week")}
                className={`px-4 py-2 text-sm rounded-md border ${
                  calendarView === "week" ? "bg-accent text-white" : ""
                }`}
              >
                Week
              </button>
            </div>
          )}
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

      {viewMode === "calendar" && calendarView === "day" && (
        <div
          ref={scrollRef}
          className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl overflow-y-auto custom-scroll max-h-[75vh]"
        >
          {timeSlots.map((slot) => {
            const bookings = filtered.filter((b) => {
              const d = new Date(b.date);

              const h = String(d.getHours()).padStart(2, "0");
              const m = String(d.getMinutes()).padStart(2, "0");

              return `${h}:${m}` === slot;
            });

            return (
              <div
                key={slot}
                className="flex border-b border-border dark:border-darkBorder px-6 py-4 items-start"
              >
                <div className="w-20 text-sm text-secondaryText">{slot}</div>

                <div className="flex-1 space-y-2">
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <div
                        key={booking._id}
                        onClick={() => setSelected(booking)}
                        className="bg-accent/10 text-accent rounded-md px-3 py-2 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {booking.service?.name}
                          </p>

                          <p className="text-xs text-secondaryText">
                            {booking.customerName}
                          </p>
                        </div>

                        <span
                          className={`px-2 py-1 rounded-full text-xs ${statusStyle(
                            booking.status,
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-secondaryText">—</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {viewMode === "calendar" && calendarView === "week" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevWeek}
              className="px-3 py-1 text-sm border rounded-md hover:bg-muted dark:hover:bg-darkSurface/60"
            >
              Prev
            </button>

            <p className="text-sm font-medium">
              Week of {getWeekDays()[0].toLocaleDateString()}
            </p>

            <button
              onClick={goToNextWeek}
              className="px-3 py-1 text-sm border rounded-md hover:bg-muted dark:hover:bg-darkSurface/60"
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-8 border border-border dark:border-darkBorder rounded-xl overflow-hidden">
            <div className="bg-muted dark:bg-darkSurface border-r border-border dark:border-darkBorder">
              {timeSlots.map((slot) => (
                <div
                  key={slot}
                  className="h-16 flex items-start justify-end pr-2 text-xs text-secondaryText border-b border-border dark:border-darkBorder"
                >
                  {slot}
                </div>
              ))}
            </div>

            {getWeekDays().map((day) => (
              <div
                key={day.toISOString()}
                className="border-r border-border dark:border-darkBorder"
              >
                <div className="text-center text-xs py-2 border-b border-border dark:border-darkBorder bg-muted dark:bg-darkSurface">
                  {day.toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                  })}
                </div>

                {timeSlots.map((slot) => {
                  const bookings = getBookingsForSlot(slot, day);

                  return (
                    <div
                      key={slot}
                      className="h-16 border-b border-border dark:border-darkBorder relative"
                    >
                      {bookings.map((booking) => (
                        <div
                          key={booking._id}
                          onClick={() => setSelected(booking)}
                          className="absolute inset-1 bg-accent/10 text-accent rounded-md p-2 cursor-pointer flex flex-col justify-between"
                        >
                          <span className="text-[11px] font-medium leading-tight">
                            {booking.service?.name}
                          </span>

                          <span className="text-[10px] text-secondaryText">
                            {booking.customerName}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-start md:items-center justify-center z-50 px-4 py-8 overflow-y-auto custom-scroll">
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
        <div className="fixed inset-0 bg-black/40 flex items-start md:items-center justify-center z-50 p-4 overflow-y-auto custom-scroll">
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
