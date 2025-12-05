// src/hooks/useGroups.ts
import { useQuery } from "@tanstack/react-query";
import { getGroups } from "../api/groupService";

type UseGroupsParams = {
  q?: string;
  page?: number;
  size?: number;
};

export function useGroups(params: UseGroupsParams = {}) {
  return useQuery({
    queryKey: ["groups", params],
    queryFn: () => getGroups(params),
  });
}
