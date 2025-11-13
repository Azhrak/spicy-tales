import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdmin } from "~/lib/auth/authorization";
import { getAllUsers, getUserCount } from "~/lib/db/queries/users";
import type { UserRole } from "~/lib/db/types";

export const Route = createFileRoute("/api/admin/users/")({
	server: {
		handlers: {
			// GET /api/admin/users - Get all users with pagination
			GET: async ({ request }) => {
				try {
					// Require admin role
					await requireAdmin(request);

					const url = new URL(request.url);
					const roleParam = url.searchParams.get("role") as UserRole | null;
					const searchParam = url.searchParams.get("search");
					const limitParam = url.searchParams.get("limit");
					const offsetParam = url.searchParams.get("offset");

					const limit = limitParam ? Number.parseInt(limitParam, 10) : 50;
					const offset = offsetParam ? Number.parseInt(offsetParam, 10) : 0;

					const filters = {
						role: roleParam || undefined,
						search: searchParam || undefined,
						limit,
						offset,
					};

					const [users, totalCount] = await Promise.all([
						getAllUsers(filters),
						getUserCount({ role: filters.role, search: filters.search }),
					]);

					return json({
						users,
						pagination: {
							total: totalCount,
							limit,
							offset,
							hasMore: offset + limit < totalCount,
						},
					});
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}
					console.error("Error fetching users:", error);
					return json({ error: "Failed to fetch users" }, { status: 500 });
				}
			},
		},
	},
});
