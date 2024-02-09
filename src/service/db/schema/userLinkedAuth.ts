import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { users } from "./user";

export const userLinkedAuth = pgTable("user_linked_auth", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	authUUID: varchar("auth_uuid", { length: 256 }).notNull(),
});
