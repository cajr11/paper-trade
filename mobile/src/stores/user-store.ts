import { create } from "zustand";
import { api, type UserProfile } from "@/lib/api";

type UserState = {
  user: UserProfile | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,

  fetchUser: async () => {
    set({ loading: true });
    try {
      const user = await api.getMe();
      set({ user, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  clearUser: () => set({ user: null }),
}));
