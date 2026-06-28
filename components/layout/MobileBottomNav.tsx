"use client";

import {
  CreditCard,
  LayoutDashboard,
  PlusCircle,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { label: "Home", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Groups", icon: Users, href: "/groups" },
  { label: "Create", icon: PlusCircle, href: "/groups/create" },
  { label: "Pay", icon: CreditCard, href: "/payments" },
  { label: "Wallet", icon: Wallet, href: "/wallet" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-border-soft bg-white px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-18px_45px_rgba(32,33,39,0.08)] lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const href = item.href;
          const Icon = item.icon;
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium text-muted-foreground transition",
                active && "bg-primary-soft text-primary"
              )}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
