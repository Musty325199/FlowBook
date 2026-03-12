"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import useAdminGuard from "@/hooks/useAdminGuard";
import AdminRouteGuard from "./AdminRouteGuard";

export default function AdminLayout({ children }) {
  useAdminGuard();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminRouteGuard>
    <div className="min-h-screen bg-background dark:bg-darkBackground flex">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <AdminTopbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 px-4 md:px-6 pb-10 pt-6 max-w-7xl mx-auto w-full space-y-6">
          {children}
        </main>
      </div>
    </div>
    </AdminRouteGuard>
  );
}