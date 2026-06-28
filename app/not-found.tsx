import { ArrowLeft, Home, SearchX } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-page-bg px-4">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col">
        <header className="flex items-center justify-between py-5">
          <BrandLogo />
          <Button asChild variant="outline">
            <Link href="/login">Login</Link>
          </Button>
        </header>

        <section className="grid flex-1 place-items-center py-12">
          <div className="w-full max-w-xl rounded-[2rem] border border-border-soft bg-white p-6 text-center shadow-[0_30px_80px_rgba(32,33,39,0.08)] sm:p-10">
            <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary-soft text-primary">
              <SearchX className="size-8" />
            </div>
            <p className="mt-8 text-sm font-medium uppercase tracking-[0.18em] text-primary">
              404
            </p>
            <h1 className="mt-3 text-[30px] font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              Page not found
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">
              The page you are looking for may have moved, expired, or does not exist in this workspace.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/">
                  <Home className="size-4" />
                  Go home
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/member/dashboard">
                  <ArrowLeft className="size-4" />
                  Back to dashboard
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
