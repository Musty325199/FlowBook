"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StarRating from "@/components/reviews/StarRating";
import { getBusinessReviews } from "@/services/review.service";

export default function VendorCard({ vendor, featured }) {

  const isNew =
    vendor.createdAt &&
    new Date() - new Date(vendor.createdAt) < 1000 * 60 * 60 * 24 * 14;

  const [rating,setRating] = useState(0);
  const [count,setCount] = useState(0);

  useEffect(()=>{

    const load = async ()=>{

      try{

        if(!vendor?._id) return;

        const data = await getBusinessReviews(vendor._id);

        const avg = Number(data?.averageRating) || 0;
        const total = Number(data?.totalReviews) || 0;

        setRating(avg);
        setCount(total);

      }catch{

        setRating(0);
        setCount(0);

      }

    };

    load();

  },[vendor?._id]);

  return(

    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border dark:border-darkBorder bg-surface dark:bg-darkSurface shadow-soft transition hover:shadow-xl hover:-translate-y-1 ${
        featured ? "ring-2 ring-accent/20" : ""
      }`}
    >

      <div className="h-20 bg-gradient-to-r from-accent/20 to-accent/5"/>

      <div className="p-6 flex flex-col justify-between flex-1">

        <div className="space-y-3">

          <div className="flex items-start justify-between gap-2">

            <h3 className="text-lg font-semibold leading-tight group-hover:text-accent transition">
              {vendor.name}
            </h3>

            {featured && (
              <span className="text-[10px] bg-accent text-white px-2 py-1 rounded-full whitespace-nowrap">
                Featured
              </span>
            )}

            {!featured && isNew && (
              <span className="text-[10px] bg-green-600 text-white px-2 py-1 rounded-full whitespace-nowrap">
                New
              </span>
            )}

          </div>

          <div className="flex items-center gap-2">

            <StarRating rating={Math.round(rating)}/>

            <span className="text-xs text-secondaryText">
              {rating.toFixed(1)} ({count})
            </span>

          </div>

          {vendor.location && (
            <p className="text-xs text-secondaryText">
              📍 {vendor.location}
            </p>
          )}

          {vendor.description && (
            <p className="text-sm text-secondaryText line-clamp-3">
              {vendor.description}
            </p>
          )}

        </div>

        <div className="flex gap-2 mt-6">

          <Link
            href={`/vendor/${vendor.slug}`}
            className="flex-1 text-center px-3 py-2 rounded-md border border-border dark:border-darkBorder text-xs sm:text-sm whitespace-nowrap hover:bg-muted dark:hover:bg-darkSurface/60 transition"
          >
            View Profile
          </Link>

          <Link
            href={`/book/${vendor.slug}`}
            className="flex-1 text-center px-3 py-2 rounded-md bg-accent text-white text-xs sm:text-sm whitespace-nowrap hover:bg-accent/90 transition"
          >
            Book Now
          </Link>

        </div>

      </div>

    </div>

  );

}