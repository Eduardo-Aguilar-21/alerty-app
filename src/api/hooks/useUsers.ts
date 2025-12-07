// src/api/hooks/useUsers.ts
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

// ============== LIST / SEARCH ==============

export const useUsers = (params: {
  groupId?: number;
  q?: string;
  page?: number;
  size?: number;
}) => {
  return useQuery<PageResponse<GroupUserSummary>, Error>({
    queryKey: ["group-users", params],
    enabled: !!params.groupId, // solo dispara si hay groupId
    queryFn: () =>
      userService.searchUsers(
        params as {
          groupId: number;
          q?: string;
          page?: number;
          size?: number;
        }
      ),
    placeholderData: keepPreviousData,
  });
};

// ============== READ ONE ==============
// Puede usar solo userId, o userId + groupId (backend soporta ambos)

export const useUserById = (params: { userId?: number; groupId?: number }) => {
  const { groupId, userId } = params;

  return useQuery<GroupUserDetail, Error>({
    queryKey: ["group-user", params],
    enabled: !!userId, // con solo userId ya vale
    queryFn: () => userService.getUserById(userId as number, groupId),
  });
};

// ============== CREATE ==============

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { groupId: number; data: CreateUserRequest }) =>
      userService.createUser(args.groupId, args.data),
    onSuccess: (_created, variables) => {
      // refresca listas de usuarios del grupo
      queryClient.invalidateQueries({
        queryKey: ["group-users"],
      });
      queryClient.invalidateQueries({
        queryKey: ["group-users", { groupId: variables.groupId }],
      });
    },
  });
};

// ============== UPDATE ==============

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: {
      groupId: number;
      userId: number;
      data: UpdateUserRequest;
    }) =>
      userService.updateUser(args.groupId, args.userId, args.data),
    onSuccess: (_updated, variables) => {
      queryClient.invalidateQueries({ queryKey: ["group-users"] });
      queryClient.invalidateQueries({
        queryKey: [
          "group-user",
          {
            groupId: variables.groupId,
            userId: variables.userId,
          },
        ],
      });
    },
  });
};

// ============== DELETE ==============

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { groupId: number; userId: number }) =>
      userService.deleteUser(args.groupId, args.userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["group-users"] });
      queryClient.invalidateQueries({
        queryKey: [
          "group-user",
          {
            groupId: variables.groupId,
            userId: variables.userId,
          },
        ],
      });
    },
  });
};
