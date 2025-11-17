import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import { adminTropesQueryKey, tropesQueryKey } from "./useTropesQuery";

export const deleteTropeMutationKey = ["deleteTrope"] as const;

/**
 * Custom hook to delete a trope
 * Automatically invalidates related queries on success
 */
export function useDeleteTropeMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: deleteTropeMutationKey,
		mutationFn: (tropeId: string) => api.delete(`/api/admin/tropes/${tropeId}`),
		onSuccess: () => {
			// Invalidate both public and admin trope queries
			queryClient.invalidateQueries({ queryKey: tropesQueryKey });
			queryClient.invalidateQueries({ queryKey: adminTropesQueryKey });
		},
	});
}
