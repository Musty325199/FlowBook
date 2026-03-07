import clsx from "clsx";

export default function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-muted text-secondaryText",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
  };

  return (
    <span
      className={clsx(
        "px-2.5 py-1 text-xs font-medium rounded-md",
        variants[variant],
      )}
    >
      {children}
    </span>
  );
}
