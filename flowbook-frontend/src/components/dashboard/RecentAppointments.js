"use client";

import { useState } from "react";
import { X, Clock } from "lucide-react";

export default function RecentAppointments({ appointments }) {
  const [selected, setSelected] = useState(null);

  const formatCurrency = (amount) => {
    if (!amount) return "₦0";
    return `₦${amount.toLocaleString()}`;
  };

  const formatTime = (time) => {
    if (!time) return "Not specified";

    const date = new Date(`1970-01-01T${time}`);

    return date.toLocaleTimeString("en-NG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const upcomingToday = appointments?.filter((item) => {
    const now = new Date();
    const bookingDateTime = new Date(`${item.date} ${item.time}`);
    return bookingDateTime > now;
  });

  if (!appointments || appointments.length === 0) {
    return (
      <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 shadow-soft">
        <p className="text-sm text-secondaryText dark:text-gray-400">
          No recent appointments
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 shadow-soft">
          <h3 className="text-sm font-semibold text-primaryText dark:text-white mb-6">
            Today's Schedule
          </h3>

          <div className="space-y-4">
            {(upcomingToday || []).slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-secondaryText dark:text-gray-400 min-w-[90px]">
                  <Clock size={14} />
                  {formatTime(item.time)}
                </div>

                <div className="flex-1 h-px bg-border dark:bg-darkBorder"></div>

                <div className="text-sm font-medium text-primaryText dark:text-white">
                  {item.service}
                </div>
              </div>
            ))}

            {(!upcomingToday || upcomingToday.length === 0) && (
              <p className="text-xs text-secondaryText dark:text-gray-400">
                No upcoming appointments today
              </p>
            )}
          </div>
        </div>

        <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 shadow-soft">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-primaryText dark:text-white">
              Recent Appointments
            </h3>
          </div>

          <div className="space-y-3">
            {appointments.map((item, index) => (
              <div
                key={index}
                onClick={() => setSelected(item)}
                className="flex justify-between items-center p-3 rounded-lg cursor-pointer transition hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <div>
                  <p className="font-medium text-primaryText dark:text-white">
                    {item.service}
                  </p>

                  <p className="text-xs text-secondaryText dark:text-gray-400">
                    {item.date} • {formatTime(item.time)}
                  </p>
                </div>

                <span className="font-medium text-accent">
                  {formatCurrency(item.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6">
          <div className="relative w-full max-w-lg max-h-[85vh] bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl shadow-xl flex flex-col">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 p-2 rounded-md text-secondaryText dark:text-gray-400 hover:text-primaryText dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>

            <div className="px-6 pt-6 pb-2">
              <h3 className="text-lg font-semibold text-primaryText dark:text-white">
                Appointment Details
              </h3>
            </div>

            <div className="px-6 pb-6 overflow-y-auto custom-scroll space-y-4 text-sm">
              <div className="flex justify-between items-start gap-4">
                <span className="text-secondaryText dark:text-gray-400">
                  Service
                </span>
                <span className="font-medium text-primaryText dark:text-white text-right">
                  {selected.service}
                </span>
              </div>

              <div className="flex justify-between items-start gap-4">
                <span className="text-secondaryText dark:text-gray-400">
                  Date
                </span>
                <span className="text-primaryText dark:text-white text-right">
                  {selected.date}
                </span>
              </div>

              <div className="flex justify-between items-start gap-4">
                <span className="text-secondaryText dark:text-gray-400">
                  Time
                </span>
                <span className="text-primaryText dark:text-white text-right">
                  {formatTime(selected.time)}
                </span>
              </div>

              <div className="flex justify-between items-start gap-4">
                <span className="text-secondaryText dark:text-gray-400">
                  Customer
                </span>
                <span className="text-primaryText dark:text-white text-right">
                  {selected.customerName || "—"}
                </span>
              </div>

              <div className="flex justify-between items-start gap-4">
                <span className="text-secondaryText dark:text-gray-400">
                  Phone
                </span>
                <span className="text-primaryText dark:text-white text-right">
                  {selected.customerPhone || "—"}
                </span>
              </div>

              <div className="flex justify-between items-start gap-4">
                <span className="text-secondaryText dark:text-gray-400">
                  Price
                </span>
                <span className="font-medium text-accent text-right">
                  {formatCurrency(selected.price)}
                </span>
              </div>

              {selected.notes && (
                <div className="pt-4 border-t border-border dark:border-darkBorder">
                  <p className="text-xs text-secondaryText dark:text-gray-400 mb-1">
                    Customer Note
                  </p>
                  <p className="text-sm text-primaryText dark:text-white leading-relaxed">
                    {selected.notes}
                  </p>
                </div>
              )}

              {selected.ownerMessage && (
                <div className="pt-4 border-t border-border dark:border-darkBorder">
                  <p className="text-xs text-secondaryText dark:text-gray-400 mb-1">
                    Owner Message
                  </p>
                  <p className="text-sm text-primaryText dark:text-white leading-relaxed whitespace-pre-line">
                    {selected.ownerMessage}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
