import Link from "next/link";
import { ArrowRight, Bell, CreditCard, ShieldCheck, WalletCards } from "lucide-react";

import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";

export default function Home() {
  const features = [
    { title: "Payment tracking", icon: CreditCard, text: "See contribution records, statuses, and dates without chasing spreadsheets." },
    { title: "Automatic reminders", icon: Bell, text: "Reminder windows stay attached to each group, keeping members ahead of due dates." },
    { title: "Wallet auto-deduction", icon: WalletCards, text: "Members can keep balances ready for contribution cycles and reduce missed payments." },
    { title: "Transparent payouts", icon: ShieldCheck, text: "Payout order, cycles, payments, and payout ledgers live in one shared view." },
  ];

  return (
    <main className="min-h-screen bg-page-bg">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#f5f5f5_45%,#cfacec3d_100%)] px-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between py-5">
          <BrandLogo />
          <Button asChild variant="outline">
            <Link href="/login">Login</Link>
          </Button>
        </div>
        <div className="mx-auto grid max-w-6xl gap-10 pb-14 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-20">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              Modern contribution management
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-[56px]">
              Adashi
            </h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Create trusted contribution groups, fund wallets, automate reminders, and track every payout from one polished dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Get started <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Open dashboard</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-[2rem] border border-border-soft bg-white p-4 shadow-[0_30px_80px_rgba(32,33,39,0.10)]">
            <div className="rounded-[1.5rem] bg-page-bg p-4">
              <div className="rounded-2xl bg-primary p-5 text-white">
                <p className="text-sm text-white/75">Wallet balance</p>
                <p className="mt-3 text-4xl font-bold leading-tight">NGN 248,000</p>
                <p className="mt-2 text-sm text-white/75">Ready for next cycle</p>
              </div>
              <div className="mt-4 grid gap-3">
                {["Market Women Circle", "Tech Friends Pool", "Family Support"].map((name, index) => (
                  <div key={name} className="flex items-center justify-between rounded-2xl bg-white p-4">
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-muted-foreground">Cycle {index + 1} due soon</p>
                    </div>
                    <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">ACTIVE</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto -mt-4 grid max-w-6xl gap-4 px-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <article key={feature.title} className="rounded-2xl border border-border-soft bg-white p-5 shadow-[0_18px_45px_rgba(32,33,39,0.06)]">
              <div className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="size-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold leading-7">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
}
