import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import { userPreferencesQueryKey } from "./useUserPreferencesQuery";
import type { UserPreferences } from "~/lib/types/preferences";

export const updatePreferencesMutationKey = ["updatePreferences"] as const;

/**
 * Custom hook to update user preferences
 * Automatically invalidates the preferences query on success
 */
export function useUpdatePreferencesMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: updatePreferencesMutationKey,
		mutationFn: async (preferences: UserPreferences) => {
			await api.post("/api/preferences", preferences);
		},
		onSuccess: () => {
			// Invalidate preferences query to refetch latest data
			queryClient.invalidateQueries({ queryKey: userPreferencesQueryKey });
		},
	});
}
