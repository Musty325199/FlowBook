"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, ImageIcon, User } from "lucide-react";
import { toast } from "sonner";
import { enable2FA, confirm2FA, disable2FA } from "@/services/auth.service";
import {
  getBusiness,
  updateBusiness,
  uploadBusinessAvatar,
  uploadBusinessCover,
} from "@/services/business.service";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const removeAvatar = async () => {
    try {
      await updateBusiness({ avatar: "" });
      setAvatarPreview("");
      toast.success("Avatar removed");
    } catch {
      toast.error("Failed to remove avatar");
    }
  };

  const removeCover = async () => {
    try {
      await updateBusiness({ coverImage: "" });
      setCoverPreview("");
      toast.success("Cover removed");
    } catch {
      toast.error("Failed to remove cover");
    }
  };

  const [form, setForm] = useState({
    businessName: "",
    phone: "",
    email: "",
    location: "",
    description: "",
    about: "",
    yearsOfExperience: "",
    specialties: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    cancellationPolicy: "",
  });

  const [workingHours, setWorkingHours] = useState({
    Monday: { open: "09:00", close: "18:00", closed: false },
    Tuesday: { open: "09:00", close: "18:00", closed: false },
    Wednesday: { open: "09:00", close: "18:00", closed: false },
    Thursday: { open: "09:00", close: "18:00", closed: false },
    Friday: { open: "09:00", close: "18:00", closed: false },
    Saturday: { open: "10:00", close: "17:00", closed: false },
    Sunday: { open: "", close: "", closed: true },
  });

  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [enabling2FA, setEnabling2FA] = useState(false);
  const [confirming2FA, setConfirming2FA] = useState(false);

  const [hasChanges, setHasChanges] = useState(false);

  const isSubscriptionActive =
    subscriptionStatus === "active" &&
    expiresAt &&
    new Date(expiresAt) > new Date();

  const initialData = useRef({
    form: null,
    workingHours: null,
  });

  const toggleClosed = (day) => {
    setWorkingHours((prev) => {
      const isClosing = !prev[day].closed;

      return {
        ...prev,
        [day]: {
          closed: isClosing,
          open: isClosing ? "" : "09:00",
          close: isClosing ? "" : "18:00",
        },
      };
    });
  };

  const handleAvatarUpload = async (file) => {
    try {
      setUploadingAvatar(true);
      const res = await uploadBusinessAvatar(file);
      setAvatarPreview(res.avatar);
      toast.success("Avatar updated");
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (file) => {
    try {
      setUploadingCover(true);
      const res = await uploadBusinessCover(file);
      setCoverPreview(res.coverImage);
      toast.success("Cover updated");
    } catch {
      toast.error("Failed to upload cover image");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleEnable2FA = async () => {
    if (user?.twoFactorEnabled) {
      toast.info("Two-factor authentication already enabled");
      return;
    }

    try {
      setEnabling2FA(true);
      const res = await enable2FA();

      if (res?.qrCode) {
        setQrCode(res.qrCode);
      }

      toast.success("Scan the QR code with your authenticator app");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to enable 2FA");
    } finally {
      setEnabling2FA(false);
    }
  };

  const handleConfirm2FA = async () => {
    if (twoFactorCode.length !== 6) {
      toast.error("Enter a valid 6-digit code");
      return;
    }

    try {
      setConfirming2FA(true);

      await confirm2FA(twoFactorCode);
      await refreshUser();

      toast.success("Two-factor authentication enabled");

      setQrCode(null);
      setTwoFactorCode("");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Invalid authentication code",
      );
    } finally {
      setConfirming2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      await disable2FA();
      await refreshUser();
      toast.success("Two-factor authentication disabled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to disable 2FA");
    }
  };
  const handleSave = async () => {
    try {
      const formattedHours = {};

      for (const day of Object.keys(workingHours)) {
        const d = workingHours[day];

        if (!d.closed) {
          if (!d.open || !d.close) {
            toast.error(`${day}: please set both open and close time`);
            return;
          }

          const [oh, om] = d.open.split(":").map(Number);
          const [ch, cm] = d.close.split(":").map(Number);

          const openMinutes = oh * 60 + om;
          const closeMinutes = ch * 60 + cm;

          if (openMinutes >= closeMinutes) {
            toast.error(`${day}: closing time must be after opening time`);
            return;
          }
        }

        formattedHours[day] = {
          open: d.closed ? "" : d.open,
          close: d.closed ? "" : d.close,
          closed: d.closed || false,
        };
      }
      await updateBusiness({
        name: form.businessName,
        phone: form.phone,
        email: form.email,
        location: form.location,
        description: form.description,
        about: form.about,
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
        specialties: form.specialties
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        cancellationPolicy: form.cancellationPolicy,
        workingHours: formattedHours,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        accountName: form.accountName,
      });

      toast.success("Settings updated successfully");

      initialData.current = {
        form: JSON.stringify(form),
        workingHours: JSON.stringify(formattedHours),
      };

      setHasChanges(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to update settings");
    }
  };

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const data = await getBusiness();

        const newForm = {
          businessName: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          location: data.location || "",
          description: data.description || "",
          about: data.about || "",
          yearsOfExperience: data.yearsOfExperience || "",
          specialties: data.specialties ? data.specialties.join(", ") : "",
          bankName: data.bankName || "",
          accountNumber: data.accountNumber || "",
          accountName: data.accountName || "",
          cancellationPolicy: data.cancellationPolicy || "",
        };

        setForm(newForm);

        if (data.workingHours) {
          setWorkingHours(data.workingHours);
        }

        if (data.subscriptionStatus) {
          setSubscriptionStatus(data.subscriptionStatus);
        }

        if (data.subscriptionExpiresAt) {
          setExpiresAt(data.subscriptionExpiresAt);
        }

        if (data.avatar) {
          setAvatarPreview(data.avatar);
        }

        if (data.coverImage) {
          setCoverPreview(data.coverImage);
        }

        initialData.current = {
          form: JSON.stringify(newForm),
          workingHours: JSON.stringify(data.workingHours || workingHours),
        };
      } catch {
        toast.error("Failed to load business settings");
      }
    };

    loadBusiness();
  }, []);

  useEffect(() => {
    const currentForm = JSON.stringify(form);
    const currentHours = JSON.stringify(workingHours);

    if (
      initialData.current.form !== currentForm ||
      initialData.current.workingHours !== currentHours
    ) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [form, workingHours]);

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      </header>

      <div className="space-y-6">
        <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden bg-muted dark:bg-darkSurface border border-border dark:border-darkBorder">
          {coverPreview ? (
            <img src={coverPreview} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-secondaryText">
              <ImageIcon size={32} />
            </div>
          )}

          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              onClick={() => coverInputRef.current.click()}
              className="flex items-center gap-1 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-md transition"
            >
              <Upload size={14} />
              {uploadingCover ? "Uploading..." : "Change"}
            </button>

            {coverPreview && (
              <button
                onClick={removeCover}
                className="flex items-center gap-1 bg-red-600/90 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-md transition"
              >
                <Trash2 size={14} />
                Remove
              </button>
            )}
          </div>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              setCoverPreview(URL.createObjectURL(file));
              handleCoverUpload(file);
            }}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-muted dark:bg-darkSurface border border-border dark:border-darkBorder flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-secondaryText" />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => avatarInputRef.current.click()}
              className="flex items-center gap-2 bg-accent text-white text-sm px-4 py-2 rounded-md hover:bg-accent/90 transition"
            >
              <Upload size={16} />
              {uploadingAvatar ? "Uploading..." : "Change Avatar"}
            </button>

            {avatarPreview && (
              <button
                onClick={removeAvatar}
                className="flex items-center gap-2 text-xs text-red-500 hover:text-red-600 transition"
              >
                <Trash2 size={14} />
                Remove Avatar
              </button>
            )}
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              setAvatarPreview(URL.createObjectURL(file));
              handleAvatarUpload(file);
            }}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-8">
          <article className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl shadow-soft p-6 space-y-6">
            <h3 className="text-lg font-semibold">Business Information</h3>

            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <input
                type="text"
                value={form.businessName}
                onChange={(e) =>
                  setForm({ ...form, businessName: e.target.value })
                }
                className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Business Name"
              />

              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Phone Number"
              />

              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Business Email"
              />

              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent sm:col-span-2"
                placeholder="Business Location"
              />
            </div>

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              rows={3}
              placeholder="Business Description"
            />

            <textarea
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              rows={4}
              placeholder="About your business (history, mission, experience...)"
            />

            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <input
                type="number"
                value={form.yearsOfExperience}
                onChange={(e) =>
                  setForm({ ...form, yearsOfExperience: e.target.value })
                }
                className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Years of Experience"
              />

              <input
                type="text"
                value={form.specialties}
                onChange={(e) =>
                  setForm({ ...form, specialties: e.target.value })
                }
                className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Specialties (comma separated)"
              />
            </div>

            <textarea
              value={form.cancellationPolicy}
              onChange={(e) =>
                setForm({ ...form, cancellationPolicy: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              rows={3}
              placeholder="Cancellation Policy"
            />
          </article>

          <article className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl shadow-soft p-6 space-y-6">
            <h3 className="text-lg font-semibold">Bank Details</h3>

            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Bank Name"
              />

              <input
                type="text"
                value={form.accountNumber}
                onChange={(e) =>
                  setForm({ ...form, accountNumber: e.target.value })
                }
                className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Account Number"
              />

              <input
                type="text"
                value={form.accountName}
                onChange={(e) =>
                  setForm({ ...form, accountName: e.target.value })
                }
                className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent sm:col-span-2"
                placeholder="Account Name"
              />
            </div>
          </article>

          <article className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl shadow-soft p-6 space-y-6">
            <h3 className="text-lg font-semibold">Working Hours</h3>

            <div className="space-y-4">
              {Object.entries(workingHours).map(([day, value]) => (
                <div
                  key={day}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center text-sm"
                >
                  <div className="font-medium">{day}</div>

                  <input
                    type="time"
                    disabled={value.closed}
                    value={value.open}
                    onChange={(e) =>
                      setWorkingHours({
                        ...workingHours,
                        [day]: { ...value, open: e.target.value },
                      })
                    }
                    className="px-3 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  />

                  <input
                    type="time"
                    disabled={value.closed}
                    value={value.close}
                    onChange={(e) =>
                      setWorkingHours({
                        ...workingHours,
                        [day]: { ...value, close: e.target.value },
                      })
                    }
                    className="px-3 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  />

                  <button
                    onClick={() => toggleClosed(day)}
                    className={`px-3 py-2 rounded-md border text-xs ${
                      value.closed
                        ? "bg-danger/10 text-danger border-danger/20"
                        : "bg-muted dark:bg-darkSurface/60 border-border dark:border-darkBorder"
                    }`}
                  >
                    {value.closed ? "Closed" : "Open"}
                  </button>
                </div>
              ))}
            </div>
          </article>

          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-6 py-2 rounded-md text-sm transition ${
              hasChanges
                ? "bg-accent text-white hover:bg-accent/90"
                : "bg-muted text-secondaryText cursor-not-allowed"
            }`}
          >
            Save Changes
          </button>
        </section>

        <aside className="space-y-6">
          <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl shadow-soft p-6 space-y-4">
            <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>

            {user?.twoFactorEnabled ? (
              <div className="space-y-3 text-center">
                <p className="text-green-600 text-sm font-medium">
                  Two-Factor Authentication Enabled
                </p>

                <button
                  onClick={handleDisable2FA}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition"
                >
                  Disable 2FA
                </button>
              </div>
            ) : (
              !qrCode && (
                <button
                  onClick={handleEnable2FA}
                  disabled={enabling2FA}
                  className="w-full bg-accent text-white px-4 py-2 rounded-md text-sm hover:bg-accent/90 transition disabled:opacity-60"
                >
                  {enabling2FA ? "Enabling..." : "Enable 2FA"}
                </button>
              )
            )}

            {qrCode && (
              <div className="space-y-4 text-sm">
                <img src={qrCode} className="w-40 h-40 mx-auto" />

                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) =>
                    setTwoFactorCode(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={6}
                  className="w-full text-center tracking-[0.4em] px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent"
                />

                <button
                  onClick={handleConfirm2FA}
                  disabled={confirming2FA}
                  className="w-full bg-accent text-white px-4 py-2 rounded-md text-sm hover:bg-accent/90 transition disabled:opacity-60"
                >
                  {confirming2FA ? "Confirming..." : "Confirm 2FA"}
                </button>
              </div>
            )}
          </div>

          <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl shadow-soft p-6 space-y-4">
            <h3 className="text-lg font-semibold">Subscription</h3>

            <p className="text-sm text-secondaryText">Subscription Status</p>

            <p className="font-medium capitalize">
              {isSubscriptionActive ? "Active" : "Inactive"}
            </p>

            {expiresAt && (
              <p className="text-xs text-secondaryText">
                Expires {new Date(expiresAt).toLocaleDateString()}
              </p>
            )}

            <button
              onClick={() => router.push("/dashboard/subscription")}
              className="w-full border border-border dark:border-darkBorder px-4 py-2 rounded-md text-sm hover:bg-muted dark:hover:bg-darkSurface/60 transition"
            >
              Manage Subscription
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
