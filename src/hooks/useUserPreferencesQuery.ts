import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { UserPreferences } from "~/lib/types/preferences";

interface PreferencesResponse {
	preferences: UserPreferences;
}

export const userPreferencesQueryKey = ["preferences"] as const;

/**
 * Custom hook to fetch the current user's preferences
 */
export function useUserPreferencesQuery() {
	return useQuery({
		queryKey: userPreferencesQueryKey,
		queryFn: async () => {
			return await api.get<PreferencesResponse>("/api/preferences");
		},
	});
}
