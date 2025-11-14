import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { UserRole } from "~/lib/db/types";
import type { UserPreferences } from "~/lib/types/preferences";

export const profileQueryKey = ["profile"] as const;

export interface UserProfile {
	name: string;
	email: string;
	role: UserRole;
	createdAt: string;
	preferences: UserPreferences;
}

/**
 * Custom hook to fetch the current user's profile data
 * Returns null if the user is not authenticated
 */
export function useProfileQuery() {
	return useQuery({
		queryKey: profileQueryKey,
		queryFn: async () => {
			try {
				return await api.get<UserProfile>("/api/profile");
			} catch (_error) {
				// Return null for unauthenticated users
				return null;
			}
		},
	});
}
