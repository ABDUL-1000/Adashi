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
  { label: "Home", icon: LayoutDashboard, paths: { member: "/member/dashboard", organizer: "/organizer/dashboard" } },
  { label: "Groups", icon: Users, paths: { member: "/member/groups", organizer: "/organizer/groups" } },
  { label: "Create", icon: PlusCircle, paths: { member: "/member/groups/create", organizer: "/organizer/groups/create" } },
  { label: "Pay", icon: CreditCard, paths: { member: "/member/payments", organizer: "/organizer/payments" } },
  { label: "Wallet", icon: Wallet, paths: { member: "/member/wallet", organizer: "/member/wallet" } },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const role = pathname.startsWith("/organizer") ? "organizer" : "member";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-border-soft bg-white px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-18px_45px_rgba(32,33,39,0.08)] lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const href = item.paths[role];
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
