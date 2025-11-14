import { useMutation } from "@tanstack/react-query";
import { api } from "~/lib/api/client";

/**
 * Hook to download user data in JSON format
 */
export function useDownloadUserData() {
	return useMutation({
		mutationFn: async () => {
			// Fetch user data from the API
			const data = await api.get("/api/profile/data");

			// Create a blob from the JSON data
			const blob = new Blob([JSON.stringify(data, null, 2)], {
				type: "application/json",
			});

			// Create a download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;

			// Generate filename with current date
			const date = new Date().toISOString().split("T")[0];
			link.download = `spicy-tales-data-${date}.json`;

			// Trigger download
			document.body.appendChild(link);
			link.click();

			// Cleanup
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			return data;
		},
	});
}
