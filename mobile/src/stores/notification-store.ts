import { create } from "zustand";
import { api, type Notification } from "@/lib/api";

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  fetchNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  clearNotifications: () => void;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  refreshing: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const notifications = await api.getNotifications();
      set({ notifications, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  refreshNotifications: async () => {
    set({ refreshing: true });
    try {
      const notifications = await api.getNotifications();
      set({ notifications, refreshing: false });
    } catch {
      set({ refreshing: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const data = await api.getUnreadCount();
      set({ unreadCount: data.count });
    } catch {
      // silent
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.markNotificationRead(id);
      const notifications = get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      const unreadCount = notifications.filter((n) => !n.read).length;
      set({ notifications, unreadCount });
    } catch {
      // silent
    }
  },

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
