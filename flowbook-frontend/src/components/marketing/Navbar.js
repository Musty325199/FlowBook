"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [pinned, setPinned] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  const closeTimer = useRef(null);
  const dropdownRef = useRef(null);

  const avatarLetter = useMemo(() => {
    if (!user) return "U";
    if (user.name) return user.name.trim().charAt(0).toUpperCase();
    if (user.business?.name)
      return user.business.name.trim().charAt(0).toUpperCase();
    return "U";
  }, [user]);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDropdown(true);
  };

  const closeMenu = () => {
    if (pinned) return;
    closeTimer.current = setTimeout(() => {
      setDropdown(false);
    }, 200);
  };

  const togglePinned = () => {
    setPinned((prev) => !prev);
    setDropdown(true);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setDropdown(false);
        setPinned(false);
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        setDropdown(false);
        setPinned(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <>
      <div className="sticky top-4 z-50 px-4 md:px-6">
        <header className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 md:px-6 rounded-xl bg-surface/70 dark:bg-darkSurface/70 backdrop-blur-xl border border-border dark:border-darkBorder shadow-[0_0_25px_rgba(79,70,229,0.06)]">
          <Link href="/" className="text-sm font-semibold">
            FlowBook
          </Link>

          <nav className="hidden md:flex items-center text-sm">
            <div className="flex items-center gap-6 mr-10">
              <Link
                href="/explore"
                className="hover:text-accent transition font-medium"
              >
                Explore
              </Link>

              <Link
                href="/services"
                className="hover:text-accent transition font-medium"
              >
                Services
              </Link>
            </div>

            <div className="flex items-center gap-6 text-secondaryText">
              <Link
                href="/features"
                className="hover:text-accent transition"
              >
                Features
              </Link>

              <Link
                href="/pricing"
                className="hover:text-accent transition"
              >
                Pricing
              </Link>

              <Link
                href="/faq"
                className="hover:text-accent transition"
              >
                FAQ
              </Link>
            </div>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />

            {!isAuthenticated ? (
              <>
                <Link href="/login">
                  <Button variant="secondary" size="sm">
                    Login
                  </Button>
                </Link>

                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            ) : (
              <div
                ref={dropdownRef}
                className="relative"
                onMouseEnter={openMenu}
                onMouseLeave={closeMenu}
              >
                <button
                  onClick={togglePinned}
                  className="h-9 w-9 rounded-full bg-accent text-white flex items-center justify-center text-sm font-semibold"
                >
                  {avatarLetter}
                </button>

                {dropdown && (
                  <div className="absolute right-0 mt-2 w-44 rounded-lg bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder shadow-soft overflow-hidden text-sm">
                    <Link
                      href="/dashboard"
                      onClick={() => {
                        setDropdown(false);
                        setPinned(false);
                      }}
                      className="block px-4 py-2 hover:bg-muted dark:hover:bg-darkSurface/60"
                    >
                      Dashboard
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      onClick={() => {
                        setDropdown(false);
                        setPinned(false);
                      }}
                      className="block px-4 py-2 hover:bg-muted dark:hover:bg-darkSurface/60"
                    >
                      Settings
                    </Link>

                    <button
                      onClick={() => {
                        setDropdown(false);
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
            )}
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button onClick={() => setOpen(true)}>
              <Menu size={20} />
            </button>
          </div>
        </header>
      </div>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />

          <div className="fixed top-20 left-4 right-4 z-50 md:hidden">
            <div className="rounded-xl bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder shadow-soft p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Menu</span>
                <button onClick={() => setOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-sm">
                <Link href="/explore" onClick={() => setOpen(false)}>
                  Explore
                </Link>

                <Link href="/services" onClick={() => setOpen(false)}>
                  Services
                </Link>

                <Link href="/features" onClick={() => setOpen(false)}>
                  Features
                </Link>

                <Link href="/pricing" onClick={() => setOpen(false)}>
                  Pricing
                </Link>

                <Link href="/faq" onClick={() => setOpen(false)}>
                  FAQ
                </Link>
              </div>

              {!isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      Login
                    </Button>
                  </Link>

                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      Dashboard
                    </Button>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setOpen(false)}
                  >
                    <Button variant="secondary" className="w-full">
                      Settings
                    </Button>
                  </Link>

                  <Button
                    className="w-full"
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}