import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import { adminTropesQueryKey, tropesQueryKey } from "./useTropesQuery";

interface CreateTropeData {
	key: string;
	label: string;
	description?: string;
}

interface TropeResponse {
	success: boolean;
	trope: {
		id: string;
		key: string;
		label: string;
	};
}

export const createTropeMutationKey = ["createTrope"] as const;

/**
 * Custom hook to create a trope
 * Automatically invalidates related queries on success
 */
export function useCreateTropeMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: createTropeMutationKey,
		mutationFn: (data: CreateTropeData) =>
			api.post<TropeResponse>("/api/admin/tropes", data),
		onSuccess: () => {
			// Invalidate both public and admin trope queries
			queryClient.invalidateQueries({ queryKey: tropesQueryKey });
			queryClient.invalidateQueries({ queryKey: adminTropesQueryKey });
		},
	});
}
