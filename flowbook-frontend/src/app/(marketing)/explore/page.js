"use client";

import { useEffect, useState } from "react";
import { getPublicBusinesses } from "@/services/marketplace.service";
import VendorCard from "@/components/marketplace/VendorCard";
import Spinner from "@/components/ui/Spinner";

export default function ExplorePage() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [ratingFilter, setRatingFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

const loadBusinesses = async () => {
  try {
    setLoading(true);

    const data = await getPublicBusinesses({
      search: search || "",
      rating: ratingFilter || "",
      service: serviceFilter || "",
      sort: sortBy || "",
    });

    setVendors(data);
  } catch {
    setVendors([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      loadBusinesses();
    }, 400);

    return () => clearTimeout(delay);
  }, [search, ratingFilter, serviceFilter, sortBy]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {},
    );
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredVendors = vendors
  .filter((v) => {
    if (serviceFilter) {
      const specialties = v.specialties || [];

      const match = specialties.some((s) =>
        s.toLowerCase().includes(serviceFilter.toLowerCase())
      );

      if (!match) return false;
    }

    return true;
  })
  .sort((a, b) => {
    if (sortBy === "popular") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    return 0;
  });
  
  const featured = filteredVendors.slice(
    0,
    Math.min(3, filteredVendors.length),
  );
  const popular = filteredVendors.slice(3, Math.min(6, filteredVendors.length));
  const rest = filteredVendors.slice(6);

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 space-y-14">
      <header className="text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Discover Businesses
        </h1>

        <p className="text-secondaryText max-w-xl mx-auto text-sm">
          Find barbers, salons and service providers near you and book
          instantly.
        </p>

        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={handleSearch}
            className="w-full max-w-md px-4 py-3 rounded-lg border border-border dark:border-darkBorder bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border dark:border-darkBorder bg-background dark:bg-darkBackground text-sm"
          >
            <option value="">All Ratings</option>
            <option value="5">5★</option>
            <option value="4">4★ & up</option>
            <option value="3">3★ & up</option>
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border dark:border-darkBorder bg-background dark:bg-darkBackground text-sm"
          >
            <option value="">All Services</option>
            <option value="Haircut">Haircut</option>
            <option value="Beard">Beard</option>
            <option value="Salon">Salon</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border dark:border-darkBorder bg-background dark:bg-darkBackground text-sm"
          >
            <option value="">Sort</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <p className="text-lg font-semibold">No businesses found</p>
          <p className="text-secondaryText text-sm">
            Try searching for another business
          </p>
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-semibold whitespace-nowrap">
                  Featured Businesses
                </h2>

                <p className="text-xs sm:text-sm text-secondaryText whitespace-nowrap">
                  {filteredVendors.length} businesses available
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {featured.map((vendor) => (
                  <VendorCard key={vendor._id} vendor={vendor} featured />
                ))}
              </div>
            </section>
          )}

          {filteredVendors.length > 3 && (
            <section className="space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold">
                Popular Near You
              </h2>

              <div className="grid gap-6 md:grid-cols-3">
                {popular.map((vendor) => (
                  <VendorCard key={vendor._id} vendor={vendor} />
                ))}
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold">
                All Businesses
              </h2>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((vendor) => (
                  <VendorCard key={vendor._id} vendor={vendor} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
