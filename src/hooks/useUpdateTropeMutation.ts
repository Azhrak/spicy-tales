import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import { adminTropesQueryKey, tropesQueryKey } from "./useTropesQuery";

interface UpdateTropeData {
	key?: string;
	label?: string;
	description?: string;
}

interface UpdateTropeParams {
	tropeId: string;
	data: UpdateTropeData;
}

interface TropeResponse {
	success: boolean;
	trope: {
		id: string;
		key: string;
		label: string;
	};
}

export const updateTropeMutationKey = ["updateTrope"] as const;

/**
 * Custom hook to update a trope
 * Automatically invalidates related queries on success
 */
export function useUpdateTropeMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: updateTropeMutationKey,
		mutationFn: ({ tropeId, data }: UpdateTropeParams) =>
			api.put<TropeResponse>(`/api/admin/tropes/${tropeId}`, data),
		onSuccess: () => {
			// Invalidate both public and admin trope queries
			queryClient.invalidateQueries({ queryKey: tropesQueryKey });
			queryClient.invalidateQueries({ queryKey: adminTropesQueryKey });
		},
	});
}
