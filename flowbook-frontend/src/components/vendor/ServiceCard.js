import Link from "next/link";

export default function ServiceCard({ service, slug }) {
  const imageSrc =
    service.image && service.image !== "undefined"
      ? service.image
      : null;

  return (
    <div className="group overflow-hidden rounded-2xl border border-border dark:border-darkBorder bg-surface dark:bg-darkSurface transition hover:shadow-xl hover:-translate-y-1 flex flex-col">

      {imageSrc && (
        <div className="relative h-40 w-full overflow-hidden">
          <img
            src={imageSrc}
            alt={service.name}
            className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">

        <h3 className="font-semibold text-base sm:text-lg leading-tight line-clamp-2">
          {service.name}
        </h3>

        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-accent whitespace-nowrap">
            ₦{service.price}
          </span>

          <span className="text-secondaryText whitespace-nowrap">
            {service.duration} mins
          </span>
        </div>

        {service.description && (
          <p className="text-sm text-secondaryText line-clamp-2">
            {service.description}
          </p>
        )}

        <Link
          href={`/book/${slug}?service=${service._id}`}
          className="mt-2 text-center px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition whitespace-nowrap"
        >
          Book Appointment
        </Link>

      </div>
    </div>
  );
}