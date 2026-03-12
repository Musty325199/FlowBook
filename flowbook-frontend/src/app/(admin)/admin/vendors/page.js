"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";
import { getVendors, suspendVendor, activateVendor } from "@/services/admin.service";
import {
  Store,
  Mail,
  Crown,
  ShieldCheck,
  ShieldOff,
  Ban,
  CheckCircle
} from "lucide-react";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadVendors = async () => {
    try {
      const data = await getVendors();
      setVendors(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id) => {
    const t = toast.loading("Suspending vendor");
    try {
      await suspendVendor(id);
      toast.success("Vendor suspended", { id: t });
      loadVendors();
    } catch {
      toast.error("Failed to suspend vendor", { id: t });
    }
  };

  const handleActivate = async (id) => {
    const t = toast.loading("Activating vendor");
    try {
      await activateVendor(id);
      toast.success("Vendor activated", { id: t });
      loadVendors();
    } catch {
      toast.error("Failed to activate vendor", { id: t });
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  return (
    <AdminLayout>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}

      {!loading && vendors.length === 0 && (
        <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-10 text-center">
          No vendors found
        </div>
      )}

      {!loading && vendors.length > 0 && (
        <>
          <div className="md:hidden space-y-4">
            {vendors.map((v) => (
              <div
                key={v._id}
                className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{v.name}</span>

                  {v.suspended ? (
                    <span className="flex items-center gap-1 text-red-500 text-xs">
                      <ShieldOff size={14} />
                      Suspended
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600 text-xs">
                      <ShieldCheck size={14} />
                      Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} />
                  {v.email}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Store size={14} />
                  {v.business?.name}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Crown size={14} />
                  {v.subscriptionStatus || "free"}
                </div>

                <div className="flex gap-4 pt-2">
                  {!v.suspended && (
                    <button
                      onClick={() => handleSuspend(v._id)}
                      className="flex items-center gap-1 text-red-500 text-xs"
                    >
                      <Ban size={14} />
                      Suspend
                    </button>
                  )}

                  {v.suspended && (
                    <button
                      onClick={() => handleActivate(v._id)}
                      className="flex items-center gap-1 text-green-600 text-xs"
                    >
                      <CheckCircle size={14} />
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border dark:border-darkBorder">
                <tr className="text-left">
                  <th className="px-6 py-3">Vendor</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Business</th>
                  <th className="px-6 py-3">Subscription</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {vendors.map((v) => (
                  <tr
                    key={v._id}
                    className="border-b border-border dark:border-darkBorder"
                  >
                    <td className="px-6 py-4 font-medium">{v.name}</td>

                    <td className="px-6 py-4">{v.email}</td>

                    <td className="px-6 py-4">{v.business?.name}</td>

                    <td className="px-6 py-4">{v.subscriptionStatus || "free"}</td>

                    <td className="px-6 py-4">
                      {v.suspended ? (
                        <span className="text-red-500 text-xs">Suspended</span>
                      ) : (
                        <span className="text-green-600 text-xs">Active</span>
                      )}
                    </td>

                    <td className="px-6 py-4 flex gap-3">
                      {!v.suspended && (
                        <button
                          onClick={() => handleSuspend(v._id)}
                          className="text-red-500"
                        >
                          <Ban size={18} />
                        </button>
                      )}

                      {v.suspended && (
                        <button
                          onClick={() => handleActivate(v._id)}
                          className="text-green-600"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

    </AdminLayout>
  );
}