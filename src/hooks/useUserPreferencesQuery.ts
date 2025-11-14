import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { UserPreferences } from "~/lib/types/preferences";

interface PreferencesResponse {
	preferences: UserPreferences | string;
}

export const userPreferencesQueryKey = ["preferences"] as const;

/**
 * Custom hook to fetch the current user's preferences
 * Handles parsing if preferences are stored as JSON string
 */
export function useUserPreferencesQuery() {
	return useQuery({
		queryKey: userPreferencesQueryKey,
		queryFn: async () => {
			const data = await api.get<PreferencesResponse>("/api/preferences");

			if (!data.preferences) {
				return null;
			}

			// Parse the preferences if they're stored as JSON string
			const prefs =
				typeof data.preferences === "string"
					? JSON.parse(data.preferences)
					: data.preferences;

			return {
				genres: prefs.genres || [],
				tropes: prefs.tropes || [],
				spiceLevel: prefs.spiceLevel || 3,
				pacing: prefs.pacing || "slow-burn",
				sceneLength: prefs.sceneLength || "medium",
			} as UserPreferences;
		},
	});
}
