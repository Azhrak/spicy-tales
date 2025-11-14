import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { Template } from "~/lib/api/types";

export const adminTemplatesQueryKey = ["adminTemplates"] as const;

/**
 * Custom hook to fetch all templates for admin management
 * Includes drafts and archived templates
 * Requires editor or admin role
 */
export function useAdminTemplatesQuery(enabled = true) {
	return useQuery({
		queryKey: adminTemplatesQueryKey,
		queryFn: () => api.get<{ templates: Template[] }>("/api/admin/templates"),
		enabled,
	});
}
