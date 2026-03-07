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

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const data = await getPublicBusinesses(search);
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
  }, [search]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {}
    );
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const featured = vendors.slice(0, Math.min(3, vendors.length));
  const popular = vendors.slice(3, Math.min(6, vendors.length));
  const rest = vendors.slice(6);

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 space-y-14">
      <header className="text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Discover Businesses
        </h1>

        <p className="text-secondaryText max-w-xl mx-auto text-sm">
          Find barbers, salons and service providers near you and book instantly.
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
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : vendors.length === 0 ? (
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
                  {vendors.length} businesses available
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {featured.map((vendor) => (
                  <VendorCard key={vendor._id} vendor={vendor} featured />
                ))}
              </div>
            </section>
          )}

          {vendors.length > 3 && (
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