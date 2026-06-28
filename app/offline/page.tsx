import { RefreshCcw, WifiOff } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-page-bg px-4">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col">
        <header className="flex items-center justify-between py-5">
          <BrandLogo />
          <Button asChild variant="outline">
            <Link href="/">Home</Link>
          </Button>
        </header>

        <section className="grid flex-1 place-items-center py-12">
          <div className="w-full max-w-xl rounded-[2rem] border border-border-soft bg-white p-6 text-center shadow-[0_30px_80px_rgba(32,33,39,0.08)] sm:p-10">
            <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary-soft text-primary">
              <WifiOff className="size-8" />
            </div>
            <p className="mt-8 text-sm font-medium uppercase tracking-[0.18em] text-primary">
              Offline
            </p>
            <h1 className="mt-3 text-[30px] font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              You are not connected
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">
              Adashi needs an internet connection to sync groups, payments, wallet balances, and payout records.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/">
                  <RefreshCcw className="size-4" />
                  Try again
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Login when online</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
