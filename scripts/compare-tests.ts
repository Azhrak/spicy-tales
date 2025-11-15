#!/usr/bin/env tsx
/**
 * CLI Tool for Comparing Test Results
 *
 * Usage:
 *   pnpm test:compare --list
 *   pnpm test:compare --latest
 *   pnpm test:compare --file1=result1.json --file2=result2.json
 *   pnpm test:compare --scenario=slow-burn-contemporary --variations=baseline,explicit-metadata
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import type { TestResult } from "./run-prompt-test";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resultsDir = path.join(__dirname, "test-results");

/**
 * Parse command line arguments
 */
function parseArgs(): {
	list?: boolean;
	latest?: boolean | string;
	file1?: string;
	file2?: string;
	scenario?: string;
	variations?: string;
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
 * List all test result files
 */
function listResults() {
	if (!fs.existsSync(resultsDir)) {
		console.log("📂 No test results found. Run some tests first!\n");
		return;
	}

	// Sort by file modification time (most recent first)
	const files = fs
		.readdirSync(resultsDir)
		.filter((f) => f.endsWith(".json"))
		.map((f) => ({
			name: f,
			mtime: fs.statSync(path.join(resultsDir, f)).mtime.getTime(),
		}))
		.sort((a, b) => b.mtime - a.mtime) // Most recent first
		.map((f) => f.name);

	if (files.length === 0) {
		console.log("📂 No test results found. Run some tests first!\n");
		return;
	}

	console.log(`\n📊 Test Results (${files.length} total):\n`);

	for (const file of files) {
		const filepath = path.join(resultsDir, file);
		const data = JSON.parse(fs.readFileSync(filepath, "utf-8")) as TestResult;

		const date = new Date(data.timestamp).toLocaleString();
		const score = data.evaluation.aggregate.averageOverall;
		const emoji = getScoreEmoji(score);

		console.log(`  ${file}`);
		console.log(`    Scenario: ${data.scenario.name}`);
		console.log(`    Variation: ${data.variation}`);
		console.log(`    Model: ${data.model} (${data.provider})`);
		console.log(`    Score: ${score}/100 ${emoji}`);
		console.log(`    Date: ${date}`);
		console.log("");
	}
}

/**
 * Compare two test results
 */
function compareTwo(file1: string, file2: string) {
	const path1 = path.join(resultsDir, file1);
	const path2 = path.join(resultsDir, file2);

	if (!fs.existsSync(path1)) {
		console.error(`❌ File not found: ${file1}`);
		return;
	}
	if (!fs.existsSync(path2)) {
		console.error(`❌ File not found: ${file2}`);
		return;
	}

	const result1 = JSON.parse(fs.readFileSync(path1, "utf-8")) as TestResult;
	const result2 = JSON.parse(fs.readFileSync(path2, "utf-8")) as TestResult;

	console.log("\n" + "=".repeat(80));
	console.log("COMPARISON REPORT");
	console.log("=".repeat(80) + "\n");

	// Header
	console.log("FILE 1:", file1);
	console.log("  Scenario:", result1.scenario.name);
	console.log("  Variation:", result1.variation);
	console.log("  Model:", result1.model);
	console.log("");
	console.log("FILE 2:", file2);
	console.log("  Scenario:", result2.scenario.name);
	console.log("  Variation:", result2.variation);
	console.log("  Model:", result2.model);
	console.log("");

	// Aggregate comparison
	console.log("=".repeat(80));
	console.log("AGGREGATE SCORES");
	console.log("=".repeat(80) + "\n");

	const agg1 = result1.evaluation.aggregate;
	const agg2 = result2.evaluation.aggregate;

	printComparison("Overall Score", agg1.averageOverall, agg2.averageOverall);
	printComparison("Completeness", agg1.averageCompleteness, agg2.averageCompleteness);
	printComparison("Coherence", agg1.averageCoherence, agg2.averageCoherence);
	printComparison("Instruction Following", agg1.averageInstructionFollowing, agg2.averageInstructionFollowing);
	printComparison("Total Word Count", agg1.totalWordCount, agg2.totalWordCount, false);
	printComparison("Metadata Completion", agg1.metadataCompletionRate, agg2.metadataCompletionRate);

	console.log(`\nSafety: ${agg1.safetyPassed ? "✓" : "✗"} vs ${agg2.safetyPassed ? "✓" : "✗"}\n`);

	// Scene-by-scene comparison
	console.log("=".repeat(80));
	console.log("SCENE-BY-SCENE COMPARISON");
	console.log("=".repeat(80) + "\n");

	const maxScenes = Math.max(result1.scenes.length, result2.scenes.length);

	for (let i = 0; i < maxScenes; i++) {
		const scene1 = result1.scenes[i];
		const scene2 = result2.scenes[i];

		if (!scene1 || !scene2) {
			console.log(`Scene ${i + 1}: Only present in one result`);
			continue;
		}

		const eval1 = result1.evaluation.scenes[i];
		const eval2 = result2.evaluation.scenes[i];

		console.log(`Scene ${i + 1}:`);
		printComparison("  Overall", eval1.overallScore, eval2.overallScore);
		printComparison("  Completeness", eval1.completeness.score, eval2.completeness.score);
		printComparison("  Coherence", eval1.coherence.score, eval2.coherence.score);
		printComparison("  Instruction", eval1.instructionFollowing.score, eval2.instructionFollowing.score);
		printComparison("  Word Count", scene1.wordCount, scene2.wordCount, false);
		console.log("");
	}

	// Metadata comparison
	console.log("=".repeat(80));
	console.log("METADATA COMPARISON");
	console.log("=".repeat(80) + "\n");

	for (let i = 0; i < maxScenes; i++) {
		const scene1 = result1.scenes[i];
		const scene2 = result2.scenes[i];

		if (!scene1 || !scene2) continue;

		console.log(`Scene ${i + 1}:`);
		console.log(`  Result 1: ${scene1.metadata ? formatMetadata(scene1.metadata) : "No metadata"}`);
		console.log(`  Result 2: ${scene2.metadata ? formatMetadata(scene2.metadata) : "No metadata"}`);
		console.log("");
	}

	// Winner
	console.log("=".repeat(80));
	console.log("SUMMARY");
	console.log("=".repeat(80) + "\n");

	const score1 = agg1.averageOverall;
	const score2 = agg2.averageOverall;

	if (score1 > score2) {
		console.log(`🏆 WINNER: Result 1 (${result1.variation})`);
		console.log(`   Score: ${score1}/100 vs ${score2}/100 (+${score1 - score2})`);
	} else if (score2 > score1) {
		console.log(`🏆 WINNER: Result 2 (${result2.variation})`);
		console.log(`   Score: ${score2}/100 vs ${score1}/100 (+${score2 - score1})`);
	} else {
		console.log(`🤝 TIE: Both scored ${score1}/100`);
	}
	console.log("");
}

/**
 * Compare latest N tests
 */
function compareLatest(count: number = 2) {
	if (!fs.existsSync(resultsDir)) {
		console.log("📂 No test results found. Run some tests first!\n");
		return;
	}

	// Sort by file modification time (most recent first)
	const files = fs
		.readdirSync(resultsDir)
		.filter((f) => f.endsWith(".json"))
		.map((f) => ({
			name: f,
			mtime: fs.statSync(path.join(resultsDir, f)).mtime.getTime(),
		}))
		.sort((a, b) => b.mtime - a.mtime) // Most recent first
		.map((f) => f.name);

	if (files.length < count) {
		console.log(`📂 Need at least ${count} test results to compare (found ${files.length}).\n`);
		return;
	}

	const filesToCompare = files.slice(0, count);

	// If comparing exactly 2, use the detailed comparison
	if (count === 2) {
		console.log(`\n📊 Comparing 2 most recent tests:\n`);
		console.log(`  1. ${filesToCompare[0]}`);
		console.log(`  2. ${filesToCompare[1]}\n`);
		compareTwo(filesToCompare[0], filesToCompare[1]);
		return;
	}

	// For N > 2, show a comparison table
	console.log(`\n📊 Comparing ${count} most recent tests:\n`);

	// Load all results
	const results: Array<{ file: string; data: TestResult }> = [];
	for (const file of filesToCompare) {
		const filepath = path.join(resultsDir, file);
		const data = JSON.parse(fs.readFileSync(filepath, "utf-8")) as TestResult;
		results.push({ file, data });
	}

	// Display comparison table
	console.log("=".repeat(100));
	console.log("File".padEnd(60), "Overall", "Complete", "Coherent", "Instruct", "Safety");
	console.log("-".repeat(100));

	for (let i = 0; i < results.length; i++) {
		const result = results[i];
		const agg = result.data.evaluation.aggregate;
		const shortFile = result.file.length > 57 ? `...${result.file.slice(-54)}` : result.file;

		console.log(
			`${i + 1}. ${shortFile.padEnd(57)}`,
			`${agg.averageOverall}/100 ${getScoreEmoji(agg.averageOverall)}`.padEnd(11),
			`${agg.averageCompleteness}`.padEnd(9),
			`${agg.averageCoherence}`.padEnd(9),
			`${agg.averageInstructionFollowing}`.padEnd(9),
			agg.safetyPassed ? "✓" : "✗",
		);
	}

	console.log("=".repeat(100));

	// Show key details for each
	console.log("\n📋 Test Details:\n");
	for (let i = 0; i < results.length; i++) {
		const result = results[i];
		console.log(`${i + 1}. ${result.file}`);
		console.log(`   Scenario: ${result.data.scenario.name}`);
		console.log(`   Variation: ${result.data.variation}`);
		console.log(`   Model: ${result.data.model} (${result.data.provider})`);
		console.log(`   Date: ${new Date(result.data.timestamp).toLocaleString()}`);
		console.log("");
	}

	// Find best performer
	const ranked = results.sort((a, b) => b.data.evaluation.aggregate.averageOverall - a.data.evaluation.aggregate.averageOverall);
	console.log("🏆 Best Performer:\n");
	const best = ranked[0];
	console.log(`   ${best.file}`);
	console.log(`   Score: ${best.data.evaluation.aggregate.averageOverall}/100 ${getScoreEmoji(best.data.evaluation.aggregate.averageOverall)}`);
	console.log(`   Variation: ${best.data.variation}`);
	console.log(`   Model: ${best.data.model}`);
	console.log("");
}

/**
 * Compare variations for a scenario
 */
function compareVariations(scenarioId: string, variationNames: string) {
	if (!fs.existsSync(resultsDir)) {
		console.log("📂 No test results found. Run some tests first!\n");
		return;
	}

	const variations = variationNames.split(",").map((v) => v.trim());

	// Find matching files
	const matchingFiles: Record<string, string> = {};

	for (const variation of variations) {
		// Find most recent result for this scenario + variation
		const files = fs
			.readdirSync(resultsDir)
			.filter((f) => f.startsWith(scenarioId) && f.includes(variation))
			.sort()
			.reverse();

		if (files.length > 0) {
			matchingFiles[variation] = files[0];
		}
	}

	if (Object.keys(matchingFiles).length < 2) {
		console.log(`❌ Not enough results found for scenario "${scenarioId}" with variations: ${variationNames}\n`);
		console.log(`Found results for: ${Object.keys(matchingFiles).join(", ")}\n`);
		return;
	}

	// Load all results
	const results: Array<{ variation: string; data: TestResult }> = [];
	for (const [variation, file] of Object.entries(matchingFiles)) {
		const filepath = path.join(resultsDir, file);
		const data = JSON.parse(fs.readFileSync(filepath, "utf-8")) as TestResult;
		results.push({ variation, data });
	}

	console.log("\n" + "=".repeat(80));
	console.log(`VARIATION COMPARISON: ${scenarioId}`);
	console.log("=".repeat(80) + "\n");

	// Create comparison table
	console.log("Variation".padEnd(25), "Overall", "Complete", "Coherent", "Instruct", "Words");
	console.log("-".repeat(80));

	for (const result of results) {
		const agg = result.data.evaluation.aggregate;
		console.log(
			result.variation.padEnd(25),
			`${agg.averageOverall}/100 ${getScoreEmoji(agg.averageOverall)}`.padEnd(11),
			`${agg.averageCompleteness}`.padEnd(9),
			`${agg.averageCoherence}`.padEnd(9),
			`${agg.averageInstructionFollowing}`.padEnd(9),
			`${agg.totalWordCount}`,
		);
	}

	console.log("");

	// Rank by overall score
	const ranked = results.sort((a, b) => b.data.evaluation.aggregate.averageOverall - a.data.evaluation.aggregate.averageOverall);

	console.log("🏆 Rankings:\n");
	ranked.forEach((r, idx) => {
		const score = r.data.evaluation.aggregate.averageOverall;
		console.log(`  ${idx + 1}. ${r.variation} (${score}/100) ${getScoreEmoji(score)}`);
	});
	console.log("");
}

/**
 * Print comparison row
 */
function printComparison(label: string, value1: number, value2: number, higherIsBetter: boolean = true) {
	const diff = value2 - value1;
	const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
	const better = higherIsBetter ? diff > 0 : diff < 0;
	const symbol = diff === 0 ? "=" : better ? "↑" : "↓";

	console.log(`${label.padEnd(25)} ${value1} vs ${value2}  ${symbol} ${diffStr}`);
}

/**
 * Format metadata for display
 */
function formatMetadata(metadata: Record<string, unknown> | unknown): string {
	const fields: string[] = [];
	const meta = metadata as Record<string, unknown>;
	if (meta.emotional_beat) fields.push(`EB:${meta.emotional_beat}`);
	if (meta.relationship_progress) fields.push(`RP:${meta.relationship_progress}`);
	if (meta.pov_character) fields.push(`POV:${meta.pov_character}`);
	return fields.join(" | ") || "Empty";
}

/**
 * Get emoji for score
 */
function getScoreEmoji(score: number): string {
	if (score >= 90) return "🟢";
	if (score >= 70) return "🟡";
	if (score >= 50) return "🟠";
	return "🔴";
}

/**
 * Show help
 */
function showHelp() {
	console.log(`
Test Comparison Tool
====================

Usage:
  pnpm test:compare --list
  pnpm test:compare --latest[=N]
  pnpm test:compare --file1=result1.json --file2=result2.json
  pnpm test:compare --scenario=SCENARIO_ID --variations=var1,var2,var3

Options:
  --list                           List all test results
  --latest[=N]                     Compare N most recent tests (default: 2)
  --file1=FILE --file2=FILE        Compare specific result files
  --scenario=ID --variations=LIST  Compare variations for a scenario
  --help                           Show this help

Examples:
  pnpm test:compare --list
  pnpm test:compare --latest            # Compare 2 most recent
  pnpm test:compare --latest=5          # Compare 5 most recent
  pnpm test:compare --file1=slow-burn-contemporary_baseline_gpt-4-turbo_2025-01-14.json --file2=slow-burn-contemporary_explicit-metadata_gpt-4-turbo_2025-01-14.json
  pnpm test:compare --scenario=slow-burn-contemporary --variations=baseline,explicit-metadata,simplified
`);
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

	if (args.list) {
		listResults();
		return;
	}

	if (args.latest) {
		const count = typeof args.latest === "string" ? parseInt(args.latest, 10) : 2;
		if (isNaN(count) || count < 2) {
			console.error("❌ Error: --latest must be a number >= 2\n");
			process.exit(1);
		}
		compareLatest(count);
		return;
	}

	if (args.file1 && args.file2) {
		compareTwo(args.file1, args.file2);
		return;
	}

	if (args.scenario && args.variations) {
		compareVariations(args.scenario, args.variations);
		return;
	}

	console.error("❌ Error: Invalid arguments\n");
	showHelp();
	process.exit(1);
}

// Run main function
main().catch((error) => {
	console.error("\n❌ Fatal error:", error);
	process.exit(1);
});
