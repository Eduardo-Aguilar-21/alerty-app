// src/api/groupService.ts
import { http } from "./http";

export type Group = {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  active: boolean;
  usersCount: number;
  alertsLast24h: number;
};

export type PagedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export async function getGroups(params?: { q?: string; page?: number; size?: number; }) {
  const res = await http.get<PagedResponse<Group>>("/api/groups", {
    params,
  });
  return res.data;
}
