import { validateTropeKeys } from "~/lib/db/queries/tropes";
import type { TemplateFormData, ValidationResult } from "./templates";
import { validateTemplateForm } from "./templates";

/**
 * Validates template form data including async validation of trope keys
 * This is a server-side only function that validates against the database
 */
export async function validateTemplateFormAsync(
	data: TemplateFormData,
): Promise<ValidationResult> {
	// First run basic validation
	const basicValidation = validateTemplateForm(data);
	if (!basicValidation.valid) {
		return basicValidation;
	}

	// Validate trope keys against database
	const validation = await validateTropeKeys(data.base_tropes);

	if (!validation.valid) {
		return {
			valid: false,
			error: `Invalid trope(s): ${validation.invalidKeys.join(", ")}`,
		};
	}

	return { valid: true };
}
