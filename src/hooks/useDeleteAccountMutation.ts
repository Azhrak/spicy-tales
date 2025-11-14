import { useMutation } from "@tanstack/react-query";
import { api } from "~/lib/api/client";

export const deleteAccountMutationKey = ["deleteAccount"] as const;

interface DeleteAccountData {
	password: string;
}

/**
 * Custom hook to delete user account
 * Note: On success, the user should be redirected to home page
 * No queries are invalidated as the user session is terminated
 */
export function useDeleteAccountMutation() {
	return useMutation({
		mutationKey: deleteAccountMutationKey,
		mutationFn: async (data: DeleteAccountData) => {
			await api.delete("/api/profile", data);
		},
	});
}
