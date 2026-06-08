"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetUsersResult, UserTab } from "@/lib/users/queries";

type UsersParams = { tab: UserTab; page: number; search: string };

type UsersResponse = Omit<GetUsersResult, "rows"> & {
  rows: Array<{ id: string; name: string; email: string; role: string | null; createdAt: string }>;
};

async function fetchUsers(params: UsersParams): Promise<UsersResponse> {
  const qs = new URLSearchParams({
    tab: params.tab,
    page: String(params.page),
    search: params.search,
  });
  const res = await fetch(`/api/users?${qs}`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json() as Promise<UsersResponse>;
}

export function useUsers(params: UsersParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => fetchUsers(params),
    staleTime: 30_000,
  });
}

export function useUpdateUserName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, name }: { userId: string; name: string }) =>
      fetch(`/api/users/${userId}/name`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to update name");
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useSetUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "user" | "admin" }) =>
      fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to update role");
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      fetch(`/api/users/${userId}`, { method: "DELETE" }).then((r) => {
        if (!r.ok) throw new Error("Failed to delete user");
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function usePromoteByEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) =>
      fetch("/api/users/promote-by-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then(async (r) => {
        if (!r.ok) {
          const body = (await r.json()) as { error?: string };
          throw new Error(body.error ?? "Something went wrong.");
        }
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
