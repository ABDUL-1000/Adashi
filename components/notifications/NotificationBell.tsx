"use client";

import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/notifications/useNotifications";
import type { AppNotification } from "@/types/notification.types";

import { NotificationList } from "./NotificationList";

const SHEET_LIMIT = 15;

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { notifications, unreadCount, isLoading, isError } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const openNotification = (notification: AppNotification) => {
    if (!notification.readAt) markRead.mutate(notification.id);
    if (notification.link) {
      setOpen(false);
      router.push(notification.link);
    }
  };

  const badge = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
        >
          <Bell className="size-4" />
          {unreadCount ? (
            <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
              {badge}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full gap-0 bg-page-bg data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="border-b border-border-soft pr-12">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            {unreadCount ? `${unreadCount} unread` : "You're all caught up"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="grid gap-2">
              {[0, 1, 2].map((key) => (
                <Skeleton key={key} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState title="Could not load notifications" description="Check your connection and try again." />
          ) : notifications.length ? (
            <NotificationList
              notifications={notifications.slice(0, SHEET_LIMIT)}
              onOpen={openNotification}
            />
          ) : (
            <EmptyState
              title="No notifications yet"
              description="Payments, payouts, reminders and group updates will show here."
            />
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border-soft p-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
          <Button
            variant="outline"
            className="min-h-11 flex-1"
            disabled={!unreadCount || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck className="size-4" />
            Mark all as read
          </Button>
          <Button asChild className="min-h-11 flex-1">
            <Link href="/notifications" onClick={() => setOpen(false)}>
              View all
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
