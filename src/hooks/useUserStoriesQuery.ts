import { useQuery } from "@tanstack/react-query";
import type { UserStory, StoryStatus } from "~/lib/api/types";

interface UserStoriesResponse {
	stories: UserStory[];
}

/**
 * Custom hook to fetch user's stories filtered by status
 * @param status - Filter stories by "in-progress" or "completed"
 */
export function useUserStoriesQuery(status: StoryStatus) {
	return useQuery({
		queryKey: ["user-stories", status],
		queryFn: async () => {
			const response = await fetch(`/api/stories/user?status=${status}`, {
				credentials: "include",
			});
			if (!response.ok) throw new Error("Failed to fetch stories");
			return response.json() as Promise<UserStoriesResponse>;
		},
	});
}
