"use client";

import { useEffect, useState } from "react";
import { getDashboardSummary } from "@/services/dashboard.service";

import StatsCards from "@/components/dashboard/StatsCards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentAppointments from "@/components/dashboard/RecentAppointments";
import PayoutTable from "@/components/dashboard/PayoutTable";

import Spinner from "@/components/ui/Spinner";
import LiveStats from "@/components/dashboard/LiveStats";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await getDashboardSummary();
        setData(res);
      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-sm text-secondaryText">
          Track your business performance.
        </p>
      </div>

      <LiveStats data={data} />

      <StatsCards data={data} />

      <RevenueChart data={data.weeklyRevenue} />

      <RecentAppointments appointments={data.recentAppointments} />

      <PayoutTable payouts={data.payoutHistory} />
    </div>
  );
}
