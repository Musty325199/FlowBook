"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Bell } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AdminTopbar({ setSidebarOpen }) {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [locked, setLocked] = useState(false);

  const dropdownRef = useRef(null);
  const hoverTimeout = useRef(null);

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || "A";

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setLocked(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    if (!locked) setOpen(true);
  };

  const handleLeave = () => {
    if (locked) return;
    hoverTimeout.current = setTimeout(() => {
      setOpen(false);
    }, 220);
  };

  return (
    <div className="sticky top-4 z-40 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 rounded-xl bg-surface/70 dark:bg-darkSurface/70 backdrop-blur-xl border border-border dark:border-darkBorder shadow-sm">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="md:hidden"
            >
              <Menu size={20} />
            </button>

            <span className="font-semibold text-sm sm:text-base">
              Admin Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">

            <ThemeToggle />

            <button className="relative hover:text-accent transition">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center animate-pulse">
                3
              </span>
            </button>

            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
            >
              <button
                onClick={() => {
                  setOpen(true);
                  setLocked((prev) => !prev);
                }}
                className="flex items-center"
              >
                <div className="h-8 w-8 rounded-full bg-accent/10 hover:bg-accent/20 transition flex items-center justify-center text-accent text-xs font-medium cursor-pointer">
                  {avatarLetter}
                </div>
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-44 rounded-xl bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder shadow-lg text-sm overflow-hidden animate-in fade-in zoom-in-95">

                  <Link
                    href="/admin/profile"
                    onClick={() => {
                      setOpen(false);
                      setLocked(false);
                    }}
                    className="block px-4 py-2 hover:bg-muted dark:hover:bg-darkSurface/60 transition"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      setOpen(false);
                      setLocked(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-muted dark:hover:bg-darkSurface/60 transition"
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
  );
}