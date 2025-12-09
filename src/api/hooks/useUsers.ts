import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { PageResponse } from "../services/alertService";
import type {
  CreateUserRequest,
  GroupUserDetail,
  GroupUserSummary,
  UpdateUserRequest,
} from "../services/userService";
import * as userService from "../services/userService";

// ============== CONFIG LISTADOS VIVOS ==============

const LIVE_LIST_QUERY_OPTIONS = {
  staleTime: 0,
  gcTime: 5 * 60 * 1000,
  refetchInterval: 2000,
  refetchIntervalInBackground: true,
} as const;

// ============== LIST / SEARCH ==============

export const useUsers = (params: {
  companyId?: number;
  q?: string;
  page?: number;
  size?: number;
}) => {
  return useQuery<PageResponse<GroupUserSummary>, Error>({
    queryKey: ["users", params],
    enabled: !!params.companyId, // solo dispara si hay companyId
    queryFn: () =>
      userService.searchUsers(
        params as {
          companyId: number;
          q?: string;
          page?: number;
          size?: number;
        },
      ),
    placeholderData: keepPreviousData,
    ...LIVE_LIST_QUERY_OPTIONS,
  });
};

// ============== READ ONE ==============

export const useUserById = (userId?: number) => {
  return useQuery<GroupUserDetail, Error>({
    queryKey: ["user", userId],
    enabled: !!userId,
    queryFn: () => userService.getUserById(userId as number),
  });
};

export const useUserByUsername = (username?: string) => {
  return useQuery<GroupUserDetail, Error>({
    queryKey: ["user", "by-username", username],
    enabled: !!username && username.trim().length > 0,
    queryFn: () => userService.getUserByUsername(username as string),
  });
};

// ============== CREATE ==============

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<GroupUserDetail, Error, { data: CreateUserRequest }>({
    mutationFn: (args) => userService.createUser(args.data),
    onSuccess: (_created, variables) => {
      // refresca listas de usuarios de la empresa
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({
        queryKey: ["users", { companyId: variables.data.companyId }],
      });
    },
  });
};

// ============== UPDATE ==============

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GroupUserDetail,
    Error,
    { companyId: number; userId: number; data: UpdateUserRequest }
  >({
    mutationFn: (args) =>
      userService.updateUser(args.companyId, args.userId, args.data),
    onSuccess: (_updated, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({
        queryKey: ["users", { companyId: variables.companyId }],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", variables.userId],
      });
    },
  });
};

// ============== DELETE ==============

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { companyId: number; userId: number }>({
    mutationFn: (args) => userService.deleteUser(args.companyId, args.userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({
        queryKey: ["users", { companyId: variables.companyId }],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", variables.userId],
      });
    },
  });
};
