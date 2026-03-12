"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { updateAdminProfile } from "@/services/admin.service";
import { User, Mail, Shield } from "lucide-react";

export default function AdminProfilePage() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  const avatarLetter = name?.charAt(0)?.toUpperCase() || "A";

  const handleUpdate = async () => {
    try {
      setLoading(true);

      await updateAdminProfile({
        name,
        email,
      });

      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-lg font-semibold mb-6">Admin Profile</h1>

        <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold">
              {avatarLetter}
            </div>

            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-secondaryText">{email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-secondaryText flex items-center gap-2 mb-1">
                <User size={14} />
                Name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border dark:border-darkBorder bg-background dark:bg-darkBackground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="text-sm text-secondaryText flex items-center gap-2 mb-1">
                <Mail size={14} />
                Email
              </label>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border dark:border-darkBorder bg-background dark:bg-darkBackground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="text-sm text-secondaryText flex items-center gap-2 mb-1">
                <Shield size={14} />
                Role
              </label>

              <input
                value="Administrator"
                disabled
                className="w-full px-3 py-2 rounded-lg border border-border dark:border-darkBorder bg-muted dark:bg-darkSurface text-sm"
              />
            </div>

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="mt-4 px-4 py-2 rounded-lg bg-accent text-white text-sm disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
