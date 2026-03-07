"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Container from "@/components/ui/Container";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function BookingSuccessPage() {

  const params = useSearchParams();
  const reference = params.get("reference");

  const [loading,setLoading] = useState(true);
  const [success,setSuccess] = useState(false);

  useEffect(()=>{

    const verifyPayment = async ()=>{

      try{

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/verify-booking`,
          {
            method:"POST",
            headers:{
              "Content-Type":"application/json"
            },
            body:JSON.stringify({ reference })
          }
        );

        if(res.ok){
          setSuccess(true);
        }

      }catch(err){
        console.error(err);
      }finally{
        setLoading(false);
      }

    };

    if(reference){
      verifyPayment();
    }

  },[reference]);

  if(loading){
    return(
      <div className="min-h-screen flex items-center justify-center">
        <Spinner/>
      </div>
    );
  }

  return(

    <main className="min-h-screen flex items-center justify-center px-6">

      <Container className="max-w-lg">

        {success ? (

          <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-2xl shadow-soft p-10 text-center space-y-4">

            <CheckCircle2 size={44} className="mx-auto text-green-600"/>

            <h2 className="text-2xl font-semibold">
              Booking Confirmed
            </h2>

            <p className="text-secondaryText text-sm">
              Your payment was successful and your booking has been created.
            </p>

            <Link
              href="/explore"
              className="text-accent text-sm hover:underline"
            >
              Continue browsing services
            </Link>

          </div>

        ) : (

          <div className="text-center space-y-3">

            <h2 className="text-xl font-semibold">
              Payment Verification Failed
            </h2>

            <p className="text-secondaryText text-sm">
              We could not verify your payment. Please contact support.
            </p>

          </div>

        )}

      </Container>

    </main>

  );

}