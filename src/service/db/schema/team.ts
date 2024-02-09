import { pgTable, serial, uuid, varchar } from "drizzle-orm/pg-core";

export const teams = pgTable("teams", {
	id: serial("id").primaryKey(),
	uuid: uuid("uuid").defaultRandom().notNull(),
	name: varchar("name", { length: 256 }).notNull(),
});

export type Team = typeof teams.$inferSelect;
