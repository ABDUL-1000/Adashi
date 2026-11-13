import type { ApiResponse } from "./api.types";

export type NotificationCategory =
  | "GROUP"
  | "PAYMENT"
  | "PAYOUT"
  | "REMINDER"
  | "INVITATION"
  | "PSS"
  | "GENERAL";

export type AppNotification = {
  id: string;
  title: string;
  content: string;
  category: NotificationCategory;
  link: string | null;
  readAt: string | null;
  sentAt: string;
};

export type NotificationPage = {
  items: AppNotification[];
  unreadCount: number;
  nextBefore: string | null;
};

export type NotificationsResponse = ApiResponse<NotificationPage>;
export type NotificationActionResponse = ApiResponse<unknown>;
