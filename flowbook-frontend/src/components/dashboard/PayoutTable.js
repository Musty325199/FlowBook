export default function PayoutTable({ payouts }) {
  const exportCSV = () => {
    const headers = ["Period", "Revenue", "Refunds", "Net", "Status"];

    const rows = payouts.map((p) => [
      p.period,
      p.revenue,
      p.refunds,
      p.net,
      p.status
    ]);

    const csv =
      "\uFEFF" +
      [headers, ...rows]
        .map((r) => r.join(","))
        .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "payout-history.csv";
    link.click();
  };

  if (!payouts || payouts.length === 0) {
    return (
      <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 shadow-soft">
        <p className="text-sm text-secondaryText">
          No payout records yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 shadow-soft">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold">Payout History</h3>

        <button
          onClick={exportCSV}
          className="text-xs px-3 py-1.5 rounded-md bg-accent text-white hover:opacity-90 transition"
        >
          Export CSV
        </button>
      </div>

      <div className="space-y-3">
        {payouts.map((p, i) => (
          <div
            key={i}
            className="flex justify-between items-center border-b border-border pb-3 text-sm"
          >
            <span>{p.period}</span>

            <span className="font-medium">
              ₦{p.net.toLocaleString()}
            </span>

            <span
              className={`text-xs px-2 py-1 rounded-full ${
                p.status === "paid"
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}