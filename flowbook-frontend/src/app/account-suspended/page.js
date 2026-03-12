"use client";

import Link from "next/link";
import { ShieldAlert, Mail } from "lucide-react";

export default function AccountSuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-darkBackground px-4">
      <div className="max-w-md w-full bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-8 text-center space-y-6">

        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center">
            <ShieldAlert size={26} className="text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold">
            Account Suspended
          </h1>

          <p className="text-sm text-secondaryText">
            Your FlowBook account has been suspended by the admin team.
            If you believe this is an error please contact support.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-accent">
          <Mail size={16} />
          support@flowbook.com
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="text-sm underline hover:text-accent"
          >
            Return to homepage
          </Link>
        </div>

      </div>
    </div>
  );
}