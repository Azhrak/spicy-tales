import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Archive,
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	Eye,
	EyeOff,
	FileText,
	Plus,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import { useState } from "react";
import { AdminLayout, DataTable, StatusBadge } from "~/components/admin";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import {
	useAdminTemplatesPaginatedQuery,
	useAdminTemplatesStatsQuery,
} from "~/hooks/useAdminTemplatesQuery";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import type { TemplateStatus } from "~/lib/db/types";

// Search params schema
type TemplatesSearch = {
	page?: number;
	status?: TemplateStatus | "all";
	sortBy?: "title" | "status" | "scenes" | "created" | "updated";
	sortOrder?: "asc" | "desc";
};

export const Route = createFileRoute("/admin/templates/")({
	component: TemplatesListPage,
	validateSearch: (search: Record<string, unknown>): TemplatesSearch => {
		return {
			page: Number(search.page) || 1,
			status: (search.status as TemplateStatus | "all") || "all",
			sortBy:
				(search.sortBy as
					| "title"
					| "status"
					| "scenes"
					| "created"
					| "updated") || "updated",
			sortOrder: (search.sortOrder as "asc" | "desc") || "desc",
		};
	},
});

type SortField = "title" | "status" | "scenes" | "created" | "updated";
type StatusFilter = "all" | TemplateStatus;

// Map frontend sort fields to database column names
const sortFieldMap: Record<
	SortField,
	"title" | "status" | "estimated_scenes" | "created_at" | "updated_at"
> = {
	title: "title",
	status: "status",
	scenes: "estimated_scenes",
	created: "created_at",
	updated: "updated_at",
};

function TemplatesListPage() {
	const navigate = useNavigate();
	const search = Route.useSearch();
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isBulkUpdating, setIsBulkUpdating] = useState(false);
	const [bulkError, setBulkError] = useState<string | null>(null);

	// Get state from URL params
	const currentPage = search.page || 1;
	const statusFilter = search.status || "all";
	const sortField = search.sortBy || "updated";
	const sortDirection = search.sortOrder || "desc";
	const itemsPerPage = 10;

	// Fetch current user to get role
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();

	// Fetch template statistics
	const { data: statsData, isLoading: statsLoading } =
		useAdminTemplatesStatsQuery(!!userData);

	// Fetch paginated templates
	const {
		data: templatesData,
		isLoading: templatesLoading,
		error,
		refetch,
	} = useAdminTemplatesPaginatedQuery({
		page: currentPage,
		limit: itemsPerPage,
		status: statusFilter,
		sortBy: sortFieldMap[sortField],
		sortOrder: sortDirection,
		enabled: !!userData,
	});

	if (userLoading || templatesLoading || statsLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<LoadingSpinner />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<ErrorMessage
					message={error instanceof Error ? error.message : "An error occurred"}
				/>
			</div>
		);
	}

	if (
		!userData ||
		!templatesData?.templates ||
		!templatesData?.pagination ||
		!statsData
	) {
		return null;
	}

	const { role } = userData;
	const { templates, pagination } = templatesData;

	// Sorting function (triggers server-side sorting via React Query)
	const handleSort = (field: SortField) => {
		const newSortOrder =
			sortField === field && sortDirection === "asc" ? "desc" : "asc";

		navigate({
			to: "/admin/templates",
			search: {
				...search,
				sortBy: field,
				sortOrder: newSortOrder,
			},
		});
	};

	// Reset to page 1 when filters change
	const handleFilterChange = (filter: StatusFilter) => {
		navigate({
			to: "/admin/templates",
			search: {
				...search,
				status: filter,
				page: 1,
			},
		});
	};

	// Handle page change
	const handlePageChange = (page: number) => {
		navigate({
			to: "/admin/templates",
			search: {
				...search,
				page,
			},
		});
	};

	// Pagination metadata from server
	const totalItems = pagination.total;
	const totalPages = pagination.totalPages;
	const startIndex = (pagination.page - 1) * pagination.limit;
	const endIndex = Math.min(startIndex + pagination.limit, totalItems);

	// Stats from server (accurate counts for all statuses)
	const stats = statsData;

	const handleBulkStatusUpdate = async (
		status: "published" | "draft" | "archived",
	) => {
		setBulkError(null);
		setIsBulkUpdating(true);

		try {
			const response = await fetch("/api/admin/templates/bulk-update", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					templateIds: Array.from(selectedIds),
					status,
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Bulk update failed");
			}

			// Refetch templates and clear selection
			await refetch();
			setSelectedIds(new Set());
		} catch (err) {
			setBulkError(err instanceof Error ? err.message : "Bulk update failed");
		} finally {
			setIsBulkUpdating(false);
		}
	};

	const handleBulkDelete = async () => {
		const count = selectedIds.size;
		const confirmed = window.confirm(
			`Are you sure you want to permanently delete ${count} template${count !== 1 ? "s" : ""}? This action cannot be undone.`,
		);

		if (!confirmed) {
			return;
		}

		setBulkError(null);
		setIsBulkUpdating(true);

		try {
			const response = await fetch("/api/admin/templates/bulk-delete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					templateIds: Array.from(selectedIds),
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Bulk delete failed");
			}

			// Refetch templates and clear selection
			await refetch();
			setSelectedIds(new Set());
		} catch (err) {
			setBulkError(err instanceof Error ? err.message : "Bulk delete failed");
		} finally {
			setIsBulkUpdating(false);
		}
	};

	return (
		<AdminLayout currentPath="/admin/templates" userRole={role}>
			<div>
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-3xl font-bold text-slate-900 mb-2">
							Template Management
						</h1>
						<p className="text-slate-600">
							Manage novel templates, including drafts and archived content.
						</p>
					</div>
					<div className="flex gap-3">
						<Button
							type="button"
							onClick={() => navigate({ to: "/admin/templates/bulk-import" })}
							variant="secondary"
						>
							<Upload className="w-5 h-5" />
							Bulk Import
						</Button>
						<Button
							type="button"
							onClick={() => navigate({ to: "/admin/templates/new" })}
							variant="primary"
						>
							<Plus className="w-5 h-5" />
							New Template
						</Button>
					</div>
				</div>

				{/* Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
					<StatBox
						label="Total Templates"
						value={stats.total}
						icon={FileText}
						color="blue"
					/>
					<StatBox
						label="Published"
						value={stats.published}
						icon={Eye}
						color="green"
					/>
					<StatBox
						label="Drafts"
						value={stats.draft}
						icon={EyeOff}
						color="yellow"
					/>
					<StatBox
						label="Archived"
						value={stats.archived}
						icon={Archive}
						color="gray"
					/>
				</div>

				{/* Status Filter */}
				<div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
					<div className="flex items-center gap-3">
						<span className="text-sm font-medium text-slate-700">
							Filter by Status:
						</span>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => handleFilterChange("all")}
								className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
									statusFilter === "all"
										? "bg-romance-600 text-white"
										: "bg-slate-100 text-slate-700 hover:bg-slate-200"
								}`}
							>
								All ({stats.total})
							</button>
							<button
								type="button"
								onClick={() => handleFilterChange("published")}
								className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
									statusFilter === "published"
										? "bg-green-600 text-white"
										: "bg-slate-100 text-slate-700 hover:bg-slate-200"
								}`}
							>
								Published ({stats.published})
							</button>
							<button
								type="button"
								onClick={() => handleFilterChange("draft")}
								className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
									statusFilter === "draft"
										? "bg-yellow-600 text-white"
										: "bg-slate-100 text-slate-700 hover:bg-slate-200"
								}`}
							>
								Drafts ({stats.draft})
							</button>
							<button
								type="button"
								onClick={() => handleFilterChange("archived")}
								className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
									statusFilter === "archived"
										? "bg-gray-600 text-white"
										: "bg-slate-100 text-slate-700 hover:bg-slate-200"
								}`}
							>
								Archived ({stats.archived})
							</button>
						</div>
					</div>
				</div>

				{/* Bulk Actions Toolbar */}
				{selectedIds.size > 0 && (
					<div className="bg-romance-50 border border-romance-200 rounded-lg p-4 mb-4 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<span className="text-sm font-medium text-slate-900">
								{selectedIds.size} template{selectedIds.size !== 1 ? "s" : ""}{" "}
								selected
							</span>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => setSelectedIds(new Set())}
							>
								<X className="w-4 h-4" />
								Clear
							</Button>
						</div>
						<div className="flex gap-2">
							<Button
								size="sm"
								variant="secondary"
								onClick={() => handleBulkStatusUpdate("published")}
								disabled={isBulkUpdating}
								loading={isBulkUpdating}
							>
								<Eye className="w-4 h-4" />
								Publish
							</Button>
							<Button
								size="sm"
								variant="secondary"
								onClick={() => handleBulkStatusUpdate("draft")}
								disabled={isBulkUpdating}
								loading={isBulkUpdating}
							>
								<EyeOff className="w-4 h-4" />
								Set as Draft
							</Button>
							<Button
								size="sm"
								variant="secondary"
								onClick={() => handleBulkStatusUpdate("archived")}
								disabled={isBulkUpdating}
								loading={isBulkUpdating}
							>
								<Archive className="w-4 h-4" />
								Archive
							</Button>
							{role === "admin" && (
								<Button
									size="sm"
									variant="danger"
									onClick={handleBulkDelete}
									disabled={isBulkUpdating}
									loading={isBulkUpdating}
								>
									<Trash2 className="w-4 h-4" />
									Delete
								</Button>
							)}
						</div>
					</div>
				)}

				{bulkError && (
					<div className="mb-4">
						<ErrorMessage message={bulkError} />
					</div>
				)}

				{/* Templates Table */}
				<div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
					<DataTable
						data={templates}
						selectable={true}
						selectedIds={selectedIds}
						onSelectionChange={setSelectedIds}
						onRowClick={(template) =>
							navigate({ to: `/admin/templates/${template.id}/edit` })
						}
						columns={[
							{
								header: (
									<button
										type="button"
										onClick={() => handleSort("title")}
										className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
									>
										Title
										<ArrowUpDown className="w-3 h-3" />
									</button>
								),
								accessor: (t) => t.title,
								className: "font-medium text-slate-900",
								key: "title",
							},
							{
								header: (
									<button
										type="button"
										onClick={() => handleSort("status")}
										className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
									>
										Status
										<ArrowUpDown className="w-3 h-3" />
									</button>
								),
								accessor: (t) => <StatusBadge status={t.status} />,
								key: "status",
							},
							{
								header: "Tropes",
								accessor: (t) => t.base_tropes.join(", "),
								className: "text-slate-600 text-sm",
								key: "tropes",
							},
							{
								header: (
									<button
										type="button"
										onClick={() => handleSort("scenes")}
										className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
									>
										Scenes
										<ArrowUpDown className="w-3 h-3" />
									</button>
								),
								accessor: (t) => t.estimated_scenes.toString(),
								className: "text-slate-600 text-center",
								key: "scenes",
							},
							{
								header: (
									<button
										type="button"
										onClick={() => handleSort("created")}
										className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
									>
										Created
										<ArrowUpDown className="w-3 h-3" />
									</button>
								),
								accessor: (t) => new Date(t.created_at).toLocaleDateString(),
								className: "text-slate-600 text-sm",
								key: "created",
							},
							{
								header: (
									<button
										type="button"
										onClick={() => handleSort("updated")}
										className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
									>
										Updated
										<ArrowUpDown className="w-3 h-3" />
									</button>
								),
								accessor: (t) => new Date(t.updated_at).toLocaleDateString(),
								className: "text-slate-600 text-sm",
								key: "updated",
							},
						]}
						emptyMessage="No templates found. Create your first template to get started."
					/>
				</div>

				{/* Pagination Controls */}
				{totalPages > 1 && (
					<div className="mt-4 flex items-center justify-between">
						<div className="text-sm text-slate-600">
							Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
							{totalItems} templates
						</div>
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
								disabled={currentPage === 1}
							>
								<ChevronLeft className="w-4 h-4" />
								Previous
							</Button>

							<div className="flex gap-1">
								{Array.from({ length: totalPages }, (_, i) => i + 1).map(
									(page) => {
										// Show first page, last page, current page, and pages around current
										const showPage =
											page === 1 ||
											page === totalPages ||
											Math.abs(page - currentPage) <= 1;

										if (!showPage) {
											// Show ellipsis for gaps
											if (
												page === currentPage - 2 ||
												page === currentPage + 2
											) {
												return (
													<span
														key={page}
														className="px-3 py-1.5 text-slate-500"
													>
														...
													</span>
												);
											}
											return null;
										}

										return (
											<button
												key={page}
												type="button"
												onClick={() => handlePageChange(page)}
												className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
													currentPage === page
														? "bg-romance-600 text-white"
														: "bg-slate-100 text-slate-700 hover:bg-slate-200"
												}`}
											>
												{page}
											</button>
										);
									},
								)}
							</div>

							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={() =>
									handlePageChange(Math.min(totalPages, currentPage + 1))
								}
								disabled={currentPage === totalPages}
							>
								Next
								<ChevronRight className="w-4 h-4" />
							</Button>
						</div>
					</div>
				)}
			</div>
		</AdminLayout>
	);
}

interface StatBoxProps {
	label: string;
	value: number;
	icon: React.ElementType;
	color: "blue" | "green" | "yellow" | "gray";
}

function StatBox({ label, value, icon: Icon, color }: StatBoxProps) {
	const colorClasses = {
		blue: "bg-blue-50 text-blue-600",
		green: "bg-green-50 text-green-600",
		yellow: "bg-yellow-50 text-yellow-600",
		gray: "bg-gray-50 text-gray-600",
	};

	return (
		<div className="bg-white rounded-lg border border-slate-200 p-4">
			<div className="flex items-center gap-3">
				<div className={`p-2 rounded-lg ${colorClasses[color]}`}>
					<Icon className="w-5 h-5" />
				</div>
				<div>
					<p className="text-sm text-slate-600">{label}</p>
					<p className="text-2xl font-bold text-slate-900">{value}</p>
				</div>
			</div>
		</div>
	);
}
