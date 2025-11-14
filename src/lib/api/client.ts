/**
 * Centralized API client for consistent error handling, auth redirects, and headers
 */

export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public data?: unknown,
	) {
		super(message);
		this.name = "ApiError";
	}
}

interface RequestOptions extends RequestInit {
	params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Base fetch wrapper with error handling and auth redirects
 */
async function apiFetch<T>(
	endpoint: string,
	options: RequestOptions = {},
): Promise<T> {
	const { params, ...fetchOptions } = options;

	// Build URL with query parameters
	let url = endpoint;
	if (params) {
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) {
				searchParams.append(key, String(value));
			}
		}
		const queryString = searchParams.toString();
		if (queryString) {
			url += `?${queryString}`;
		}
	}

	// Set default options
	const config: RequestInit = {
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...fetchOptions.headers,
		},
		...fetchOptions,
	};

	try {
		const response = await fetch(url, config);

		// Handle 401 Unauthorized - redirect to login
		if (response.status === 401) {
			// Only redirect if we're not already on an auth page
			if (
				typeof window !== "undefined" &&
				!window.location.pathname.startsWith("/auth/")
			) {
				window.location.href = "/auth/login";
			}
			throw new ApiError("Unauthorized", 401);
		}

		// Handle 403 Forbidden
		if (response.status === 403) {
			throw new ApiError("Forbidden - insufficient permissions", 403);
		}

		// For DELETE requests or 204 No Content, return empty object
		if (response.status === 204 || fetchOptions.method === "DELETE") {
			return {} as T;
		}

		// Parse response body
		const data = await response.json();

		// Handle non-OK responses
		if (!response.ok) {
			const errorMessage = data.error || data.message || "Request failed";
			throw new ApiError(errorMessage, response.status, data);
		}

		return data as T;
	} catch (error) {
		// Re-throw ApiError as-is
		if (error instanceof ApiError) {
			throw error;
		}

		// Handle network errors
		if (error instanceof TypeError && error.message === "Failed to fetch") {
			throw new ApiError("Network error - please check your connection", 0);
		}

		// Handle other errors
		throw new ApiError(
			error instanceof Error ? error.message : "Unknown error occurred",
			0,
		);
	}
}

/**
 * API client with type-safe methods
 */
export const api = {
	/**
	 * GET request
	 */
	get: <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
		return apiFetch<T>(endpoint, { ...options, method: "GET" });
	},

	/**
	 * POST request
	 */
	post: <T>(
		endpoint: string,
		body?: unknown,
		options?: RequestOptions,
	): Promise<T> => {
		return apiFetch<T>(endpoint, {
			...options,
			method: "POST",
			body: body ? JSON.stringify(body) : undefined,
		});
	},

	/**
	 * PUT request
	 */
	put: <T>(
		endpoint: string,
		body?: unknown,
		options?: RequestOptions,
	): Promise<T> => {
		return apiFetch<T>(endpoint, {
			...options,
			method: "PUT",
			body: body ? JSON.stringify(body) : undefined,
		});
	},

	/**
	 * PATCH request
	 */
	patch: <T>(
		endpoint: string,
		body?: unknown,
		options?: RequestOptions,
	): Promise<T> => {
		return apiFetch<T>(endpoint, {
			...options,
			method: "PATCH",
			body: body ? JSON.stringify(body) : undefined,
		});
	},

	/**
	 * DELETE request
	 */
	delete: <T = void>(
		endpoint: string,
		body?: unknown,
		options?: RequestOptions,
	): Promise<T> => {
		return apiFetch<T>(endpoint, {
			...options,
			method: "DELETE",
			body: body ? JSON.stringify(body) : undefined,
		});
	},
};
