"use client";

import { cn } from "@/lib/utils";

export function Sidebar({ className, ...props }: React.ComponentProps<"aside">) {
  return (
    <aside
      data-slot="sidebar"
      className={cn("border-r border-sidebar-border bg-sidebar text-sidebar-foreground", className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-content" className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function SidebarMenu({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav data-slot="sidebar-menu" className={cn("grid gap-1", className)} {...props} />;
}
