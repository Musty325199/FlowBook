"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ArrowUpDown, Tag, ChevronDown, X } from "lucide-react";
import { getAllMarketplaceServices } from "@/services/marketplace.service";
import Spinner from "@/components/ui/Spinner";
import ServiceCard from "@/components/vendor/ServiceCard";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [price, setPrice] = useState("all");

  const [priceOpen, setPriceOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const priceRef = useRef(null);
  const sortRef = useRef(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await getAllMarketplaceServices();
        setServices(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (priceRef.current && !priceRef.current.contains(e.target)) setPriceOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const scrollHandler = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    services.forEach((s) => {
      if (s.category) set.add(s.category.trim().toLowerCase());
    });
    return ["all", ...Array.from(set)];
  }, [services]);

  const processedServices = useMemo(() => {
    const term = search.toLowerCase();

    let list = services.filter((s) => {
      const matchSearch =
        s.name?.toLowerCase().includes(term) ||
        s.business?.name?.toLowerCase().includes(term);

      const matchCategory =
        category === "all" || s.category?.toLowerCase() === category;

      const matchPrice =
        price === "all" ||
        (price === "low" && s.price <= 5000) ||
        (price === "mid" && s.price > 5000 && s.price <= 10000) ||
        (price === "high" && s.price > 10000);

      return matchSearch && matchCategory && matchPrice;
    });

    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "duration") list = [...list].sort((a, b) => a.duration - b.duration);
    if (sort === "newest") list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return list;
  }, [services, search, category, sort, price]);

  const priceOptions = [
    { value: "all", label: "All Prices" },
    { value: "low", label: "₦0 - ₦5000" },
    { value: "mid", label: "₦5000 - ₦10000" },
    { value: "high", label: "₦10000+" },
  ];

  const sortOptions = [
    { value: "recommended", label: "Recommended" },
    { value: "price-low", label: "Price: Low → High" },
    { value: "price-high", label: "Price: High → Low" },
    { value: "duration", label: "Shortest Duration" },
    { value: "newest", label: "Newest" },
  ];

  const priceLabel = priceOptions.find((p) => p.value === price)?.label;
  const sortLabel = sortOptions.find((s) => s.value === sort)?.label;

  const priceActive = price !== "all";
  const sortActive = sort !== "recommended";
  const categoryActive = category !== "all";

  const clearFilters = () => {
    setCategory("all");
    setPrice("all");
    setSort("recommended");
    setSearch("");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-56 rounded-2xl border border-border dark:border-darkBorder animate-pulse bg-muted dark:bg-darkSurface"/>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Browse Services
            </h1>
            <p className="text-sm sm:text-base text-secondaryText mt-2">
              Discover services from top barbers and salons
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondaryText"/>
            <input
              type="text"
              placeholder="Search services or vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border dark:border-darkBorder bg-surface dark:bg-darkSurface text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </motion.div>

        <motion.div
          className={`relative lg:sticky lg:top-20 z-20 backdrop-blur-md bg-surface/80 dark:bg-darkSurface/80 border border-border dark:border-darkBorder rounded-xl px-4 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between transition ${
            scrolled ? "shadow-xl" : "shadow-md"
          }`}
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm border transition ${
                  category === cat
                    ? "bg-accent text-white border-accent"
                    : "border-border dark:border-darkBorder hover:bg-muted dark:hover:bg-darkSurface"
                }`}
              >
                <Tag size={14} />
                {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-2 text-sm text-secondaryText">
              <Filter size={16}/>
              Filters
            </div>

            <div className="relative" ref={priceRef}>
              <button
                onClick={() => setPriceOpen(!priceOpen)}
                className={`flex items-center justify-between gap-2 px-4 py-1.5 min-w-[150px] whitespace-nowrap rounded-full text-sm border transition ${
                  priceActive
                    ? "bg-accent text-white border-accent"
                    : "border-border dark:border-darkBorder hover:bg-muted dark:hover:bg-darkSurface"
                }`}
              >
                {priceLabel}
                <ChevronDown className={`transition ${priceOpen ? "rotate-180" : ""}`} size={16}/>
              </button>

              {priceOpen && (
                <div className="absolute mt-2 w-44 rounded-xl bg-accent text-white shadow-lg overflow-hidden z-50">
                  {priceOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setPrice(opt.value);
                        setPriceOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm whitespace-nowrap hover:bg-white/10 ${
                        price === opt.value ? "bg-white/20" : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`flex items-center justify-between gap-2 px-4 py-1.5 min-w-[170px] whitespace-nowrap rounded-full text-sm border transition ${
                  sortActive
                    ? "bg-accent text-white border-accent"
                    : "border-border dark:border-darkBorder hover:bg-muted dark:hover:bg-darkSurface"
                }`}
              >
                {sortLabel}
                <ChevronDown className={`transition ${sortOpen ? "rotate-180" : ""}`} size={16}/>
              </button>

              {sortOpen && (
                <div className="absolute mt-2 w-48 rounded-xl bg-accent text-white shadow-lg overflow-hidden z-50">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSort(opt.value);
                        setSortOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm whitespace-nowrap hover:bg-white/10 ${
                        sort === opt.value ? "bg-white/20" : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(categoryActive || priceActive || sortActive || search) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-accent hover:underline"
              >
                <X size={14}/>
                Clear
              </button>
            )}
          </div>
        </motion.div>

        <motion.div
          key={processedServices.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-secondaryText flex items-center gap-2"
        >
          <ArrowUpDown size={14}/>
          Showing {processedServices.length} services
        </motion.div>

        <AnimatePresence mode="wait">
          {processedServices.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <h3 className="text-lg font-semibold">No services match your filters</h3>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 rounded-lg bg-accent text-white text-sm"
              >
                Reset Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {processedServices.map((service) => (
                <motion.div
                  key={service._id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ServiceCard service={service}/>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}