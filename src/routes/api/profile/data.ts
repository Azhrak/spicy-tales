import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getSessionFromRequest } from "~/lib/auth/session";
import { db } from "~/lib/db";

export const Route = createFileRoute("/api/profile/data")({
	server: {
		handlers: {
			// Get all user data for download
			GET: async ({ request }) => {
				try {
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					// Fetch user profile
					const user = await db
						.selectFrom("users")
						.select([
							"id",
							"email",
							"name",
							"avatar_url",
							"default_preferences",
							"email_verified",
							"role",
							"created_at",
							"updated_at",
						])
						.where("id", "=", session.userId)
						.executeTakeFirst();

					if (!user) {
						return json({ error: "User not found" }, { status: 404 });
					}

					// Fetch user stories with template information
					const stories = await db
						.selectFrom("user_stories")
						.innerJoin(
							"novel_templates",
							"user_stories.template_id",
							"novel_templates.id",
						)
						.select([
							"user_stories.id as story_id",
							"user_stories.created_at",
							"user_stories.updated_at",
							"user_stories.current_scene",
							"user_stories.status",
							"user_stories.story_title",
							"user_stories.preferences",
							"novel_templates.id as template_id",
							"novel_templates.title as template_title",
							"novel_templates.description as template_description",
							"novel_templates.base_tropes",
							"novel_templates.cover_gradient",
							"novel_templates.estimated_scenes",
						])
						.where("user_stories.user_id", "=", session.userId)
						.execute();

					// Fetch all choices made by the user
					const choices = await db
						.selectFrom("choices")
						.innerJoin("user_stories", "choices.story_id", "user_stories.id")
						.innerJoin(
							"choice_points",
							"choices.choice_point_id",
							"choice_points.id",
						)
						.select([
							"choices.id",
							"choices.story_id",
							"choices.selected_option",
							"choices.created_at",
							"choice_points.prompt_text",
							"choice_points.scene_number",
							"choice_points.options",
						])
						.where("user_stories.user_id", "=", session.userId)
						.execute();

					// Organize data for export
					const exportData = {
						exportedAt: new Date().toISOString(),
						profile: {
							id: user.id,
							name: user.name,
							email: user.email,
							avatarUrl: user.avatar_url,
							emailVerified: user.email_verified,
							role: user.role,
							defaultPreferences: user.default_preferences,
							createdAt: user.created_at,
							updatedAt: user.updated_at,
						},
						stories: stories.map((story) => ({
							id: story.story_id,
							title: story.story_title,
							status: story.status,
							currentScene: story.current_scene,
							preferences: story.preferences,
							createdAt: story.created_at,
							updatedAt: story.updated_at,
							template: {
								id: story.template_id,
								title: story.template_title,
								description: story.template_description,
								baseTropes: story.base_tropes,
								coverGradient: story.cover_gradient,
								estimatedScenes: story.estimated_scenes,
							},
						})),
						choices: choices.map((choice) => ({
							id: choice.id,
							storyId: choice.story_id,
							selectedOption: choice.selected_option,
							promptText: choice.prompt_text,
							sceneNumber: choice.scene_number,
							availableOptions: choice.options,
							createdAt: choice.created_at,
						})),
						metadata: {
							totalStories: stories.length,
							totalChoices: choices.length,
						},
					};

					return json(exportData);
				} catch (error) {
					console.error("Data export error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
