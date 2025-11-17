import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getAllTropes } from "~/lib/db/queries/tropes";

export const Route = createFileRoute("/api/tropes/")({
	server: {
		handlers: {
			// GET /api/tropes - Get all tropes (public endpoint for template forms)
			GET: async () => {
				try {
					const tropes = await getAllTropes();
					return json({ tropes });
				} catch (error) {
					console.error("Error fetching tropes:", error);
					return json({ error: "Failed to fetch tropes" }, { status: 500 });
				}
			},
		},
	},
});
