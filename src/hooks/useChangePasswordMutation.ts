import { useMutation } from "@tanstack/react-query";
import { api } from "~/lib/api/client";

export const changePasswordMutationKey = ["changePassword"] as const;

interface ChangePasswordData {
	currentPassword: string;
	newPassword: string;
}

/**
 * Custom hook to change user password
 * Does not invalidate any queries as password change doesn't affect cached data
 */
export function useChangePasswordMutation() {
	return useMutation({
		mutationKey: changePasswordMutationKey,
		mutationFn: async (data: ChangePasswordData) => {
			await api.post("/api/profile/password", data);
		},
	});
}
