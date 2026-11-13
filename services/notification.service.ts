import api from "./api";
import type {
  NotificationActionResponse,
  NotificationsResponse,
} from "@/types/notification.types";

export const notificationService = {
  list: async (params: { limit?: number; before?: string | null } = {}) => {
    return api.get<NotificationsResponse, NotificationsResponse>("/notifications", {
      params: { limit: params.limit ?? 20, ...(params.before ? { before: params.before } : {}) },
    });
  },
  markRead: async (id: string) => {
    return api.post<NotificationActionResponse, NotificationActionResponse>(
      `/notifications/${id}/read`
    );
  },
  markAllRead: async () => {
    return api.post<NotificationActionResponse, NotificationActionResponse>(
      "/notifications/read-all"
    );
  },
};
