import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { UserRole } from "~/lib/db/types";

export interface CurrentUser {
	id: string;
	role: UserRole;
}

export const currentUserQueryKey = ["currentUser"] as const;

/**
 * Custom hook to fetch the current user's profile data
 * Returns null if the user is not authenticated
 */
export function useCurrentUserQuery() {
	return useQuery({
		queryKey: currentUserQueryKey,
		queryFn: async () => {
			try {
				return await api.get<CurrentUser>("/api/profile");
			} catch (error) {
				// Return null for unauthenticated users
				return null;
			}
		},
	});
}
