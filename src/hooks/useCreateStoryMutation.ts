import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { UserPreferences } from "~/lib/types/preferences";
import { existingStoriesQueryKey } from "./useExistingStoriesQuery";

interface CreateStoryData {
	templateId: string;
	storyTitle?: string;
	preferences: UserPreferences;
}

export const createStoryMutationKey = ["createStory"] as const;

/**
 * Custom hook to create a new story
 * Automatically invalidates related queries on success
 */
export function useCreateStoryMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: createStoryMutationKey,
		mutationFn: async (data: CreateStoryData) => {
			return await api.post<{ story: { id: string } }>("/api/stories", {
				templateId: data.templateId,
				storyTitle: data.storyTitle?.trim() || undefined,
				preferences: data.preferences,
			});
		},
		onSuccess: (_data, _variables) => {
			// Invalidate user stories cache to refresh library
			queryClient.invalidateQueries({ queryKey: ["user-stories"] });
			// Invalidate existing stories cache
			queryClient.invalidateQueries({ queryKey: existingStoriesQueryKey });
		},
	});
}
