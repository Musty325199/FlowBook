"use client";

import { forwardRef } from "react";
import clsx from "clsx";

const Button = forwardRef(
  (
    { children, variant = "primary", size = "md", className, ...props },
    ref,
  ) => {
    const base =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accentFocus disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
      primary: "bg-accent text-white hover:bg-accentHover shadow-soft",

      secondary:
        "border border-border bg-surface text-primaryText hover:bg-muted dark:bg-darkSurface dark:border-darkBorder dark:text-darkPrimaryText",

      ghost: "text-primaryText hover:bg-muted dark:text-darkPrimaryText",

      danger: "bg-danger text-white hover:opacity-90",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-5 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
