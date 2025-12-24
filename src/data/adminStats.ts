// src/data/adminStats.ts

export interface UserStats {
  totalUsers: number;
  activeToday: number;
  newThisWeek: number;
  newThisMonth: number;
  recentUsers: Array<{
    id: string;
    username: string;
    created_at: string;
    last_seen: string;
  }>;
}

export const initialAdminStats: UserStats = {
  totalUsers: 0,
  activeToday: 0,
  newThisWeek: 0,
  newThisMonth: 0,
  recentUsers: [],
};