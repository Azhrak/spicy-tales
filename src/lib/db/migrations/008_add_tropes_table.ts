import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Create tropes table
	await db.schema
		.createTable("tropes")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
		)
		.addColumn("key", "varchar(100)", (col) => col.notNull().unique())
		.addColumn("label", "varchar(255)", (col) => col.notNull())
		.addColumn("description", "text")
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.addColumn("updated_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.execute();

	// Create index on key for fast lookups
	await db.schema
		.createIndex("tropes_key_idx")
		.on("tropes")
		.column("key")
		.execute();

	// Seed with existing tropes from preferences.ts
	await db
		.insertInto("tropes")
		.values([
			{
				key: "enemies-to-lovers",
				label: "Enemies to Lovers",
				description:
					"Characters start as adversaries and develop romantic feelings",
			},
			{
				key: "fake-dating",
				label: "Fake Dating",
				description: "Characters pretend to be in a relationship",
			},
			{
				key: "second-chance",
				label: "Second Chance",
				description: "Former lovers reunite and rekindle their romance",
			},
			{
				key: "forced-proximity",
				label: "Forced Proximity",
				description:
					"Characters are forced to spend time together in close quarters",
			},
			{
				key: "childhood-friends",
				label: "Childhood Friends",
				description: "Friends since childhood develop romantic feelings",
			},
			{
				key: "ceo-romance",
				label: "CEO Romance",
				description: "Romance involving a powerful CEO or business executive",
			},
			{
				key: "forbidden-love",
				label: "Forbidden Love",
				description: "Romance that defies social norms or rules",
			},
			{
				key: "fated-mates",
				label: "Fated Mates",
				description: "Destined partners in paranormal or fantasy settings",
			},
			{
				key: "time-travel",
				label: "Time Travel",
				description: "Romance across different time periods",
			},
		])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop the tropes table
	await db.schema.dropTable("tropes").execute();
}
