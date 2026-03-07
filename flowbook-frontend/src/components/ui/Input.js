"use client";

import clsx from "clsx";

export default function Input({ className, ...props }) {
  return (
    <input
      className={clsx(
        "w-full rounded-md border border-border bg-surface px-4 h-11 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-accentFocus",
        "dark:bg-darkSurface dark:border-darkBorder",
        className,
      )}
      {...props}
    />
  );
}
