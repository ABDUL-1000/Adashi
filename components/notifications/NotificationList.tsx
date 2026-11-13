"use client";

import {
  Bell,
  CircleDollarSign,
  HandCoins,
  Mail,
  ShoppingBag,
  Timer,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { formatDateTime } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationCategory } from "@/types/notification.types";

const categoryIcons: Record<NotificationCategory, LucideIcon> = {
  GROUP: Users,
  PAYMENT: CircleDollarSign,
  PAYOUT: HandCoins,
  REMINDER: Timer,
  INVITATION: Mail,
  PSS: ShoppingBag,
  GENERAL: Bell,
};

function timeAgo(iso: string, now: number) {
  const minutes = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDateTime(iso);
}

export function NotificationList({
  notifications,
  onOpen,
}: {
  notifications: AppNotification[];
  onOpen: (notification: AppNotification) => void;
}) {
  // Read the clock once when the list mounts, not on every render.
  const [now] = useState(() => Date.now());

  return (
    <ul className="grid gap-2">
      {notifications.map((notification) => {
        const Icon = categoryIcons[notification.category] ?? Bell;
        const unread = !notification.readAt;
        return (
          <li key={notification.id}>
            <button
              type="button"
              onClick={() => onOpen(notification)}
              className={cn(
                "flex min-h-16 w-full items-start gap-3 rounded-2xl border p-3 text-left transition hover:border-primary/30 hover:bg-primary-soft",
                unread ? "border-primary/20 bg-primary-soft/60" : "border-border-soft bg-white"
              )}
            >
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className={cn("text-sm text-foreground", unread ? "font-semibold" : "font-medium")}>
                    {notification.title}
                  </span>
                  {unread ? (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                  ) : null}
                </span>
                <span className="mt-0.5 block text-sm leading-5 text-muted-foreground">
                  {notification.content}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {timeAgo(notification.sentAt, now)}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
