"use client";

import {
  Bell,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Wallet,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/auth/useLogout";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, paths: { member: "/member/dashboard", organizer: "/organizer/dashboard" } },
  { label: "Groups", icon: Users, paths: { member: "/member/groups", organizer: "/organizer/groups" } },
  { label: "Payments", icon: CreditCard, paths: { member: "/member/payments", organizer: "/organizer/payments" } },
  { label: "Payouts", icon: WalletCards, paths: { member: "/member/payouts", organizer: "/organizer/payouts" } },
  { label: "Wallet", icon: Wallet, paths: { member: "/member/wallet", organizer: "/member/wallet" } },
  { label: "Reminders", icon: Bell, paths: { member: "/organizer/reminders", organizer: "/organizer/reminders" } },
  { label: "Settings", icon: Settings, paths: { member: "/member/settings", organizer: "/organizer/settings" } },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const logout = useLogout();
  const role = pathname.startsWith("/organizer") ? "organizer" : "member";

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border-soft bg-white px-4 py-5 lg:flex lg:flex-col">
      <BrandLogo href={`/${role}/dashboard`} />
      <nav className="mt-8 grid gap-1.5">
        {navItems.map((item) => {
          const href = item.paths[role];
          const Icon = item.icon;
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-muted-foreground transition hover:bg-primary-soft hover:text-primary",
                active && "bg-primary-soft text-primary"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl bg-primary-soft p-4">
        <p className="text-sm font-medium text-foreground">Need a new cycle?</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Create a group and let Adashi handle reminders, wallets, and payout records.
        </p>
      </div>
      <Button variant="outline" className="mt-4 justify-start" onClick={logout}>
        <LogOut className="size-4" />
        Logout
      </Button>
    </aside>
  );
}

export { DashboardSidebar as DashboardSideBar };
