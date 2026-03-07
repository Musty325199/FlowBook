"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { getPublicBusinessBySlug } from "@/services/publicBusiness.service";
import { getPublicServices } from "@/services/publicServices.service";
import { getBusinessReviews } from "@/services/review.service";
import StarRating from "@/components/reviews/StarRating";
import ServiceCard from "@/components/vendor/ServiceCard";
import Spinner from "@/components/ui/Spinner";
import { Moon, Sun, MapPin, Clock } from "lucide-react";

export default function VendorProfilePage() {
  const { slug } = useParams();

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const [distribution, setDistribution] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });

  const today = new Date().toLocaleString("en-US", { weekday: "long" });

  const toggleDark = () => {
    const root = document.documentElement;

    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };

  const loadReviews = useCallback(async (businessId) => {
    try {
      const reviewData = await getBusinessReviews(businessId);

      const avg = Number(reviewData?.averageRating) || 0;
      const total = Number(reviewData?.totalReviews) || 0;
      const list = reviewData?.reviews || [];

      setReviews(list);
      setRating(avg);
      setCount(total);

      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

      list.forEach((r) => {
        if (dist[r.rating] !== undefined) {
          dist[r.rating] += 1;
        }
      });

      setDistribution(dist);
    } catch {
      setReviews([]);
      setRating(0);
      setCount(0);
    }
  }, []);

  const loadVendor = useCallback(async () => {
    try {
      setLoading(true);

      const [businessData, servicesData] = await Promise.all([
        getPublicBusinessBySlug(slug),
        getPublicServices(slug),
      ]);

      setBusiness(businessData);
      setServices(servicesData);

      if (businessData?._id) {
        await loadReviews(businessData._id);
      }
    } catch {
      setBusiness(null);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [slug, loadReviews]);

  useEffect(() => {
    if (slug) {
      loadVendor();
    }
  }, [slug, loadVendor]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-24">
        <p className="text-lg font-semibold">Business not found</p>
      </div>
    );
  }

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <main className="min-h-screen bg-background dark:bg-darkBackground">
      <div className="max-w-7xl mx-auto px-6 pt-6 flex justify-end">
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg border border-border dark:border-darkBorder hover:bg-muted dark:hover:bg-darkSurface transition"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="relative rounded-3xl overflow-hidden border border-border dark:border-darkBorder">
          <div className="h-40 bg-gradient-to-r from-accent/30 via-accent/10 to-transparent" />

          <div className="bg-surface dark:bg-darkSurface px-8 pb-8 pt-14 text-center">
            <div className="absolute left-1/2 -translate-x-1/2 top-20">
              <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {business.name.charAt(0)}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mt-6 tracking-tight">
              {business.name}
            </h1>

            <div className="flex justify-center items-center gap-2 mt-2">
              <StarRating rating={Math.round(rating)} />

              <span className="text-sm text-secondaryText">
                {rating.toFixed(1)} ({count} reviews)
              </span>
            </div>

            {business.location && (
              <div className="flex items-center justify-center gap-2 text-secondaryText mt-2 text-sm">
                <MapPin size={16} />
                {business.location}
              </div>
            )}

            {business.description && (
              <p className="max-w-xl mx-auto text-secondaryText mt-4 text-sm">
                {business.description}
              </p>
            )}

            <div className="flex justify-center gap-8 mt-6 text-sm">
              <div>
                <p className="font-semibold">{services.length}</p>
                <p className="text-secondaryText">Services</p>
              </div>

              <div>
                <p className="font-semibold text-green-600">Open</p>
                <p className="text-secondaryText">Status</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {business.workingHours && (
        <section className="max-w-md mx-auto mt-12 rounded-2xl border border-border dark:border-darkBorder bg-surface dark:bg-darkSurface p-6 shadow-soft">
          <div className="flex items-center justify-center gap-2 mb-4 text-sm font-semibold">
            <Clock size={16} />
            Working Hours
          </div>

          <div className="space-y-2 text-sm">
            {Object.entries(business.workingHours).map(([day, hours]) => {
              const display = hours.closed
                ? "Closed"
                : `${hours.open} - ${hours.close}`;

              return (
                <div
                  key={day}
                  className={`flex justify-between px-3 py-2 rounded-lg ${
                    today === day
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-secondaryText"
                  }`}
                >
                  <span>{day}</span>
                  <span>{display}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 mt-16 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Services</h2>

          <p className="text-secondaryText text-sm">
            Book an appointment with {business.name}
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-16 text-secondaryText">
            No services available yet
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} slug={slug} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-3xl mx-auto mt-20 space-y-6 px-6">
        <h2 className="text-xl font-semibold text-center">Customer Reviews</h2>

        {count > 0 && (
          <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 space-y-3">
            {[5,4,3,2,1].map((star)=>{
              const value = distribution[star];
              const percent = count ? (value / count) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-6">{star}★</span>

                  <div className="flex-1 h-2 bg-muted dark:bg-darkBackground rounded">
                    <div
                      className="h-2 bg-accent rounded"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="w-6 text-secondaryText">{value}</span>
                </div>
              );
            })}
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-center text-secondaryText text-sm">
            No reviews yet
          </p>
        ) : (
          <div className="space-y-4">
            {visibleReviews.map((review) => (
              <div
                key={review._id}
                className="p-5 rounded-xl border border-border dark:border-darkBorder bg-surface dark:bg-darkSurface"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">
                    {review.customerName}
                  </p>

                  <StarRating rating={review.rating} />
                </div>

                {review.comment && (
                  <p className="text-sm text-secondaryText mt-3">
                    {review.comment}
                  </p>
                )}

                <p className="text-xs text-secondaryText mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {reviews.length > 3 && (
          <div className="text-center pt-4">
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="text-accent text-sm font-medium hover:underline"
            >
              {showAllReviews
                ? "Show less"
                : `View all ${reviews.length} reviews`}
            </button>
          </div>
        )}
      </section>

      <div className="h-20" />
    </main>
  );
}