import { useEffect, useRef, useState } from "react";

interface SceneMetadata {
	scene: {
		number: number;
		wordCount: number;
		cached: boolean;
	};
	story: {
		id: string;
		title: string;
		currentScene: number;
		estimatedScenes: number;
		status: string;
	};
	choicePoint: {
		id: string;
		promptText: string;
		options: Array<{ text: string; tone: string }>;
	} | null;
	previousChoice: number | null;
}

interface StreamingSceneState {
	content: string;
	metadata: SceneMetadata | null;
	isStreaming: boolean;
	isComplete: boolean;
	error: string | null;
}

export function useStreamingScene(
	storyId: string,
	sceneNumber: number | null = null,
	enabled = true,
) {
	const [state, setState] = useState<StreamingSceneState>({
		content: "",
		metadata: null,
		isStreaming: false,
		isComplete: false,
		error: null,
	});

	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		if (!enabled) return;

		// Reset state when scene changes
		setState({
			content: "",
			metadata: null,
			isStreaming: true,
			isComplete: false,
			error: null,
		});

		// Create abort controller for this request
		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		const params = new URLSearchParams();
		if (sceneNumber !== null) {
			params.append("number", sceneNumber.toString());
		}

		const url = `/api/stories/${storyId}/scene/stream?${params.toString()}`;

		// Start streaming
		fetch(url, { signal: abortController.signal })
			.then(async (response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const reader = response.body?.getReader();
				const decoder = new TextDecoder();

				if (!reader) {
					throw new Error("No response body");
				}

				let buffer = "";

				while (true) {
					const { done, value } = await reader.read();

					if (done) {
						break;
					}

					buffer += decoder.decode(value, { stream: true });

					// Process complete SSE messages
					const lines = buffer.split("\n\n");
					buffer = lines.pop() || ""; // Keep incomplete message in buffer

					for (const line of lines) {
						if (line.startsWith("data: ")) {
							const data = JSON.parse(line.slice(6));

							if (data.type === "metadata") {
								setState((prev) => ({
									...prev,
									metadata: data as SceneMetadata,
								}));
							} else if (data.type === "content") {
								setState((prev) => ({
									...prev,
									content: prev.content + data.content,
								}));
							} else if (data.type === "done") {
								setState((prev) => ({
									...prev,
									isStreaming: false,
									isComplete: true,
								}));
							} else if (data.type === "error") {
								setState((prev) => ({
									...prev,
									isStreaming: false,
									isComplete: false,
									error: data.error,
								}));
							}
						}
					}
				}
			})
			.catch((error) => {
				if (error.name === "AbortError") {
					// Request was cancelled, ignore
					return;
				}
				console.error("Streaming error:", error);
				setState((prev) => ({
					...prev,
					isStreaming: false,
					isComplete: false,
					error: error instanceof Error ? error.message : "Unknown error",
				}));
			});

		// Cleanup function
		return () => {
			abortController.abort();
		};
	}, [storyId, sceneNumber, enabled]);

	return state;
}
