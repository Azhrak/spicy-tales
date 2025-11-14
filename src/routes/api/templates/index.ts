import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import {
	getPublishedTemplates,
	getTemplatesByTropes,
	searchTemplates,
} from "~/lib/db/queries/templates";
import type { Trope } from "~/lib/types/preferences";

export const Route = createFileRoute("/api/templates/")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				try {
					const url = new URL(request.url);
					const tropesParam = url.searchParams.get("tropes");
					const searchParam = url.searchParams.get("search");

					let templates: Awaited<ReturnType<typeof getPublishedTemplates>>;

					// If both tropes and search are provided, filter by both
					if (tropesParam && searchParam) {
						const tropes = tropesParam.split(",") as Trope[];
						const tropeFiltered = await getTemplatesByTropes(tropes);
						const searchTerm = searchParam.toLowerCase();

						// Filter for published templates only
						templates = tropeFiltered.filter((template) => {
							const isPublished = template.status === "published";
							const matchesSearch =
								template.title.toLowerCase().includes(searchTerm) ||
								template.description.toLowerCase().includes(searchTerm);
							return isPublished && matchesSearch;
						});
					}
					// If only tropes filter provided
					else if (tropesParam) {
						const tropes = tropesParam.split(",") as Trope[];
						const allTropeFiltered = await getTemplatesByTropes(tropes);
						// Filter for published templates only
						templates = allTropeFiltered.filter(
							(template) => template.status === "published",
						);
					}
					// If only search query provided
					else if (searchParam) {
						const allSearchResults = await searchTemplates(searchParam);
						// Filter for published templates only
						templates = allSearchResults.filter(
							(template) => template.status === "published",
						);
					}
					// Otherwise, return all published templates
					else {
						templates = await getPublishedTemplates();
					}

					return json({ templates });
				} catch (error) {
					console.error("Error fetching templates:", error);
					return json({ error: "Failed to fetch templates" }, { status: 500 });
				}
			},
		},
	},
});
