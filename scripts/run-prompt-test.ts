#!/usr/bin/env tsx
/**
 * CLI Tool for Testing Prompt Variations
 *
 * Usage:
 *   pnpm test:prompt --scenario=slow-burn-contemporary --variation=baseline --model=gpt-4-turbo
 *   pnpm test:prompt --scenario=fast-paced-high-spice --all-variations
 *   pnpm test:prompt --list-scenarios
 *   pnpm test:prompt --list-variations
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { generateCompletion, getCurrentProvider, getDefaultModel } from "../src/lib/ai/client";
import { parseSceneMeta } from "../src/lib/ai/prompts";
import type { SceneMetadata, StoryPreferences } from "../src/lib/ai/prompts";
import { evaluateScene, evaluateStory, formatStoryEvaluation, formatEvaluation } from "./evaluation-metrics";
import { getVariation, getVariationNames, allVariations } from "./prompt-variations";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test scenarios
const scenariosPath = path.join(__dirname, "test-scenarios.json");
const scenariosData = JSON.parse(fs.readFileSync(scenariosPath, "utf-8"));

interface TestScenario {
	id: string;
	name: string;
	description: string;
	storyPreferences: StoryPreferences;
	templateTitle: string;
	estimatedScenes: number;
	expectedBehavior: Record<string, string>;
}

interface TestResult {
	scenario: TestScenario;
	variation: string;
	model: string;
	provider: string;
	timestamp: string;
	scenes: Array<{
		number: number;
		content: string;
		metadata: SceneMetadata | null;
		summary: string;
		wordCount: number;
	}>;
	evaluation: ReturnType<typeof evaluateStory>;
}

/**
 * Parse command line arguments
 */
function parseArgs(): {
	scenario?: string;
	variation?: string;
	model?: string;
	allVariations?: boolean;
	listScenarios?: boolean;
	listVariations?: boolean;
	help?: boolean;
} {
	const args = process.argv.slice(2);
	const parsed: Record<string, string | boolean> = {};

	for (const arg of args) {
		if (arg.startsWith("--")) {
			const [key, value] = arg.slice(2).split("=");
			// Convert kebab-case to camelCase
			const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
			if (value === undefined) {
				parsed[camelKey] = true;
			} else {
				parsed[camelKey] = value;
			}
		}
	}

	return parsed as ReturnType<typeof parseArgs>;
}

/**
 * List available scenarios
 */
function listScenarios() {
	console.log("\n📋 Available Test Scenarios:\n");
	for (const scenario of scenariosData.scenarios) {
		console.log(`  ${scenario.id}`);
		console.log(`    Name: ${scenario.name}`);
		console.log(`    Description: ${scenario.description}`);
		console.log(`    Scenes: ${scenario.estimatedScenes}`);
		console.log(`    Spice: ${scenario.storyPreferences.spiceLevel}/5`);
		console.log(`    Pacing: ${scenario.storyPreferences.pacing}`);
		console.log("");
	}
}

/**
 * List available variations
 */
function listVariations() {
	console.log("\n🔬 Available Prompt Variations:\n");
	for (const variation of allVariations) {
		console.log(`  ${variation.name}`);
		console.log(`    ${variation.description}`);
		console.log("");
	}
}

/**
 * Show help
 */
function showHelp() {
	console.log(`
Prompt Testing Tool
===================

Usage:
  pnpm test:prompt --scenario=SCENARIO_ID --variation=VARIATION_NAME [--model=MODEL_NAME]
  pnpm test:prompt --scenario=SCENARIO_ID --all-variations
  pnpm test:prompt --list-scenarios
  pnpm test:prompt --list-variations

Options:
  --scenario=ID          Scenario to test (required unless listing)
  --variation=NAME       Prompt variation to test (default: baseline)
  --all-variations       Test all variations for the scenario
  --model=NAME          Model to use (overrides env config)
  --list-scenarios      Show all available scenarios
  --list-variations     Show all available prompt variations
  --help               Show this help

Examples:
  pnpm test:prompt --scenario=slow-burn-contemporary --variation=baseline
  pnpm test:prompt --scenario=fast-paced-high-spice --variation=explicit-metadata --model=gpt-4-turbo
  pnpm test:prompt --scenario=fantasy-romance --all-variations

Results are saved to: scripts/test-results/
`);
}

/**
 * Generate a single scene
 */
async function generateScene(params: {
	systemPrompt: string;
	userPrompt: string;
	sceneNumber: number;
	model?: string;
}): Promise<{ content: string; metadata: SceneMetadata | null; summary: string; wordCount: number }> {
	console.log(`  Generating scene ${params.sceneNumber}...`);

	const rawContent = await generateCompletion(params.systemPrompt, params.userPrompt, {
		model: params.model,
		temperature: 0.8,
		maxTokens: 2000,
	});

	const parsed = parseSceneMeta(rawContent);
	const wordCount = parsed.content.trim().split(/\s+/).length;

	console.log(`    ✓ Generated ${wordCount} words`);
	if (parsed.metadata) {
		const metaFields = Object.keys(parsed.metadata).filter(
			(k) => parsed.metadata![k as keyof SceneMetadata] !== undefined,
		);
		console.log(`    ✓ Metadata: ${metaFields.length}/7 fields`);
	} else {
		console.log(`    ✗ No metadata found`);
	}

	return {
		content: parsed.content,
		metadata: parsed.metadata,
		summary: parsed.summary,
		wordCount,
	};
}

/**
 * Run test for a scenario with a specific variation
 */
async function runTest(scenarioId: string, variationName: string, modelOverride?: string): Promise<TestResult> {
	// Load scenario
	const scenario = scenariosData.scenarios.find((s: TestScenario) => s.id === scenarioId);
	if (!scenario) {
		throw new Error(`Scenario not found: ${scenarioId}`);
	}

	// Get variation
	const variation = getVariation(variationName);
	if (!variation) {
		throw new Error(`Variation not found: ${variationName}`);
	}

	console.log(`\n${"=".repeat(60)}`);
	console.log(`🧪 Testing: ${scenario.name}`);
	console.log(`📝 Variation: ${variation.name}`);
	console.log(`🤖 Model: ${modelOverride || getDefaultModel()}`);
	console.log(`⚙️  Provider: ${getCurrentProvider()}`);
	console.log(`${"=".repeat(60)}\n`);

	// Build system prompt once
	const systemPrompt = variation.buildSystemPrompt(scenario.storyPreferences);

	// Generate mini-story (3-4 scenes based on estimatedScenes)
	const numScenes = scenario.estimatedScenes;
	const scenes: TestResult["scenes"] = [];
	const previousScenes: string[] = [];
	const previousMetadata: SceneMetadata[] = [];

	for (let sceneNum = 1; sceneNum <= numScenes; sceneNum++) {
		const userPrompt = variation.buildScenePrompt({
			templateTitle: scenario.templateTitle,
			sceneNumber: sceneNum,
			previousScenes: previousScenes.length > 0 ? previousScenes.slice(-2) : [],
			previousMetadata: previousMetadata.length > 0 ? previousMetadata.slice(-2) : [],
			estimatedScenes: numScenes,
			sceneLength: scenario.storyPreferences.sceneLength,
		});

		const scene = await generateScene({
			systemPrompt,
			userPrompt,
			sceneNumber: sceneNum,
			model: modelOverride,
		});

		scenes.push({
			number: sceneNum,
			...scene,
		});

		// Add to context for next scene
		previousScenes.push(scene.summary);
		if (scene.metadata) {
			previousMetadata.push(scene.metadata);
		}

		// Small delay to avoid rate limits
		if (sceneNum < numScenes) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	console.log(`\n✅ Generated ${scenes.length} scenes\n`);

	// Evaluate story
	console.log("📊 Evaluating...\n");
	const evaluation = evaluateStory(
		scenes.map((s) => ({ content: s.content, metadata: s.metadata })),
		scenario.storyPreferences,
	);

	// Create result
	const result: TestResult = {
		scenario,
		variation: variationName,
		model: modelOverride || getDefaultModel(),
		provider: getCurrentProvider(),
		timestamp: new Date().toISOString(),
		scenes,
		evaluation,
	};

	// Save to file
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const modelName = (modelOverride || getDefaultModel())
		.replace(/[^a-zA-Z0-9-]/g, "-") // Replace special chars with dash
		.replace(/-+/g, "-") // Collapse multiple dashes
		.toLowerCase();
	const filename = `${scenarioId}_${variationName}_${modelName}_${timestamp}.json`;
	const resultsDir = path.join(__dirname, "test-results");
	const filepath = path.join(resultsDir, filename);

	fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
	console.log(`💾 Saved to: ${path.relative(process.cwd(), filepath)}\n`);

	// Display summary
	console.log(formatStoryEvaluation(evaluation));

	// Show per-scene details
	console.log("\n📄 Per-Scene Details:\n");
	for (let i = 0; i < evaluation.scenes.length; i++) {
		console.log(formatEvaluation(evaluation.scenes[i], i + 1));
	}

	return result;
}

/**
 * Main function
 */
async function main() {
	const args = parseArgs();

	if (args.help) {
		showHelp();
		return;
	}

	if (args.listScenarios) {
		listScenarios();
		return;
	}

	if (args.listVariations) {
		listVariations();
		return;
	}

	if (!args.scenario) {
		console.error("❌ Error: --scenario is required\n");
		showHelp();
		process.exit(1);
	}

	// Ensure test-results directory exists
	const resultsDir = path.join(__dirname, "test-results");
	if (!fs.existsSync(resultsDir)) {
		fs.mkdirSync(resultsDir, { recursive: true });
	}

	if (args.allVariations) {
		// Run all variations
		const variations = getVariationNames();
		console.log(`\n🔄 Running ${variations.length} variations for scenario: ${args.scenario}\n`);

		for (let i = 0; i < variations.length; i++) {
			const variation = variations[i];
			console.log(`\n[${"=".repeat(58)}]`);
			console.log(`Progress: ${i + 1}/${variations.length}`);
			console.log(`[${"=".repeat(58)}]\n`);

			try {
				await runTest(args.scenario, variation, args.model as string | undefined);
			} catch (error) {
				console.error(`\n❌ Error testing variation ${variation}:`, error);
				console.log(`\nContinuing to next variation...\n`);
			}

			// Delay between variations to avoid rate limits
			if (i < variations.length - 1) {
				console.log("\n⏳ Waiting 5 seconds before next variation...\n");
				await new Promise((resolve) => setTimeout(resolve, 5000));
			}
		}

		console.log(`\n✅ Completed testing all variations!\n`);
	} else {
		// Run single variation
		const variation = (args.variation as string) || "baseline";
		await runTest(args.scenario, variation, args.model as string | undefined);
	}
}

export { runTest, TestResult, TestScenario };

// Run main function
main().catch((error) => {
	console.error("\n❌ Fatal error:", error);
	process.exit(1);
});
