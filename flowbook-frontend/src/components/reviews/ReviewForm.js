"use client";

import { useState } from "react";
import Link from "next/link";
import { createReview } from "@/services/review.service";

export default function ReviewForm({ bookingId, vendorSlug, onSuccess }) {

  const [rating,setRating] = useState(5);
  const [comment,setComment] = useState("");
  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState(false);

  const submitReview = async () => {

    if(!rating || !bookingId) return;

    try{

      setLoading(true);

      await createReview({
        bookingId,
        rating,
        comment
      });

      setSuccess(true);

      if(onSuccess){
        onSuccess();
      }

    }catch(err){

      alert(
        err?.response?.data?.message ||
        "Failed to submit review"
      );

    }finally{

      setLoading(false);

    }

  };

  if(success){
    return(

      <div className="p-8 border border-border dark:border-darkBorder rounded-2xl bg-surface dark:bg-darkSurface text-center space-y-4">

        <p className="text-lg font-semibold">
          Thank you for your review
        </p>

        <p className="text-sm text-secondaryText">
          Your feedback helps other customers discover great services.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">

          {vendorSlug && (
            <Link
              href={`/vendor/${vendorSlug}`}
              className="px-4 py-2 rounded-md bg-accent text-white text-sm hover:bg-accent/90"
            >
              Back to Vendor
            </Link>
          )}

          <Link
            href="/"
            className="px-4 py-2 rounded-md border border-border dark:border-darkBorder text-sm hover:bg-muted dark:hover:bg-darkSurface"
          >
            Go Home
          </Link>

        </div>

      </div>

    );
  }

  return(

    <div className="p-6 sm:p-8 border border-border dark:border-darkBorder rounded-2xl bg-surface dark:bg-darkSurface space-y-6">

      <h3 className="font-semibold text-lg text-center">
        Leave a Review
      </h3>

      <div className="flex justify-center gap-2">

        {[1,2,3,4,5].map((star)=>{

          const active = star <= rating;

          return(

            <button
              key={star}
              type="button"
              onClick={()=>setRating(star)}
              className={`text-3xl transition ${
                active
                ? "text-yellow-500"
                : "text-gray-300"
              }`}
            >
              ★
            </button>

          );

        })}

      </div>

      <textarea
        value={comment}
        onChange={(e)=>setComment(e.target.value)}
        placeholder="Share your experience..."
        className="w-full border border-border dark:border-darkBorder rounded-md p-3 text-sm bg-background dark:bg-darkBackground min-h-[120px]"
      />

      <button
        type="button"
        onClick={submitReview}
        disabled={loading || !rating}
        className="w-full px-4 py-2 rounded-md bg-accent text-white text-sm hover:bg-accent/90 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>

    </div>

  );

}