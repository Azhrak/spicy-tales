# Prompt Testing System

A lightweight CLI-based testing harness for rapid experimentation with prompt variations and AI models. This system allows you to discover what prompting techniques work best for generating coherent, complete, instruction-following romance scenes.

## Overview

The testing system generates **mini-stories** (3-4 scenes) instead of full stories to minimize generation costs while still testing:

- **Coherence**: Story continuity, character tracking, POV consistency
- **Completeness**: Metadata presence, word count compliance, no placeholders
- **Instruction Following**: Spice level, pacing, length, style requirements

Each test run takes ~2-3 minutes and costs a fraction of generating a full story.

## Quick Start

### 1. List Available Options

```bash
# See all test scenarios
pnpm test:prompt:list-scenarios

# See all prompt variations
pnpm test:prompt:list-variations
```

### 2. Run a Single Test

```bash
# Test baseline prompts with slow-burn contemporary romance
pnpm test:prompt -- --scenario=slow-burn-contemporary --variation=baseline

# Test explicit-metadata variation with high-spice romance
pnpm test:prompt -- --scenario=fast-paced-high-spice --variation=explicit-metadata

# Test with specific model (overrides env config)
pnpm test:prompt -- --scenario=fantasy-romance --variation=baseline --model=gpt-4-turbo
```

### 3. Test All Variations

```bash
# Run all 10 variations against a scenario
pnpm test:prompt -- --scenario=slow-burn-contemporary --all-variations
```

This will generate 10 test results (one per variation) for the same scenario, allowing direct comparison.

### 4. Compare Results

```bash
# List all test results
pnpm test:compare -- --list

# Compare 2 most recent tests
pnpm test:compare -- --latest

# Compare specific files
pnpm test:compare -- --file1=slow-burn-contemporary_baseline_2025-01-14.json --file2=slow-burn-contemporary_explicit-metadata_2025-01-14.json

# Compare multiple variations for a scenario
pnpm test:compare -- --scenario=slow-burn-contemporary --variations=baseline,explicit-metadata,simplified
```

## Test Scenarios

12 diverse scenarios covering edge cases:

| Scenario ID | Description | Key Features |
|-------------|-------------|--------------|
| `slow-burn-contemporary` | Classic slow-burn romance | Gradual tension, moderate spice |
| `fast-paced-high-spice` | Rapid romance with explicit content | Tests high spice + fast pacing |
| `clean-sweet-romance` | Low spice romance | Tests restraint |
| `fantasy-romance` | Fantasy setting with magic | Tests world-building consistency |
| `paranormal-shifter` | Werewolf/shifter romance | Tests non-human characters |
| `multiple-tropes` | 4+ tropes woven together | Tests complexity handling |
| `pov-consistency` | Focuses on POV tracking | Tests perspective consistency |
| `setting-changes` | Multiple location changes | Tests setting continuity |
| `character-heavy` | Multiple named characters | Tests character tracking |
| `emotional-depth` | Complex emotions and healing | Tests emotional nuance |
| `varied-scene-length` | Word count compliance test | Tests length adherence |
| `minimal-guidance` | Minimal preferences | Tests creative interpretation |

## Prompt Variations

10 different prompting strategies to test:

### 1. **baseline** (Control Group)

Current production prompts. Use this as the comparison baseline.

### 2. **explicit-metadata**

Emphasizes metadata generation with stricter requirements. Tests if more explicit instructions improve metadata completeness.

### 3. **simplified**

Shorter, more concise system prompt. Tests if brevity improves following vs overwhelm.

### 4. **few-shot**

Includes example scenes demonstrating desired quality. Tests if examples improve output quality.

### 5. **chain-of-thought**

Asks model to plan before writing. Tests if planning step improves coherence.

### 6. **structured-output**

Enforces stricter scene structure (opening, rising action, key moment, hook). Tests if explicit structure helps.

### 7. **constraint-focused**

Emphasizes what NOT to do (negative instructions). Tests if constraints are clearer than positive instructions.

### 8. **openai-optimized**

Tuned for GPT-4 models (emphasizes brevity, avoiding repetition).

### 9. **claude-optimized**

Tuned for Anthropic Claude (emphasizes nuance, reassures about creative freedom).

### 10. **gemini-optimized**

Tuned for Google Gemini (emphasizes structure adherence, metadata completion).

## Automated Evaluation

Each test automatically evaluates scenes on multiple dimensions:

### Completeness Score (0-100)

- All 7 metadata fields present? (40 points)
- No placeholder text like `[TODO]`? (30 points)
- Word count within requested range? (30 points)

### Coherence Score (0-100)

- POV character consistency
- Character tracking across scenes
- Relationship progress changes logically (no jumps >3 points)
- Setting tracked and transitions logical

### Instruction Following Score (0-100)

- Length compliant (30 points)
- Has dialogue (20 points)
- Has internal thought (20 points)
- Has action (15 points)
- Setting specified (15 points)

### Safety Check (Pass/Fail)

- No age-related content
- No non-consensual content
- No violence
- No familial relationships

### Overall Score

Average of Completeness, Coherence, and Instruction Following (0-100).

## Test Output

Each test generates a JSON file in `scripts/test-results/` with:

```json
{
  "scenario": { /* scenario details */ },
  "variation": "baseline",
  "model": "gpt-4-turbo",
  "provider": "openai",
  "timestamp": "2025-01-14T10:30:00Z",
  "scenes": [
    {
      "number": 1,
      "content": "...",
      "metadata": { /* 7 metadata fields */ },
      "summary": "...",
      "wordCount": 650
    }
  ],
  "evaluation": {
    "scenes": [ /* per-scene evaluation */ ],
    "aggregate": {
      "averageOverall": 85,
      "averageCompleteness": 90,
      "averageCoherence": 82,
      "averageInstructionFollowing": 83,
      "safetyPassed": true,
      "totalWordCount": 2600,
      "metadataCompletionRate": 100
    }
  }
}
```

## Recommended Testing Workflow

### Phase 1: Quick Validation (10 minutes)

Test a few variations to get a feel for what works:

```bash
# Test 3 variations on a single scenario
pnpm test:prompt -- --scenario=slow-burn-contemporary --variation=baseline
pnpm test:prompt -- --scenario=slow-burn-contemporary --variation=explicit-metadata
pnpm test:prompt -- --scenario=slow-burn-contemporary --variation=simplified

# Compare results
pnpm test:compare -- --scenario=slow-burn-contemporary --variations=baseline,explicit-metadata,simplified
```

### Phase 2: Comprehensive Test (30-40 minutes)

Test all variations on a scenario:

```bash
# This runs 10 tests (one per variation)
pnpm test:prompt -- --scenario=slow-burn-contemporary --all-variations

# Compare all results
pnpm test:compare -- --scenario=slow-burn-contemporary --variations=baseline,explicit-metadata,simplified,few-shot,chain-of-thought,structured-output,constraint-focused,openai-optimized,claude-optimized,gemini-optimized
```

### Phase 3: Cross-Scenario Validation (1-2 hours)

Test winning variation across multiple scenarios:

```bash
# Identify winner from Phase 2, then test on diverse scenarios
pnpm test:prompt -- --scenario=fast-paced-high-spice --variation=WINNER
pnpm test:prompt -- --scenario=fantasy-romance --variation=WINNER
pnpm test:prompt -- --scenario=pov-consistency --variation=WINNER
pnpm test:prompt -- --scenario=character-heavy --variation=WINNER
```

### Phase 4: Model Comparison

Test winning prompt variation across different models:

```bash
# Set AI_PROVIDER in .env to switch models, or use --model flag
pnpm test:prompt -- --scenario=slow-burn-contemporary --variation=WINNER --model=gpt-4-turbo
pnpm test:prompt -- --scenario=slow-burn-contemporary --variation=WINNER --model=claude-3-5-sonnet-20241022
pnpm test:prompt -- --scenario=slow-burn-contemporary --variation=WINNER --model=gemini-1.5-pro
```

## Interpreting Results

### What to Look For

**High Completeness (90+):**

- All metadata fields consistently populated
- No placeholder text
- Word counts on target
- ✅ Prompts are clear and followed

**High Coherence (85+):**

- POV stays consistent
- Characters tracked across scenes
- Relationship progress logical
- Setting continuity maintained
- ✅ Story feels cohesive

**High Instruction Following (80+):**

- Length compliance
- Balance of dialogue/thought/action
- Appropriate spice level
- ✅ Prompts understood and executed

### Red Flags

🚩 **Completeness < 70:** Missing metadata, placeholders, or word count issues
🚩 **Coherence < 70:** POV flips, character inconsistencies, relationship jumps
🚩 **Instruction < 70:** Ignoring length, spice, or style requirements
🚩 **Safety Failed:** Contains prohibited content (needs immediate review)

### Score Interpretation

| Score | Emoji | Meaning |
|-------|-------|---------|
| 90-100 | 🟢 | Excellent - production ready |
| 70-89 | 🟡 | Good - minor issues |
| 50-69 | 🟠 | Fair - needs improvement |
| 0-49 | 🔴 | Poor - major issues |

## Adding New Test Scenarios

Edit `scripts/test-scenarios.json`:

```json
{
  "id": "your-scenario-id",
  "name": "Display Name",
  "description": "What this scenario tests",
  "storyPreferences": {
    "genres": ["contemporary romance"],
    "tropes": ["enemies to lovers"],
    "spiceLevel": 3,
    "pacing": "slow-burn",
    "sceneLength": "short",
    "protagonistTraits": ["witty", "guarded"],
    "settingPreferences": ["urban", "workplace"]
  },
  "templateTitle": "Test Story Title",
  "estimatedScenes": 4,
  "expectedBehavior": {
    "relationshipProgression": "gradual",
    "tensionBuilding": "steady"
  }
}
```

## Adding New Prompt Variations

Edit `scripts/prompt-variations.ts`:

```typescript
export const yourVariation: PromptBuilder = {
  name: "your-variation-name",
  description: "What this variation tests",
  buildSystemPrompt: (preferences: StoryPreferences) => {
    // Return modified system prompt
    const basePrompt = baselineSystemPrompt(preferences);
    return basePrompt + "\n\nYour modifications here";
  },
  buildScenePrompt: baselineScenePrompt, // Or custom implementation
};

// Add to allVariations array
export const allVariations = [
  baseline,
  // ... existing variations,
  yourVariation,
];
```

## Cost Estimation

**Per Test Run:**

- Scenes: 3-4
- Words per scene: ~600 (short length)
- Total words: ~2,400
- Input tokens: ~2,000 (prompts + context)
- Output tokens: ~3,200 (prose + metadata)

**Approximate Costs (GPT-4 Turbo):**

- Single test: ~$0.05
- All variations (10): ~$0.50
- Full scenario matrix (12 scenarios × 10 variations): ~$6.00

**Approximate Costs (Claude Sonnet 3.5):**

- Single test: ~$0.02
- All variations (10): ~$0.20
- Full scenario matrix: ~$2.40

**Approximate Costs (Gemini 1.5 Pro):**

- Single test: ~$0.01
- All variations (10): ~$0.10
- Full scenario matrix: ~$1.20

## Tips for Efficient Testing

1. **Start Small**: Test 2-3 variations first, not all 10
2. **Use Short Scenes**: Default `sceneLength: "short"` minimizes cost
3. **Test Diverse Scenarios**: Don't test same scenario repeatedly
4. **Batch Tests**: Use `--all-variations` to run overnight
5. **Review Metadata First**: Check metadata completeness before reading prose
6. **Compare Side-by-Side**: Use `test:compare` to spot patterns
7. **Track Promising Ideas**: If a variation shows promise, test it more broadly

## Troubleshooting

### "No content generated from AI"

- Check your API keys in `.env`
- Verify `AI_PROVIDER` matches your configured provider
- Check rate limits haven't been exceeded

### "Scenario not found"

- Run `pnpm test:prompt:list-scenarios` to see valid IDs
- Check spelling of scenario ID

### "Variation not found"

- Run `pnpm test:prompt:list-variations` to see valid names
- Check spelling of variation name

### Tests taking too long

- Use `sceneLength: "short"` in scenarios
- Reduce `estimatedScenes` to 3
- Test fewer variations at once

### Safety violations detected

- Review the content manually (false positives possible)
- Check if scenario parameters triggered unsafe content
- Adjust system prompt safety rules if needed

## Next Steps

Once you've identified promising prompt variations:

1. **Update Production Prompts**: Copy winning variations to `src/lib/ai/prompts.ts`
2. **A/B Test in Production**: Deploy winning variation and track user engagement
3. **Create Model-Specific Prompts**: If different models need different prompts, implement per-model selection
4. **Build Playground UI**: Create admin interface for interactive testing (future enhancement)
5. **Add Regression Tests**: Include winning tests in CI to prevent regressions

## File Structure

```txt
scripts/
├── test-scenarios.json          # Test scenario definitions
├── prompt-variations.ts         # Prompt variation implementations
├── evaluation-metrics.ts        # Automated evaluation logic
├── run-prompt-test.ts          # Main test runner CLI
├── compare-tests.ts            # Results comparison CLI
└── test-results/               # Generated test results
    ├── .gitignore              # Excludes results from git
    └── *.json                  # Individual test result files
```

## Related Documentation

- [SCENE_METADATA.md](./SCENE_METADATA.md) - Metadata system documentation
- [AI_PROVIDERS.md](./AI_PROVIDERS.md) - AI provider setup guide
- [src/lib/ai/prompts.ts](./src/lib/ai/prompts.ts) - Production prompt code
- [src/lib/ai/client.ts](./src/lib/ai/client.ts) - AI client implementation

---

**Happy Testing!** 🧪

Remember: The goal is to discover what works through rapid experimentation, not to test exhaustively. Start with a few promising variations, iterate based on results, and gradually refine your prompts.
