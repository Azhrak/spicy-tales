import { useNavigate } from "@tanstack/react-router";

export interface TableSortingState<T extends string> {
	sortField: T;
	sortOrder: "asc" | "desc";
	handleSort: (field: T) => void;
}

export interface TableSortingOptions<T extends string> {
	defaultField: T;
	defaultOrder: "asc" | "desc";
	currentSearch: Record<string, unknown>;
	route: string;
}

/**
 * Custom hook for managing table sorting state and navigation
 * Provides server-side sorting capabilities via URL search params
 *
 * @example
 * ```tsx
 * const { sortField, sortOrder, handleSort } = useTableSorting({
 *   defaultField: 'updated',
 *   defaultOrder: 'desc',
 *   currentSearch: search,
 *   route: '/admin/templates'
 * });
 * ```
 */
export function useTableSorting<T extends string>({
	defaultField,
	defaultOrder,
	currentSearch,
	route,
}: TableSortingOptions<T>): TableSortingState<T> {
	const navigate = useNavigate();

	const sortField = (currentSearch.sortBy as T) || defaultField;
	const sortOrder = (currentSearch.sortOrder as "asc" | "desc") || defaultOrder;

	const handleSort = (field: T) => {
		const newSortOrder =
			sortField === field && sortOrder === "asc" ? "desc" : "asc";

		navigate({
			to: route as never,
			search: {
				...currentSearch,
				sortBy: field,
				sortOrder: newSortOrder,
			} as never,
		});
	};

	return {
		sortField,
		sortOrder,
		handleSort,
	};
}
