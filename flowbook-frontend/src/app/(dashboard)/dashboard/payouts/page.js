"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import { toast } from "sonner";
import { getPayouts, withdraw } from "@/services/payout.service";
import { getBusiness } from "@/services/business.service";

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selected, setSelected] = useState(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [expiresAt, setExpiresAt] = useState(null);

  const isSubscriptionActive =
    subscriptionStatus === "active" &&
    expiresAt &&
    new Date(expiresAt) > new Date();

  const fetchBusiness = async () => {
    try {
      const data = await getBusiness();
      setSubscriptionStatus(data.subscriptionStatus || "free");
      setExpiresAt(data.subscriptionExpiresAt || null);
    } catch {}
  };

  const fetchPayouts = async () => {
    try {
      const data = await getPayouts();
      setPayouts(data.payouts || []);
      setAvailableBalance(data.availableBalance || 0);
      setTotalRevenue(data.totalRevenue || 0);
    } catch {
      toast.error("Failed to load payouts");
    }
  };

  useEffect(() => {
    fetchPayouts();
    fetchBusiness();
  }, []);

  const handleWithdraw = async () => {
    if (!isSubscriptionActive) {
      toast.error("Subscription inactive. Renew to withdraw funds.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    try {
      setLoading(true);
      await withdraw(Number(amount));
      toast.success("Withdrawal successful");
      setWithdrawOpen(false);
      setAmount("");
      fetchPayouts();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Amount", "Reference", "Status", "Date"];

    const rows = payouts.map((p) => [
      p.amount,
      p.reference,
      p.status,
      new Date(p.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) => row.map((field) => '"' + field + '"').join(","))
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "payout-history.csv";
    link.click();
  };

  const lastPaid = payouts.find((p) => p.status === "success");

  const statusStyle = (status) =>
    status === "success"
      ? "bg-success/10 text-success"
      : status === "pending"
        ? "bg-warning/10 text-warning"
        : "bg-danger/10 text-danger";

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Payouts</h2>

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (!isSubscriptionActive) {
                toast.error("Subscription inactive. Renew to withdraw funds.");
                return;
              }
              setWithdrawOpen(true);
            }}
            disabled={!isSubscriptionActive}
            className="bg-accent text-white px-4 py-2 rounded-md text-sm hover:bg-accent/90 disabled:opacity-50"
          >
            Withdraw
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 border border-border dark:border-darkBorder px-4 py-2 rounded-md text-sm"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 shadow-soft space-y-3"
        >
          <p className="text-sm text-secondaryText">Available Balance</p>

          <p className="text-2xl font-bold">
            ₦{availableBalance.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 shadow-soft space-y-3"
        >
          <p className="text-sm text-secondaryText">Total Revenue</p>

          <p className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 shadow-soft space-y-3"
        >
          <p className="text-sm text-secondaryText">Last Payout</p>

          <p className="text-base font-medium">
            {lastPaid ? new Date(lastPaid.createdAt).toLocaleDateString() : "—"}
          </p>
        </motion.div>
      </div>

      <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-border dark:border-darkBorder text-sm font-medium">
          Payout History
        </div>

        <div className="hidden md:block">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-secondaryText border-b border-border dark:border-darkBorder">
              <tr>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {payouts.map((p) => (
                <tr
                  key={p._id}
                  onClick={() => setSelected(p)}
                  className="border-b border-border dark:border-darkBorder hover:bg-muted dark:hover:bg-darkSurface/60 cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium">
                    ₦{p.amount.toLocaleString()}
                  </td>

                  <td className="px-6 py-4">{p.reference}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(p.status)}`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {withdrawOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              className="bg-white dark:bg-darkSurface rounded-xl p-6 w-full max-w-md space-y-4"
            >
              <h3 className="text-lg font-semibold">Withdraw Funds</h3>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border border-border dark:border-darkBorder rounded-md px-3 py-2 text-sm bg-white dark:bg-darkSurface text-black dark:text-white"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setWithdrawOpen(false)}
                  className="px-4 py-2 border border-border dark:border-darkBorder rounded-md text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="px-4 py-2 bg-accent text-white rounded-md text-sm"
                >
                  {loading ? "Processing..." : "Withdraw"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
