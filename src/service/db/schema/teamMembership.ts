import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { teams } from "./team";
import { users } from "./user";

export const teamMembership = pgTable("team_memberships", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	teamId: integer("team_id")
		.notNull()
		.references(() => teams.id),
});
