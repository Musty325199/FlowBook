import clsx from "clsx";

export function Card({ children, className }) {
  return (
    <div
      className={clsx(
        "bg-surface rounded-lg shadow-soft border border-border p-6",
        "dark:bg-darkSurface dark:border-darkBorder",
        className,
      )}
    >
      {children}
    </div>
  );
}
