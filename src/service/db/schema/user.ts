import { Omit } from "@sinclair/typebox";
import { pgTable, serial, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
export const users = pgTable(
	"users",
	{
		id: serial("id").primaryKey(),
		email: varchar("email", { length: 256 }).notNull(),
		password: varchar("password", { length: 256 }).notNull(),
	},
	(users) => {
		return {
			emailIndex: uniqueIndex("email_idx").on(users.email),
		};
	},
);

export const insertUserSchema = createInsertSchema(users);
const selectSchema = createSelectSchema(users);
export const selectUserSchema = Omit(selectSchema, ["password"]);
