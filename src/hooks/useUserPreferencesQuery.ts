import { useQuery } from "@tanstack/react-query";
import type { UserPreferences } from "~/lib/types/preferences";

interface PreferencesResponse {
	preferences: UserPreferences;
}

/**
 * Custom hook to fetch the current user's preferences
 */
export function useUserPreferencesQuery() {
	return useQuery({
		queryKey: ["preferences"],
		queryFn: async () => {
			const response = await fetch("/api/preferences", {
				credentials: "include",
			});
			if (!response.ok) throw new Error("Failed to fetch preferences");
			return response.json() as Promise<PreferencesResponse>;
		},
	});
}
