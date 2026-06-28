"use client";

import { Bell, LogOut, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/shared/BrandLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/auth/useLogout";
import { useAuthStore } from "@/store/authStore";

function titleFromPath(pathname: string) {
  const segment = pathname.split("/").filter(Boolean).at(-1) ?? "dashboard";
  if (segment.length > 20) return "Group details";
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function DashboardHeader() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "AD";

  return (
    <header className="sticky top-0 z-30 border-b border-border-soft bg-page-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          <BrandLogo href={pathname.startsWith("/organizer") ? "/organizer/dashboard" : "/member/dashboard"} />
        </div>
        <div className="hidden min-w-0 lg:block">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
            Adashi workspace
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            {titleFromPath(pathname)}
          </h2>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Search">
            <Search className="size-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>
          <div className="hidden items-center gap-3 rounded-2xl border border-border-soft bg-white px-3 py-2 sm:flex">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary-soft text-xs font-medium text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <p className="text-sm font-medium text-foreground">{user?.name ?? "Adashi user"}</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? "Dashboard"}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
