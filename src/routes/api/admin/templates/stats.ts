import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireEditorOrAdmin } from "~/lib/auth/authorization";
import { getTemplateCountByStatus } from "~/lib/db/queries/templates";

export const Route = createFileRoute("/api/admin/templates/stats")({
	server: {
		handlers: {
			// GET /api/admin/templates/stats - Get template count by status
			GET: async ({ request }) => {
				try {
					// Require editor or admin role
					await requireEditorOrAdmin(request);

					const stats = await getTemplateCountByStatus();

					// Calculate total
					const total = Object.values(stats).reduce(
						(sum, count) => sum + count,
						0,
					);

					return json({
						total,
						draft: stats.draft || 0,
						published: stats.published || 0,
						archived: stats.archived || 0,
					});
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}
					console.error("Error fetching template stats:", error);
					return json(
						{ error: "Failed to fetch template stats" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
