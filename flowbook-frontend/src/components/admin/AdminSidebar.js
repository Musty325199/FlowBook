"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, Users, CalendarDays, Wallet, CreditCard, X } from "lucide-react";

const links = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Vendors", href: "/admin/vendors", icon: Users },
  { name: "Bookings", href: "/admin/bookings", icon: CalendarDays },
  { name: "Payouts", href: "/admin/payouts", icon: Wallet },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard }
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();

  return (
    <>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        className={clsx(
          "fixed md:sticky md:top-0 top-0 left-0 z-50 h-screen w-64",
          "bg-surface dark:bg-darkSurface",
          "border-r border-border dark:border-darkBorder",
          "transform transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border dark:border-darkBorder font-semibold">
          FlowBook
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="p-4 space-y-1 text-sm">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                  active
                    ? "bg-accent/10 text-accent font-medium"
                    : "hover:bg-muted dark:hover:bg-darkSurface/60"
                )}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}