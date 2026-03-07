"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    if (saved === "dark") {
      document.documentElement.classList.add("dark")
      setDark(true)
    }
  }, [])

  const toggle = () => {
    if (dark) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setDark(false)
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setDark(true)
    }
  }

  return (
    <button
      onClick={toggle}
      className="h-10 w-10 rounded-md flex items-center justify-center border border-border bg-surface hover:bg-muted transition-all duration-200 dark:bg-darkSurface dark:border-darkBorder"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}