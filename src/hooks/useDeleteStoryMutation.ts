import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook to handle story deletion
 * Automatically invalidates user-stories queries on success
 */
export function useDeleteStoryMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (storyId: string) => {
			const response = await fetch(`/api/stories/${storyId}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete story");
			}
			return response.json();
		},
		onSuccess: () => {
			// Invalidate and refetch stories
			queryClient.invalidateQueries({ queryKey: ["user-stories"] });
		},
	});
}
