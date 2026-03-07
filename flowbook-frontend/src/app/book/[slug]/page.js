"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import {
  Moon,
  Sun,
  Clock,
  CalendarDays,
  CheckCircle2,
  Search,
  MapPin,
  ChevronRight,
} from "lucide-react";

import {
  getBusinessPublic,
  getServicesPublic,
  createPublicBooking,
  getBookedSlots,
} from "@/services/publicBooking.service";

export default function BookingPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service");

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [search, setSearch] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("flowbook-theme");
    if (stored === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("flowbook-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("flowbook-theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const loadData = async () => {
      const [biz, svc] = await Promise.all([
        getBusinessPublic(slug),
        getServicesPublic(slug),
      ]);

      setBusiness(biz);
      setServices(svc);
      setLoading(false);
    };

    if (slug) loadData();
  }, [slug]);

  useEffect(() => {
    if (serviceParam && services.length) {
      const found = services.find((s) => s._id === serviceParam);

      if (found) {
        setSelectedService(found);
      }
    }
  }, [serviceParam, services]);

  useEffect(() => {
    if (!selectedService || !date) return;

    const generate = async () => {
      const duration = selectedService.duration || 30;

      const selectedDate = new Date(date);

      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      const dayName = dayNames[selectedDate.getDay()];
      const workingDay = business?.workingHours?.[dayName];

      if (!workingDay || workingDay.closed) {
        setSlots([]);
        return;
      }

      const [openHour, openMinute] = workingDay.open.split(":").map(Number);
      const [closeHour, closeMinute] = workingDay.close.split(":").map(Number);

      let currentMinutes = openHour * 60 + openMinute;
      const endMinutes = closeHour * 60 + closeMinute;

      const generated = [];

      const now = new Date();
      const isToday = selectedDate.toDateString() === now.toDateString();

      while (currentMinutes + duration <= endMinutes) {
        const h = Math.floor(currentMinutes / 60);
        const m = currentMinutes % 60;

        const hour = String(h).padStart(2, "0");
        const min = String(m).padStart(2, "0");

        const slot = `${hour}:${min}`;

        if (isToday) {
          const slotDate = new Date(date);
          slotDate.setHours(h, m, 0, 0);

          if (slotDate <= now) {
            currentMinutes += duration;
            continue;
          }
        }

        generated.push(slot);

        currentMinutes += duration;
      }
      const booked = await getBookedSlots(slug, date);
      const formattedSlots = generated.map((slot) => ({
        time: slot,
        booked: booked.includes(slot),
      }));

      setSlots(formattedSlots);
    };

    generate();
  }, [selectedService, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedService || !date || !time) return;

    setSubmitting(true);

    try {
      const fullDate = new Date(`${date}T${time}`);

      const bookingResponse = await createPublicBooking(slug, {
        serviceId: selectedService._id,
        customerName,
        customerEmail,
        customerPhone,
        address,
        notes,
        date: fullDate,
      });

      if (!bookingResponse?.paymentRequired) {
        throw new Error("Booking validation failed");
      }

      const paymentRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/start-booking`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingData: bookingResponse.bookingData,
            amount: selectedService.price * 100,
          }),
        },
      );

      const paymentData = await paymentRes.json();

      if (paymentData.authorizationUrl) {
        window.location.href = paymentData.authorizationUrl;
      } else {
        throw new Error("Payment initialization failed");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to start payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-muted dark:bg-darkSurface/40">
        <div className="w-full max-w-lg bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-2xl shadow-soft p-10 space-y-6">
          <div className="text-center space-y-3">
            <CheckCircle2 className="mx-auto text-green-600" size={44} />

            <h2 className="text-2xl font-semibold">Booking Request Sent</h2>

            <p className="text-sm text-secondaryText">
              Your appointment request has been submitted successfully. The
              vendor will confirm your booking shortly.
            </p>
          </div>

          <div className="flex justify-center">
            <Link
              href={`/vendor/${slug}`}
              className="text-accent text-sm hover:underline"
            >
              Return to Vendor Page
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="border-b border-border dark:border-darkBorder py-4">
        <Container>
          <div className="flex items-center text-sm text-secondaryText gap-2">
            <Link href="/" className="hover:text-accent">
              Home
            </Link>

            <ChevronRight size={14} />

            <Link href="/explore" className="hover:text-accent">
              Explore
            </Link>

            <ChevronRight size={14} />

            <Link href={`/vendor/${slug}`} className="hover:text-accent">
              {business.name}
            </Link>

            <ChevronRight size={14} />

            <span className="text-foreground font-medium">Booking</span>
          </div>
        </Container>
      </section>

      <section className="py-12 border-b border-border dark:border-darkBorder bg-muted dark:bg-darkSurface/40">
        <Container className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold shadow-lg">
              {business.name.charAt(0)}
            </div>

            <div className="space-y-1">
              <Link
                href={`/vendor/${slug}`}
                className="text-2xl sm:text-3xl font-bold tracking-tight hover:text-accent transition"
              >
                {business.name}
              </Link>

              {business.location && (
                <div className="flex items-center gap-2 text-secondaryText text-sm">
                  <MapPin size={14} />
                  {business.location}
                </div>
              )}

              <p className="text-secondaryText text-sm">
                Choose a service and book your appointment
              </p>
            </div>
          </div>

          <button
            onClick={() => setDark(!dark)}
            className="h-10 w-10 flex items-center justify-center rounded-md border border-border dark:border-darkBorder hover:bg-surface dark:hover:bg-darkSurface"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </Container>
      </section>

      <section className="py-12">
        <Container className="grid lg:grid-cols-[1fr_420px] gap-10">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Select a Service</h2>

              <p className="text-secondaryText text-sm">
                Browse available services
              </p>
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-secondaryText"
                size={16}
              />

              <input
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 border border-border dark:border-darkBorder rounded-md px-3 py-2 bg-transparent"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {filteredServices.map((service) => (
                <button
                  key={service._id}
                  onClick={() => setSelectedService(service)}
                  className={`rounded-xl border p-5 text-left transition flex flex-col gap-3 ${
                    selectedService?._id === service._id
                      ? "border-accent bg-accent/5"
                      : "border-border dark:border-darkBorder hover:bg-muted dark:hover:bg-darkSurface/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base">{service.name}</h3>

                    {selectedService?._id === service._id && (
                      <CheckCircle2 className="text-accent" size={18} />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-secondaryText">
                      <Clock size={14} />
                      {service.duration} mins
                    </div>

                    <span className="font-semibold text-accent">
                      ₦{service.price}
                    </span>
                  </div>

                  {service.description && (
                    <p className="text-sm text-secondaryText line-clamp-2">
                      {service.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 h-fit">
            <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} />
                <h3 className="font-semibold">Choose Date</h3>
              </div>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-border dark:border-darkBorder rounded-md px-3 py-2 bg-transparent"
              />

              {selectedService && date && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Available Slots</h3>

                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={slot.booked}
                        onClick={() => !slot.booked && setTime(slot.time)}
                        className={`text-sm rounded-md border px-3 py-2 transition ${
                          slot.booked
                            ? "bg-muted text-secondaryText cursor-not-allowed"
                            : time === slot.time
                              ? "bg-accent text-white border-accent"
                              : "border-border dark:border-darkBorder hover:bg-muted dark:hover:bg-darkSurface"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 space-y-6">
              <h3 className="font-semibold">Booking Summary</h3>

              {selectedService ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondaryText">Service</span>

                    <span className="font-medium">{selectedService.name}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-secondaryText">Duration</span>

                    <span>{selectedService.duration} mins</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-secondaryText">Price</span>

                    <span className="font-semibold text-accent">
                      ₦{selectedService.price}
                    </span>
                  </div>

                  {date && (
                    <div className="flex justify-between">
                      <span className="text-secondaryText">Date</span>
                      <span>{date}</span>
                    </div>
                  )}

                  {time && (
                    <div className="flex justify-between">
                      <span className="text-secondaryText">Time</span>
                      <span>{time}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-secondaryText">
                  Select a service to see booking summary
                </p>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 space-y-4"
            >
              <h3 className="font-semibold">Your Details</h3>

              <input
                required
                placeholder="Full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-border dark:border-darkBorder rounded-md px-3 py-2 bg-transparent"
              />

              <input
                required
                type="email"
                placeholder="Email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full border border-border dark:border-darkBorder rounded-md px-3 py-2 bg-transparent"
              />

              <input
                placeholder="Phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border border-border dark:border-darkBorder rounded-md px-3 py-2 bg-transparent"
              />

              <input
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-border dark:border-darkBorder rounded-md px-3 py-2 bg-transparent"
              />

              <textarea
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-border dark:border-darkBorder rounded-md px-3 py-2 bg-transparent"
              />

              <Button className="w-full" size="lg">
                {submitting ? <Spinner /> : "Confirm Booking"}
              </Button>
            </form>
          </div>
        </Container>
      </section>
    </main>
  );
}
