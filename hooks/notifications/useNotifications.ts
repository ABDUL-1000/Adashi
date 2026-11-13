import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { notificationService } from "@/services/notification.service";
import type { NotificationsResponse } from "@/types/notification.types";

type NotificationsCache = InfiniteData<NotificationsResponse, string | null>;

/** Newest notifications first; checks for new ones every minute while the app is open. */
export function useNotifications() {
  const query = useInfiniteQuery({
    queryKey: queryKeys.notifications,
    queryFn: ({ pageParam }) => notificationService.list({ before: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.data.nextBefore,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const pages = query.data?.pages ?? [];
  return {
    ...query,
    notifications: pages.flatMap((page) => page.data.items),
    unreadCount: pages[0]?.data.unreadCount ?? 0,
  };
}

/** Update the cached list straight away so the badge and dots change without waiting. */
function markInCache(
  data: NotificationsCache | undefined,
  isTarget: (id: string) => boolean,
  readCount: number
): NotificationsCache | undefined {
  if (!data) return data;
  const now = new Date().toISOString();
  return {
    ...data,
    pages: data.pages.map((page, index) => ({
      ...page,
      data: {
        ...page.data,
        unreadCount: index === 0 ? Math.max(0, page.data.unreadCount - readCount) : page.data.unreadCount,
        items: page.data.items.map((item) =>
          isTarget(item.id) && !item.readAt ? { ...item, readAt: now } : item
        ),
      },
    })),
  };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications });
      queryClient.setQueryData<NotificationsCache>(queryKeys.notifications, (data) => {
        const wasUnread = data?.pages.some((page) =>
          page.data.items.some((item) => item.id === id && !item.readAt)
        );
        return markInCache(data, (itemId) => itemId === id, wasUnread ? 1 : 0);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications });
      queryClient.setQueryData<NotificationsCache>(queryKeys.notifications, (data) =>
        markInCache(data, () => true, Number.MAX_SAFE_INTEGER)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}
