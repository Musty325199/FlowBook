"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "@/services/services.service";
import { getBusiness } from "@/services/business.service";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [expiresAt, setExpiresAt] = useState(null);

  const isSubscriptionActive =
    subscriptionStatus === "active" &&
    expiresAt &&
    new Date(expiresAt) > new Date();

  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
    image: null,
    category: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      duration: "",
      description: "",
      image: null,
      category: "",
    });
    setPreview(null);
    setEditing(null);
  };

  useEffect(() => {
    loadServices();
    loadBusiness();
  }, []);

  const loadServices = async () => {
    try {
      const data = await getServices();
      setServices(data);
    } catch {
      toast.error("Failed to load services");
    }
  };

  const loadBusiness = async () => {
    try {
      const data = await getBusiness();
      setSubscriptionStatus(data.subscriptionStatus || "free");
      setExpiresAt(data.subscriptionExpiresAt || null);
    } catch {}
  };

  const handleImage = (file) => {
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!isSubscriptionActive) {
      toast.error("Subscription inactive. Renew to manage services.");
      return;
    }
    if (!form.name || !form.price || !form.duration) {
      toast.error("Name, price and duration are required");
      return;
    }

    setLoading(true);

    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("price", Number(form.price));
    payload.append("duration", Number(form.duration));
    payload.append("description", form.description);
    payload.append("category", form.category);
    if (form.image) payload.append("image", form.image);

    try {
      if (editing) {
        const updated = await updateService(editing._id, payload);
        setServices((prev) =>
          prev.map((s) => (s._id === editing._id ? updated : s)),
        );
        toast.success("Service updated");
      } else {
        const created = await createService(payload);
        setServices((prev) => [...prev, created]);
        toast.success("Service created");
      }

      resetForm();
      setOpen(false);
    } catch {
      toast.error("Operation failed");
    }

    setLoading(false);
  };

  const handleEdit = (service) => {
    setEditing(service);
    setForm({
      name: service.name || "",
      price: service.price || "",
      duration: service.duration || "",
      description: service.description || "",
      image: null,
      category: service.category || "",
    });
    setPreview(service.image || null);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const prevServices = services;

    setServices((prev) => prev.filter((s) => s._id !== id));

    try {
      await deleteService(id);
      toast.success("Service deleted");
    } catch {
      setServices(prevServices);
      toast.error("Delete failed");
    }

    setConfirmDelete(null);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Services</h2>

        <button
          onClick={() => {
            if (!isSubscriptionActive) {
              toast.error("Subscription inactive. Renew to manage services.");
              return;
            }
            setOpen(true);
          }}
          disabled={!isSubscriptionActive}
          className="flex items-center justify-center gap-2 bg-accent text-white px-4 py-2 rounded-md text-sm hover:bg-accent/90 transition w-full sm:w-auto disabled:opacity-50"
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-24 text-sm text-secondaryText">
          No services yet. Add your first service to start accepting bookings.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl overflow-hidden shadow-soft hover:shadow-md transition-all"
            >
              {service.image && (
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-40 w-full object-cover"
                />
              )}

              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base truncate">
                      {service.name}
                    </h3>

                    <p className="text-sm text-secondaryText">
                      ₦{Number(service.price).toLocaleString()} •{" "}
                      {service.duration} mins
                    </p>
                  </div>

                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => {
                        if (!isSubscriptionActive) {
                          toast.error(
                            "Subscription inactive. Renew to edit services.",
                          );
                          return;
                        }
                        handleEdit(service);
                      }}
                      disabled={!isSubscriptionActive}
                      className="hover:text-accent transition disabled:opacity-40"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => {
                        if (!isSubscriptionActive) {
                          toast.error(
                            "Subscription inactive. Renew to delete services.",
                          );
                          return;
                        }
                        setConfirmDelete(service._id);
                      }}
                      disabled={!isSubscriptionActive}
                      className="hover:text-danger transition disabled:opacity-40"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {service.category && (
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                    {service.category}
                  </span>
                )}

                {service.description && (
                  <p className="text-sm text-secondaryText line-clamp-2">
                    {service.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm overflow-y-auto custom-scroll z-50 p-4"
          >
            <div className="min-h-full flex items-start justify-center pt-8 pb-6">
              <motion.div
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.96 }}
                className="bg-surface dark:bg-darkSurface w-full max-w-md rounded-xl shadow-soft relative flex flex-col max-h-[85vh]"
              >
                <div className="flex items-center justify-between p-6 border-b border-border dark:border-darkBorder">
                  <h3 className="text-lg font-semibold">
                    {editing ? "Edit Service" : "Add Service"}
                  </h3>

                  <button
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 space-y-4 text-sm overflow-y-auto custom-scroll">
                  <div
                    className="border-2 border-dashed border-border dark:border-darkBorder rounded-lg p-6 text-center cursor-pointer hover:border-accent transition"
                    onClick={() =>
                      document.getElementById("serviceImageInput").click()
                    }
                  >
                    <input
                      id="serviceImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImage(e.target.files[0])}
                    />

                    {preview ? (
                      <img
                        src={preview}
                        alt="preview"
                        className="h-40 w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-secondaryText">
                        <Upload size={22} />
                        Upload service image
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Service name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:ring-2 focus:ring-accent"
                  />

                  <input
                    type="number"
                    placeholder="Price (₦)"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:ring-2 focus:ring-accent"
                  />

                  <input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:ring-2 focus:ring-accent"
                  />

                  <input
                    type="text"
                    placeholder="Category"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:ring-2 focus:ring-accent"
                  />

                  <textarea
                    placeholder="Service description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="p-6 border-t border-border dark:border-darkBorder">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !isSubscriptionActive}
                    className="w-full bg-accent text-white py-2 rounded-md hover:bg-accent/90 transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {editing ? "Update Service" : "Create Service"}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              className="bg-surface dark:bg-darkSurface w-full max-w-sm rounded-xl shadow-soft p-6 space-y-6"
            >
              <h3 className="text-lg font-semibold">Delete Service?</h3>

              <p className="text-sm text-secondaryText">
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2 rounded-md border border-border dark:border-darkBorder text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (!isSubscriptionActive) {
                      toast.error(
                        "Subscription inactive. Renew to manage services.",
                      );
                      return;
                    }
                    handleDelete(confirmDelete);
                  }}
                  className="flex-1 py-2 rounded-md bg-danger text-white text-sm"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
