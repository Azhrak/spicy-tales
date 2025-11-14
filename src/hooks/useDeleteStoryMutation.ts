import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";

export const deleteStoryMutationKey = ["deleteStory"] as const;

/**
 * Custom hook to handle story deletion
 * Automatically invalidates user-stories queries on success
 */
export function useDeleteStoryMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: deleteStoryMutationKey,
		mutationFn: async (storyId: string) => {
			return await api.delete(`/api/stories/${storyId}`);
		},
		onSuccess: () => {
			// Invalidate and refetch stories
			queryClient.invalidateQueries({ queryKey: ["user-stories"] });
		},
	});
}
