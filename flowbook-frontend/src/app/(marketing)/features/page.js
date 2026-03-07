import Container from "@/components/ui/Container";
import { Calendar, Wallet, Scissors } from "lucide-react";

export const metadata = {
  title: "Features — FlowBook",
  description: "Explore FlowBook features built for modern barbers and salons."
};

export default function Features() {
  return (
    <main>
      <section className="py-24">
        <Container className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Powerful features built for serious salons
          </h1>
          <p className="text-secondaryText text-lg">
            Everything you need to manage bookings, accept payments, and grow your business professionally.
          </p>
        </Container>
      </section>

      <section className="py-20 border-t border-border dark:border-darkBorder">
        <Container className="grid md:grid-cols-2 gap-16 items-start">

          <div className="space-y-6">
            <div className="h-12 w-12 flex items-center justify-center rounded-md bg-accent/10 text-accent">
              <Calendar size={22} />
            </div>
            <h2 className="text-2xl font-semibold">
              Smart Booking System
            </h2>
            <p className="text-secondaryText">
              Automatic slot generation prevents double booking and simplifies appointment management.
            </p>
          </div>

          <div className="space-y-6">
            <div className="h-12 w-12 flex items-center justify-center rounded-md bg-accent/10 text-accent">
              <Wallet size={22} />
            </div>
            <h2 className="text-2xl font-semibold">
              Secure Payment Collection
            </h2>
            <p className="text-secondaryText">
              Customers pay upfront securely. You receive weekly payouts with full transparency.
            </p>
          </div>

          <div className="space-y-6">
            <div className="h-12 w-12 flex items-center justify-center rounded-md bg-accent/10 text-accent">
              <Scissors size={22} />
            </div>
            <h2 className="text-2xl font-semibold">
              Multi-Service Management
            </h2>
            <p className="text-secondaryText">
              Create multiple services with pricing and duration control for full flexibility.
            </p>
          </div>

        </Container>
      </section>
    </main>
  );
}