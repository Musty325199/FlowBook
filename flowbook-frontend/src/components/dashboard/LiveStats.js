"use client";

import { CalendarDays, Clock, Wallet, Users } from "lucide-react";

export default function LiveStats({ data }) {
  const formatCurrency = (amount) => {
    if (!amount) return "₦0";
    return `₦${amount.toLocaleString()}`;
  };

  const todayAppointments = data?.recentAppointments?.length || 0;

  const nextAppointment = data?.recentAppointments?.[0];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

      <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CalendarDays size={18} className="text-indigo-500" />
          <div>
            <p className="text-xs text-secondaryText">
              Today's Bookings
            </p>
            <p className="font-semibold text-lg">
              {todayAppointments}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-green-500" />
          <div>
            <p className="text-xs text-secondaryText">
              Next Appointment
            </p>
            <p className="font-semibold text-sm">
              {nextAppointment
                ? `${nextAppointment.time}`
                : "None"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Wallet size={18} className="text-purple-500" />
          <div>
            <p className="text-xs text-secondaryText">
              Revenue Today
            </p>
            <p className="font-semibold text-lg">
              {formatCurrency(data?.revenueThisWeek)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Users size={18} className="text-orange-500" />
          <div>
            <p className="text-xs text-secondaryText">
              Customers
            </p>
            <p className="font-semibold text-lg">
              {todayAppointments}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}