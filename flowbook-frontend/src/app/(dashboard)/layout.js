"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { getBusiness } from "@/services/business.service";

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [expiresAt, setExpiresAt] = useState(null);

  const pathname = usePathname();
  const { user, logout } = useAuth();

  const closeTimer = useRef(null);
  const dropdownRef = useRef(null);

  const navItems = [
    { name: "Overview", href: "/dashboard" },
    { name: "Appointments", href: "/dashboard/appointments" },
    { name: "Services", href: "/dashboard/services" },
    { name: "Payouts", href: "/dashboard/payouts" },
    { name: "Settings", href: "/dashboard/settings" },
  ];

  const avatarLetter = useMemo(() => {
    if (!user) return "U";
    if (user.name) return user.name.trim().charAt(0).toUpperCase();
    if (user.business?.name)
      return user.business.name.trim().charAt(0).toUpperCase();
    return "U";
  }, [user]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const userName = useMemo(() => {
    if (!user) return "";
    return user.name?.split(" ")[0] || "";
  }, [user]);

  const businessName = useMemo(() => {
    if (!user) return "";
    if (user.business?.name) return user.business.name;
    if (user.businessName) return user.businessName;
    return "";
  }, [user]);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const data = await getBusiness();
        setSubscriptionStatus(data.subscriptionStatus || "free");
        setExpiresAt(data.subscriptionExpiresAt || null);
      } catch {}
    };

    fetchBusiness();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );

      setDate(
        now.toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    if (pinned) return;

    closeTimer.current = setTimeout(() => {
      setMenuOpen(false);
    }, 200);
  };

  const togglePinned = () => {
    setPinned((prev) => !prev);
    setMenuOpen(true);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!dropdownRef.current) return;

      if (!dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
        setPinned(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
    setPinned(false);
  }, [pathname]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setPinned(false);
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isSubscriptionActive =
    subscriptionStatus === "active" &&
    expiresAt &&
    new Date(expiresAt) > new Date();

  return (
    <div className="min-h-screen bg-background dark:bg-darkBackground flex">
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <aside
        className={clsx(
          "fixed md:sticky md:top-0 z-40 top-0 left-0 h-full md:h-screen w-64 bg-surface dark:bg-darkSurface border-r border-border dark:border-darkBorder transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-border dark:border-darkBorder font-semibold">
          FlowBook
        </div>

        <nav className="p-4 space-y-2 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "block px-4 py-2 rounded-md transition-colors",
                pathname === item.href
                  ? "bg-accent/10 text-accent font-medium"
                  : "hover:bg-muted dark:hover:bg-darkSurface/60",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <div className="sticky top-4 z-20 px-3 sm:px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 rounded-xl bg-surface/70 dark:bg-darkSurface/70 backdrop-blur-xl border border-border dark:border-darkBorder shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setOpen(!open)}
                  className="md:hidden flex-shrink-0"
                >
                  <Menu size={20} />
                </button>

                <div className="flex flex-col min-w-0">
                  <span className="text-sm md:text-base font-semibold truncate">
                    {greeting}
                    {userName ? `, ${userName}` : ""}
                  </span>

                  <span className="text-[11px] sm:text-xs text-secondaryText flex items-center gap-2 flex-wrap">
                    {businessName && (
                      <span className="truncate max-w-[120px] sm:max-w-[180px] md:max-w-none font-medium">
                        {businessName}
                      </span>
                    )}

                    {businessName && (
                      <span className="opacity-60 hidden sm:inline">•</span>
                    )}

                    <span className="whitespace-nowrap">{date}</span>

                    <span className="opacity-60">•</span>

                    <span className="whitespace-nowrap">{time}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-4 relative flex-shrink-0">
                <ThemeToggle />

                <div
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={openMenu}
                  onMouseLeave={closeMenu}
                >
                  <button
                    onClick={togglePinned}
                    className="h-8 w-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-medium"
                  >
                    {avatarLetter}
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-10 w-44 bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-lg shadow-soft text-sm overflow-hidden">
                      <Link
                        href="/dashboard/settings"
                        onClick={() => {
                          setMenuOpen(false);
                          setPinned(false);
                        }}
                        className="block px-4 py-2 hover:bg-muted dark:hover:bg-darkSurface/60"
                      >
                        Settings
                      </Link>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setPinned(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-muted dark:hover:bg-darkSurface/60"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>
          </div>
        </div>

        <main className="flex-1 px-4 md:px-6 pb-10 pt-6 max-w-7xl mx-auto w-full space-y-6">
          {isSubscriptionActive ? (
            <div className="bg-success/10 text-success border border-success/20 rounded-lg px-4 py-3 text-sm">
              Your subscription is active until {formatDate(expiresAt)}.
            </div>
          ) : (
            <div className="bg-warning/10 text-warning border border-warning/20 rounded-lg px-4 py-3 text-sm flex items-center justify-between gap-4">
              <span>
                Your subscription is inactive. Renew to continue accepting
                bookings.
              </span>

              <Link
                href="/dashboard/subscription"
                className="text-xs px-3 py-1.5 rounded-md bg-warning text-white"
              >
                Renew
              </Link>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}