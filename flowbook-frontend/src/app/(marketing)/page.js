import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { Scissors, Calendar, Wallet, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <>
      <main>

        <section className="py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />

          <Container className="text-center space-y-8 relative">
            <p className="text-sm font-semibold text-accent tracking-[0.12em] uppercase">
              Built for Nigerian Barbers & Salons
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Premium Booking Software
              <br />
              Without Commission Fees
            </h1>

            <p className="text-lg text-secondaryText max-w-2xl mx-auto">
              Manage bookings, collect payments securely with Paystack, and
              receive structured weekly payouts — all in one clean system.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg">Start Free Trial</Button>
              </Link>

              <Link href="/pricing">
                <Button variant="secondary" size="lg">
                  View Pricing
                </Button>
              </Link>

              <Link href="/explore">
                <Button variant="secondary" size="lg">
                  Explore Barbers
                </Button>
              </Link>
            </div>

            <p className="text-sm text-secondaryText pt-4">
              Trusted by barbershops across Lagos, Abuja and Ibadan
            </p>
          </Container>
        </section>

        <section className="py-24 bg-muted dark:bg-darkSurface/40 border-y border-border dark:border-darkBorder">
          <Container>
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl font-semibold">
                Everything your salon needs to operate professionally
              </h2>
              <p className="text-secondaryText">
                Designed to help you reduce no-shows, automate payments, and
                manage your business efficiently.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-10">
              <div className="space-y-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-md bg-accent/10 text-accent">
                  <Calendar size={22} />
                </div>
                <h3 className="text-lg font-semibold">
                  Smart Booking Calendar
                </h3>
                <p className="text-secondaryText text-sm">
                  Automatically generate available slots and prevent double
                  bookings.
                </p>
              </div>

              <div className="space-y-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-md bg-accent/10 text-accent">
                  <Wallet size={22} />
                </div>
                <h3 className="text-lg font-semibold">Secure Payments</h3>
                <p className="text-secondaryText text-sm">
                  Customers pay upfront through Paystack — no commission taken.
                </p>
              </div>

              <div className="space-y-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-md bg-accent/10 text-accent">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="text-lg font-semibold">Deposit Protection</h3>
                <p className="text-secondaryText text-sm">
                  Prevent no-shows by requiring payment before bookings are confirmed.
                </p>
              </div>

              <div className="space-y-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-md bg-accent/10 text-accent">
                  <Scissors size={22} />
                </div>
                <h3 className="text-lg font-semibold">Weekly Payouts</h3>
                <p className="text-secondaryText text-sm">
                  Transparent weekly payout tracking with full reporting.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-28">
          <Container className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                A dashboard designed for clarity
              </h2>
              <p className="text-secondaryText text-lg">
                Track appointments, monitor weekly revenue, and manage payouts
                from a clean, distraction-free interface.
              </p>

              <ul className="space-y-3 text-sm text-secondaryText">
                <li>• Real-time appointment overview</li>
                <li>• Weekly payout summaries</li>
                <li>• Subscription status tracking</li>
              </ul>
            </div>

            <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl shadow-soft overflow-hidden">
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border dark:border-darkBorder">
                <h3 className="text-sm font-semibold">Dashboard Overview</h3>
                <span className="text-xs text-secondaryText">This Week</span>
              </div>

              <div className="p-5 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-muted dark:bg-darkSurface/60 rounded-lg p-4 space-y-2">
                    <p className="text-xs text-secondaryText">Appointments</p>
                    <p className="text-xl font-semibold">28</p>
                  </div>

                  <div className="bg-muted dark:bg-darkSurface/60 rounded-lg p-4 space-y-2">
                    <p className="text-xs text-secondaryText">Revenue</p>
                    <p className="text-xl font-semibold">₦184,000</p>
                  </div>

                  <div className="bg-muted dark:bg-darkSurface/60 rounded-lg p-4 space-y-2">
                    <p className="text-xs text-secondaryText">Next Payout</p>
                    <p className="text-xl font-semibold">Friday</p>
                  </div>
                </div>
                                <div className="space-y-4">
                  <p className="text-xs font-medium text-secondaryText uppercase tracking-wide">
                    Upcoming Appointments
                  </p>

                  <div className="bg-muted dark:bg-darkSurface/60 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Haircut + Beard</p>
                      <p className="text-xs text-secondaryText">
                        Today • 4:00 PM
                      </p>
                    </div>
                    <span className="text-xs text-accent font-medium">
                      Confirmed
                    </span>
                  </div>

                  <div className="bg-muted dark:bg-darkSurface/60 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Premium Fade</p>
                      <p className="text-xs text-secondaryText">
                        Tomorrow • 11:30 AM
                      </p>
                    </div>
                    <span className="text-xs text-accent font-medium">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-28 bg-muted dark:bg-darkSurface/40 border-y border-border dark:border-darkBorder">
          <Container className="space-y-20">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                How FlowBook works
              </h2>
              <p className="text-secondaryText">
                From booking to payout — fully automated and structured.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="space-y-4">
                <span className="text-accent font-semibold text-sm tracking-wide">
                  STEP 01
                </span>
                <h3 className="text-xl font-semibold">Customer books online</h3>
                <p className="text-secondaryText text-sm leading-relaxed">
                  Clients choose service, date, and time from your branded
                  booking page.
                </p>
              </div>

              <div className="space-y-4">
                <span className="text-accent font-semibold text-sm tracking-wide">
                  STEP 02
                </span>
                <h3 className="text-xl font-semibold">
                  Payment is secured instantly
                </h3>
                <p className="text-secondaryText text-sm leading-relaxed">
                  Payments are processed securely through Paystack before
                  confirmation.
                </p>
              </div>

              <div className="space-y-4">
                <span className="text-accent font-semibold text-sm tracking-wide">
                  STEP 03
                </span>
                <h3 className="text-xl font-semibold">Weekly payout</h3>
                <p className="text-secondaryText text-sm leading-relaxed">
                  Revenue is tracked and paid out every Friday with full
                  transparency.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-28">
          <Container className="space-y-20">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Discover barbers near you
              </h2>
              <p className="text-secondaryText">
                Browse professional salons and book services instantly through FlowBook.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 shadow-soft space-y-3">
                <p className="text-sm font-semibold">Premium Fade</p>
                <p className="text-secondaryText text-xs">30 mins • ₦5,000</p>
                <Link href="/services">
                  <span className="text-accent text-sm font-medium hover:underline">
                    Browse Services
                  </span>
                </Link>
              </div>

              <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 shadow-soft space-y-3">
                <p className="text-sm font-semibold">Haircut + Beard</p>
                <p className="text-secondaryText text-xs">45 mins • ₦7,000</p>
                <Link href="/services">
                  <span className="text-accent text-sm font-medium hover:underline">
                    Browse Services
                  </span>
                </Link>
              </div>

              <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 shadow-soft space-y-3">
                <p className="text-sm font-semibold">Luxury Grooming</p>
                <p className="text-secondaryText text-xs">60 mins • ₦10,000</p>
                <Link href="/services">
                  <span className="text-accent text-sm font-medium hover:underline">
                    Browse Services
                  </span>
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-28 bg-muted dark:bg-darkSurface/40 border-y border-border dark:border-darkBorder">
          <Container className="space-y-16">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Why salons switch to FlowBook
              </h2>
              <p className="text-secondaryText">
                Traditional booking methods are messy. FlowBook brings structure.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-8 shadow-soft space-y-4">
                <h3 className="font-semibold text-lg">WhatsApp Booking</h3>
                <ul className="text-sm text-secondaryText space-y-2">
                  <li>• Appointments easily forgotten</li>
                  <li>• No payment protection</li>
                  <li>• Difficult schedule tracking</li>
                </ul>
              </div>

              <div className="bg-surface dark:bg-darkSurface border border-accent rounded-xl p-8 shadow-soft space-y-4">
                <h3 className="font-semibold text-lg">FlowBook System</h3>
                <ul className="text-sm text-secondaryText space-y-2">
                  <li>• Automated booking calendar</li>
                  <li>• Secure payment before booking</li>
                  <li>• Weekly payout and revenue tracking</li>
                </ul>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-28">
          <Container className="space-y-12 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Trusted by growing barbershops
            </h2>

            <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-8 shadow-soft">
              <p className="text-lg text-secondaryText">
                “FlowBook helped me reduce missed appointments and finally
                organize my bookings professionally.”
              </p>

              <p className="text-sm font-semibold mt-4">
                Tunde Adebayo • Lagos Barber
              </p>
            </div>
          </Container>
        </section>

        <section className="py-28">
          <Container className="text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Simple subscription. No commission.
            </h2>

            <p className="text-secondaryText text-lg">
              Choose a monthly or yearly plan and start accepting bookings
              immediately.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/pricing">
                <Button size="lg">View Pricing</Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </Container>
        </section>

        <section className="py-24 bg-accent text-white text-center">
          <Container className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to modernize your salon?
            </h2>

            <p className="text-white/80 max-w-xl mx-auto">
              Join growing salons across Nigeria using FlowBook to manage
              bookings professionally.
            </p>

            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-accent border-white hover:bg-white/90 mt-4"
              >
                Get Started Today
              </Button>
            </Link>
          </Container>
        </section>

      </main>
    </>
  );
}