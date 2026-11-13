"use client";

import { CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/notifications/useNotifications";
import type { AppNotification } from "@/types/notification.types";

import { NotificationList } from "./NotificationList";

type Filter = "all" | "unread";

export function NotificationsView() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  if (isLoading) return <PageSkeleton />;

  const shown = filter === "unread" ? notifications.filter((n) => !n.readAt) : notifications;

  const openNotification = (notification: AppNotification) => {
    if (!notification.readAt) markRead.mutate(notification.id);
    if (notification.link) router.push(notification.link);
  };

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Notifications"
        description="Updates about your groups, payments, payouts and Pay Small Small plans."
        action={
          <Button
            variant="outline"
            className="min-h-11"
            disabled={!unreadCount || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck className="size-4" />
            Mark all as read
          </Button>
        }
      />

      <div className="flex gap-2" role="tablist" aria-label="Filter notifications">
        {(["all", "unread"] as const).map((value) => (
          <Button
            key={value}
            role="tab"
            aria-selected={filter === value}
            variant={filter === value ? "default" : "outline"}
            className="min-h-11"
            onClick={() => setFilter(value)}
          >
            {value === "all" ? "All" : `Unread${unreadCount ? ` (${unreadCount})` : ""}`}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-6">
          {isError ? (
            <EmptyState title="Could not load notifications" description="Check your connection and try again." />
          ) : shown.length ? (
            <NotificationList notifications={shown} onOpen={openNotification} />
          ) : (
            <EmptyState
              title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
              description="Payments, payouts, reminders and group updates will show here."
            />
          )}

          {hasNextPage ? (
            <Button
              variant="outline"
              className="min-h-11 justify-self-center"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? "Loading..." : "Load older notifications"}
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
