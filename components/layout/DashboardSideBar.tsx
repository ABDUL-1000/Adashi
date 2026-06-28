"use client";

import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  PlusCircle,
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
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Groups", icon: Users, href: "/groups" },
  { label: "Create Group", icon: PlusCircle, href: "/groups/create" },
  { label: "Payments", icon: CreditCard, href: "/payments" },
  { label: "Payouts", icon: WalletCards, href: "/payouts" },
  { label: "Wallet", icon: Wallet, href: "/wallet" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border-soft bg-white px-4 py-5 lg:flex lg:flex-col">
      <BrandLogo href="/dashboard" />
      <nav className="mt-8 grid gap-1.5">
        {navItems.map((item) => {
          const href = item.href;
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
