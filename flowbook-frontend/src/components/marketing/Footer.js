import Link from "next/link";
import Container from "@/components/ui/Container";

export default function Footer() {
  return (
    <footer className="border-t border-border dark:border-darkBorder py-16">
      <Container>
        <div className="grid md:grid-cols-4 gap-12 text-sm">
          <div className="space-y-4">
            <h3 className="font-semibold text-base">FlowBook</h3>
            <p className="text-secondaryText">
              Premium booking software built for Nigerian barbers and salons.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Product</h4>
            <Link
              href="/features"
              className="block text-secondaryText hover:text-accent"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="block text-secondaryText hover:text-accent"
            >
              Pricing
            </Link>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Company</h4>
            <Link
              href="/privacy"
              className="block text-secondaryText hover:text-accent"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="block text-secondaryText hover:text-accent"
            >
              Terms
            </Link>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Contact</h4>
            <p className="text-secondaryText">support@flowbook.ng</p>
          </div>
        </div>

        <div className="mt-16 text-xs text-secondaryText">
          © {new Date().getFullYear()} FlowBook. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
