import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { UserRole } from "~/lib/db/types";
import { adminUserQueryKey } from "./useAdminUserQuery";
import { adminUsersQueryKey } from "./useAdminUsersQuery";
import { adminDashboardQueryKey } from "./useAdminDashboardQuery";

interface UserFormData {
	email: string;
	name: string;
	role: UserRole;
}

export const updateUserMutationKey = (userId: string) => ["updateUser", userId] as const;

/**
 * Custom hook to update a user's information
 * Automatically invalidates related queries on success
 */
export function useUpdateUserMutation(userId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: updateUserMutationKey(userId),
		mutationFn: (data: UserFormData) => api.patch(`/api/admin/users/${userId}`, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminUserQueryKey(userId) });
			queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
			queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey });
		},
	});
}
