import FaqAccordion from "@/components/marketing/FaqAccordion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { Check } from "lucide-react";

export const metadata = {
  title: "Pricing — FlowBook",
  description:
    "Simple subscription pricing for barbers and salons. No commission. Weekly payouts.",
};

export default function Pricing() {
  return (
    <>
      <main>
        {/* Header */}
        <section className="py-24">
          <Container className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Simple subscription pricing
            </h1>
            <p className="text-lg text-secondaryText max-w-2xl mx-auto">
              No commissions. No hidden fees. Choose a plan and start accepting
              bookings immediately.
            </p>
          </Container>
        </section>

        {/* Pricing Cards */}
        <section className="pb-28">
          <Container>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Monthly */}
              <div className="border border-border rounded-lg p-8 bg-surface dark:bg-darkSurface dark:border-darkBorder shadow-soft space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Monthly Plan</h2>
                  <p className="text-secondaryText text-sm">
                    Flexible subscription for growing salons.
                  </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">₦9,000</span>
                  <span className="text-secondaryText text-sm">/month</span>
                </div>

                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <Check size={18} className="text-accent mt-0.5" />
                    Unlimited bookings
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={18} className="text-accent mt-0.5" />
                    Secure Paystack payments
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={18} className="text-accent mt-0.5" />
                    Weekly payout tracking
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={18} className="text-accent mt-0.5" />
                    Booking calendar & slot management
                  </li>
                </ul>

                <Button className="w-full" size="lg">
                  Start Monthly Plan
                </Button>
              </div>

              {/* Yearly */}
              <div className="relative border border-border rounded-lg p-8 bg-surface dark:bg-darkSurface dark:border-darkBorder shadow-soft space-y-6">
                <div className="absolute top-4 right-4 text-xs font-semibold bg-accent text-white px-3 py-1 rounded-full">
                  2 months free
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Yearly Plan</h2>
                  <p className="text-secondaryText text-sm">
                    Best value for established salons.
                  </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">₦90,000</span>
                  <span className="text-secondaryText text-sm">/year</span>
                </div>

                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <Check size={18} className="text-accent mt-0.5" />
                    Everything in Monthly
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={18} className="text-accent mt-0.5" />
                    Priority support
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={18} className="text-accent mt-0.5" />
                    Advanced payout reporting
                  </li>
                </ul>

                <Button className="w-full" size="lg">
                  Start Yearly Plan
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-muted dark:bg-darkSurface/40 border-y border-border dark:border-darkBorder">
          <Container className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">
                Frequently asked questions
              </h2>
              <p className="text-secondaryText">
                Everything you need to know before subscribing.
              </p>
            </div>

            <FaqAccordion />
          </Container>
        </section>
      </main>
    </>
  );
}
