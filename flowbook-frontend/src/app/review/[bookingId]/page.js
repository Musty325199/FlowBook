"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReviewForm from "@/components/reviews/ReviewForm";
import { Moon, Sun } from "lucide-react";

export default function ReviewPage() {

  const { bookingId } = useParams();

  const [dark,setDark] = useState(false);

  const toggleDark = () => {

    const root = document.documentElement;

    if(root.classList.contains("dark")){
      root.classList.remove("dark");
      localStorage.setItem("theme","light");
      setDark(false);
    }else{
      root.classList.add("dark");
      localStorage.setItem("theme","dark");
      setDark(true);
    }

  };

  useEffect(()=>{

    const savedTheme = localStorage.getItem("theme");

    if(savedTheme === "dark"){
      document.documentElement.classList.add("dark");
      setDark(true);
    }

  },[]);

  return(

    <main className="min-h-screen flex items-center justify-center px-6 bg-background dark:bg-darkBackground">

      <div className="absolute top-6 right-6">

        <button
          onClick={toggleDark}
          className="p-2 rounded-lg border border-border dark:border-darkBorder hover:bg-muted dark:hover:bg-darkSurface transition"
        >
          {dark ? <Sun size={18}/> : <Moon size={18}/>}
        </button>

      </div>

      <div className="w-full max-w-lg">

        <ReviewForm bookingId={bookingId}/>

      </div>

    </main>

  );

}