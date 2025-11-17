import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChoicePoint } from "~/components/admin/ChoicePointForm";
import { api } from "~/lib/api/client";
import type { TemplateStatus } from "~/lib/db/types";
import type { TemplateFormData as BaseTemplateFormData } from "~/lib/validation/templates";
import { adminDashboardQueryKey } from "./useAdminDashboardQuery";
import { adminTemplatesQueryKey } from "./useAdminTemplatesQuery";

interface TemplateFormData extends BaseTemplateFormData {
	choicePoints?: ChoicePoint[];
}

interface CreateTemplateResponse {
	template: {
		id: string;
		title: string;
		status: TemplateStatus;
	};
	message: string;
}

export const createTemplateMutationKey = ["createTemplate"] as const;

/**
 * Custom hook to create a new template
 * Automatically invalidates related queries on success
 */
export function useCreateTemplateMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: createTemplateMutationKey,
		mutationFn: (data: TemplateFormData) => {
			const payload = {
				title: data.title,
				description: data.description,
				base_tropes: data.base_tropes,
				estimated_scenes: data.estimated_scenes,
				cover_gradient: data.cover_gradient,
				...(data.choicePoints &&
					data.choicePoints.length > 0 && {
						choicePoints: data.choicePoints,
					}),
			};

			return api.post<CreateTemplateResponse>("/api/admin/templates", payload);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminTemplatesQueryKey });
			queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey });
		},
	});
}
