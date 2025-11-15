/**
 * Prompt Variations for Testing
 *
 * Each variation exports buildSystemPrompt() and buildScenePrompt() functions
 * that can be tested against each other to find what works best.
 */

import type { StoryPreferences, SceneMetadata } from "../src/lib/ai/prompts";
import {
	buildSystemPrompt as baselineSystemPrompt,
	buildScenePrompt as baselineScenePrompt,
	getSceneLengthGuidance,
	getSceneLengthRange,
} from "../src/lib/ai/prompts";

export type PromptBuilder = {
	name: string;
	description: string;
	buildSystemPrompt: (preferences: StoryPreferences) => string;
	buildScenePrompt: (params: {
		templateTitle: string;
		sceneNumber: number;
		previousScenes?: string[];
		previousMetadata?: SceneMetadata[];
		lastChoice?: { text: string; tone: string };
		choicePoint?: { sceneNumber: number; promptText: string };
		estimatedScenes: number;
		sceneLength?: "short" | "medium" | "long" | number;
	}) => string;
};

/**
 * BASELINE - Current production prompts
 */
export const baseline: PromptBuilder = {
	name: "baseline",
	description: "Current production prompts (control group)",
	buildSystemPrompt: baselineSystemPrompt,
	buildScenePrompt: baselineScenePrompt,
};

/**
 * EXPLICIT METADATA - Emphasize metadata generation more explicitly
 */
export const explicitMetadata: PromptBuilder = {
	name: "explicit-metadata",
	description: "More explicit instructions about metadata quality and completeness",
	buildSystemPrompt: (preferences: StoryPreferences) => {
		const basePrompt = baselineSystemPrompt(preferences);
		const metadataEmphasis = `

⚠️ CRITICAL METADATA REQUIREMENT ⚠️
After EVERY scene, you MUST provide complete metadata in this exact format:
<SCENE_META>
emotional_beat: [required - the core emotional shift in this scene]
tension_threads: [required - all unresolved tensions, comma-separated]
relationship_progress: [required - number from -5 to +5]
key_moment: [required - the defining moment in 5-8 words]
key_characters: [required - all characters who appear, comma-separated]
pov_character: [required - whose perspective we're in]
setting_location: [required - specific location name]
</SCENE_META>

ALL seven fields are MANDATORY. Incomplete metadata will be rejected.`;

		return basePrompt + metadataEmphasis;
	},
	buildScenePrompt: baselineScenePrompt,
};

/**
 * SIMPLIFIED - Shorter, more concise system prompt
 */
export const simplified: PromptBuilder = {
	name: "simplified",
	description: "Shorter system prompt focusing on core requirements only",
	buildSystemPrompt: (preferences: StoryPreferences) => {
		const { genres, tropes, spiceLevel, pacing, protagonistTraits, settingPreferences, sceneLength } = preferences;

		const spiceDesc = {
			1: "Sweet/clean - no explicit content",
			2: "Mild - romantic tension, light kissing",
			3: "Moderate - sensuality, fade to black",
			4: "Steamy - explicit with emotional context",
			5: "Explicit - detailed intimate scenes",
		};

		const lengthGuidance = getSceneLengthGuidance(sceneLength);

		return `You write ${genres.join("/")} romance scenes with ${tropes.join(", ")} tropes.

LENGTH: ${lengthGuidance} - STRICT LIMIT.

STYLE: Third-person limited POV, one character per scene. Show emotion through actions/reactions, not labels. ${pacing === "slow-burn" ? "Build tension gradually" : "Fast pacing, early chemistry"}.

HEAT: Level ${spiceLevel}/5 (${spiceDesc[spiceLevel]}). All intimate content must be consensual and emotionally grounded.

${protagonistTraits?.length ? `TRAITS: ${protagonistTraits.join(", ")}` : ""}
${settingPreferences?.length ? `SETTING: ${settingPreferences.join(", ")}` : ""}

CONTINUITY: Track characters, maintain POV, ground in setting. Build on prior scenes.

SAFETY: No minors, non-consent, incest, violence, or harmful content.

METADATA: End every scene with complete <SCENE_META> block (all 7 fields required).`;
	},
	buildScenePrompt: baselineScenePrompt,
};

/**
 * FEW-SHOT - Include examples of well-crafted scenes
 */
export const fewShot: PromptBuilder = {
	name: "few-shot",
	description: "Includes example scenes to demonstrate desired quality",
	buildSystemPrompt: (preferences: StoryPreferences) => {
		const basePrompt = baselineSystemPrompt(preferences);

		const example = `

EXAMPLE OF GOOD SCENE STRUCTURE:

[Opening hook with sensory detail]
The coffee shop's industrial espresso machine hissed, but Mara barely heard it over the thudding in her chest. Across the scarred wooden table, Jake was looking at her like she'd just announced she could breathe underwater.

[Dialogue with subtext]
"You're serious," he said.

She wrapped both hands around her mug. "Dead serious."

[Internal thought showing POV]
The words felt too small for what she was asking. Three weeks ago, she'd have laughed at the idea of Jake Chen—meticulous, punctual Jake—agreeing to something this reckless.

[Action with emotional resonance]
He leaned back, arms crossed, but his jaw had that tight set she'd learned to read. Not anger. Consideration.

[Escalating tension]
"If we do this," he said slowly, "there's no halfway."

[Closing hook]
Mara's pulse kicked. She should probably think this through. Instead, she heard herself say, "I know."

<SCENE_META>
emotional_beat: tentative alliance forming through shared risk
tension_threads: unspoken attraction, proposed scheme's danger
relationship_progress: +2
key_moment: decision to partner despite mutual wariness
key_characters: Mara, Jake
pov_character: Mara
setting_location: coffee shop downtown
</SCENE_META>

Your scenes should follow this quality level: vivid sensory detail, natural dialogue, clear POV, emotional progression, complete metadata.`;

		return basePrompt + example;
	},
	buildScenePrompt: baselineScenePrompt,
};

/**
 * CHAIN-OF-THOUGHT - Ask model to plan before writing
 */
export const chainOfThought: PromptBuilder = {
	name: "chain-of-thought",
	description: "Asks model to plan the scene before writing it",
	buildSystemPrompt: baselineSystemPrompt,
	buildScenePrompt: (params) => {
		const basePrompt = baselineScenePrompt(params);

		const thinkingSection = `

BEFORE WRITING, PLAN THE SCENE (do not include this in your output):
1. What is the core emotional shift in this scene?
2. What tension threads need to continue/resolve/deepen?
3. Whose POV serves this scene best?
4. What is the key moment that defines this scene?
5. How does relationship progress change (-5 to +5)?
6. What setting grounds this scene?

Now write the scene based on your plan.`;

		return basePrompt + thinkingSection;
	},
};

/**
 * STRUCTURED-OUTPUT - More rigid structure enforcement
 */
export const structuredOutput: PromptBuilder = {
	name: "structured-output",
	description: "Enforces stricter scene structure with sections",
	buildSystemPrompt: (preferences: StoryPreferences) => {
		const basePrompt = baselineSystemPrompt(preferences);

		const structureRequirement = `

REQUIRED SCENE STRUCTURE:
1. OPENING (1-2 paragraphs): Establish POV, setting, emotional state
2. RISING ACTION (3-5 paragraphs): Advance tension through dialogue/action/internal thought
3. KEY MOMENT (1-2 paragraphs): The defining beat of this scene
4. HOOK (1 paragraph): End on unresolved tension or question

Each section must flow naturally—structure should be invisible to reader.`;

		return basePrompt + structureRequirement;
	},
	buildScenePrompt: baselineScenePrompt,
};

/**
 * CONSTRAINT-FOCUSED - Emphasizes what NOT to do
 */
export const constraintFocused: PromptBuilder = {
	name: "constraint-focused",
	description: "Emphasizes constraints and things to avoid",
	buildSystemPrompt: (preferences: StoryPreferences) => {
		const basePrompt = baselineSystemPrompt(preferences);

		const constraints = `

CRITICAL CONSTRAINTS (DO NOT VIOLATE):
❌ NO exposition dumps or backstory recaps
❌ NO meta-commentary ("this scene", "the story")
❌ NO placeholder text [like this] or (explanations)
❌ NO reintroducing characters already established
❌ NO switching POV mid-scene
❌ NO exceeding word count limit
❌ NO incomplete metadata
❌ NO "purple prose" or overwrought metaphors
❌ NO flat emotion labels ("she felt sad")—show through action

VIOLATION OF ANY CONSTRAINT = FAILED SCENE`;

		return basePrompt + constraints;
	},
	buildScenePrompt: baselineScenePrompt,
};

/**
 * OPENAI-OPTIMIZED - Tuned for GPT-4 models
 */
export const openaiOptimized: PromptBuilder = {
	name: "openai-optimized",
	description: "Optimized for OpenAI GPT-4 models with their specific strengths",
	buildSystemPrompt: (preferences: StoryPreferences) => {
		// GPT-4 tends to be verbose, so emphasize brevity
		// It's good at following structure but can be repetitive
		const basePrompt = baselineSystemPrompt(preferences);

		return basePrompt + `

GPT-4 OPTIMIZATION NOTES:
- Be concise. Cut unnecessary words. Tighten every sentence.
- Avoid repetitive phrasing or rehashing previous beats.
- Vary sentence structure aggressively to avoid monotony.
- Your strength is coherent structure—use it to build clear emotional arcs.
- Watch for over-explaining: trust the reader to infer subtext.`;
	},
	buildScenePrompt: baselineScenePrompt,
};

/**
 * CLAUDE-OPTIMIZED - Tuned for Anthropic Claude models
 */
export const claudeOptimized: PromptBuilder = {
	name: "claude-optimized",
	description: "Optimized for Anthropic Claude with emphasis on nuance and safety",
	buildSystemPrompt: (preferences: StoryPreferences) => {
		// Claude is good at nuance and following complex instructions
		// It tends to be safety-conscious, so reassure about creative freedom
		const basePrompt = baselineSystemPrompt(preferences);

		return basePrompt + `

CLAUDE OPTIMIZATION NOTES:
- Your strength is nuanced emotional depth—lean into it.
- Complex character psychology and moral ambiguity are welcome here.
- All content within stated spice level and safety rules is ENCOURAGED.
- Don't pull punches on tension or conflict—the safety rules protect you.
- Subtext and layered meaning are your forte—use them generously.`;
	},
	buildScenePrompt: baselineScenePrompt,
};

/**
 * GEMINI-OPTIMIZED - Tuned for Google Gemini models
 */
export const geminiOptimized: PromptBuilder = {
	name: "gemini-optimized",
	description: "Optimized for Google Gemini with emphasis on creative interpretation",
	buildSystemPrompt: (preferences: StoryPreferences) => {
		// Gemini can be creative but sometimes needs structure reinforcement
		const basePrompt = baselineSystemPrompt(preferences);

		return basePrompt + `

GEMINI OPTIMIZATION NOTES:
- Balance creativity with structure: innovative within boundaries.
- Metadata completion is CRITICAL—double-check all seven fields.
- Word count adherence is STRICT—count as you write.
- Your creative interpretation is valued within the established rules.
- Ground imaginative elements in sensory detail and emotional truth.`;
	},
	buildScenePrompt: baselineScenePrompt,
};

/**
 * All available variations
 */
export const allVariations: PromptBuilder[] = [
	baseline,
	explicitMetadata,
	simplified,
	fewShot,
	chainOfThought,
	structuredOutput,
	constraintFocused,
	openaiOptimized,
	claudeOptimized,
	geminiOptimized,
];

/**
 * Get variation by name
 */
export function getVariation(name: string): PromptBuilder | undefined {
	return allVariations.find((v) => v.name === name);
}

/**
 * Get all variation names
 */
export function getVariationNames(): string[] {
	return allVariations.map((v) => v.name);
}
