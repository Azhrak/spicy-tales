import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";

interface DashboardStats {
	templates?: {
		total: number;
		draft: number;
		published: number;
		archived: number;
	};
	users?: {
		total: number;
		user: number;
		editor: number;
		admin: number;
	};
}

export const adminDashboardQueryKey = ["adminDashboard"] as const;

/**
 * Custom hook to fetch admin dashboard statistics
 * Requires admin or editor role
 */
export function useAdminDashboardQuery(enabled = true) {
	return useQuery({
		queryKey: adminDashboardQueryKey,
		queryFn: () => api.get<{ stats: DashboardStats }>("/api/admin/dashboard"),
		enabled,
	});
}
