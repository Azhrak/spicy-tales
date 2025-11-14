import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { User } from "~/lib/api/types";

export const adminUsersQueryKey = ["adminUsers"] as const;

/**
 * Custom hook to fetch all users for admin management
 * Requires admin role
 */
export function useAdminUsersQuery(enabled = true) {
	return useQuery({
		queryKey: adminUsersQueryKey,
		queryFn: () => api.get<{ users: User[] }>("/api/admin/users"),
		enabled,
	});
}
