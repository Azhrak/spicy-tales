import { db } from "~/lib/db";
import { createAuditLog, extractChanges } from "./audit";

/**
 * Get all tropes
 */
export async function getAllTropes() {
	return db.selectFrom("tropes").selectAll().orderBy("label", "asc").execute();
}

/**
 * Get trope by ID
 */
export async function getTropeById(id: string) {
	return db
		.selectFrom("tropes")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();
}

/**
 * Get trope by key
 */
export async function getTropeByKey(key: string) {
	return db
		.selectFrom("tropes")
		.selectAll()
		.where("key", "=", key)
		.executeTakeFirst();
}

/**
 * Get multiple tropes by their keys
 */
export async function getTropesByKeys(keys: string[]) {
	if (keys.length === 0) {
		return [];
	}

	return db.selectFrom("tropes").selectAll().where("key", "in", keys).execute();
}

/**
 * Validate that all provided trope keys exist in the database
 */
export async function validateTropeKeys(keys: string[]): Promise<{
	valid: boolean;
	invalidKeys: string[];
}> {
	if (keys.length === 0) {
		return { valid: false, invalidKeys: [] };
	}

	const tropes = await getTropesByKeys(keys);
	const validKeys = new Set(tropes.map((t) => t.key));
	const invalidKeys = keys.filter((key) => !validKeys.has(key));

	return {
		valid: invalidKeys.length === 0,
		invalidKeys,
	};
}

/**
 * Create a new trope (admin only)
 */
export async function createTrope(
	trope: {
		key: string;
		label: string;
		description?: string;
	},
	userId: string,
) {
	// Check if key already exists
	const existing = await getTropeByKey(trope.key);
	if (existing) {
		throw new Error(`Trope with key "${trope.key}" already exists`);
	}

	const [newTrope] = await db
		.insertInto("tropes")
		.values({
			key: trope.key,
			label: trope.label,
			description: trope.description || null,
		})
		.returning(["id", "key", "label"])
		.execute();

	// Log the creation
	await createAuditLog({
		userId,
		action: "create_trope",
		entityType: "template", // Using template as closest entity type
		entityId: newTrope.id,
		changes: { created: trope },
	});

	return newTrope;
}

/**
 * Update a trope
 */
export async function updateTrope(
	tropeId: string,
	updates: {
		key?: string;
		label?: string;
		description?: string;
	},
	userId: string,
) {
	// Get old trope for audit log
	const oldTrope = await getTropeById(tropeId);

	if (!oldTrope) {
		throw new Error("Trope not found");
	}

	// If updating key, check it doesn't conflict with another trope
	if (updates.key && updates.key !== oldTrope.key) {
		const existing = await getTropeByKey(updates.key);
		if (existing) {
			throw new Error(`Trope with key "${updates.key}" already exists`);
		}
	}

	// Update trope
	const [updatedTrope] = await db
		.updateTable("tropes")
		.set({
			...updates,
			updated_at: new Date(),
		})
		.where("id", "=", tropeId)
		.returning(["id", "key", "label"])
		.execute();

	// Log the update with changes
	const changes = extractChanges(oldTrope, { ...oldTrope, ...updates });

	await createAuditLog({
		userId,
		action: "update_trope",
		entityType: "template",
		entityId: tropeId,
		changes,
	});

	return updatedTrope;
}

/**
 * Delete a trope (admin only)
 * Note: This should check if any templates are using this trope first
 */
export async function deleteTrope(tropeId: string, userId: string) {
	// Get trope info for audit log
	const trope = await getTropeById(tropeId);

	if (!trope) {
		throw new Error("Trope not found");
	}

	// Check if any templates are using this trope
	// Get all templates and filter in JavaScript to check if trope key is in base_tropes array
	const templates = await db
		.selectFrom("novel_templates")
		.selectAll()
		.execute();

	const templatesWithTrope = templates.filter((t) =>
		(t.base_tropes as string[]).includes(trope.key),
	);

	if (templatesWithTrope.length > 0) {
		throw new Error(
			`Cannot delete trope "${trope.label}" because it is used by ${templatesWithTrope.length} template(s)`,
		);
	}

	// Delete the trope
	await db.deleteFrom("tropes").where("id", "=", tropeId).execute();

	// Log the deletion
	await createAuditLog({
		userId,
		action: "delete_trope",
		entityType: "template",
		entityId: tropeId,
		changes: {
			deleted: {
				key: trope.key,
				label: trope.label,
			},
		},
	});
}

/**
 * Get trope usage statistics
 */
export async function getTropeUsageStats() {
	const templates = await db
		.selectFrom("novel_templates")
		.select(["id", "base_tropes"])
		.execute();

	const usageMap = new Map<string, number>();

	for (const template of templates) {
		const tropes = template.base_tropes as string[];
		for (const trope of tropes) {
			usageMap.set(trope, (usageMap.get(trope) || 0) + 1);
		}
	}

	const allTropes = await getAllTropes();

	return allTropes.map((trope) => ({
		...trope,
		usageCount: usageMap.get(trope.key) || 0,
	}));
}
