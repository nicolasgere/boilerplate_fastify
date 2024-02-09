import { Omit } from "@sinclair/typebox";
import {
	pgTable,
	serial,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
export const users = pgTable(
	"users",
	{
		id: serial("id").primaryKey(),
		uuid: uuid("uuid").defaultRandom(),
		email: varchar("email", { length: 256 }).notNull(),
		password_hash: varchar("password_hash", { length: 512 }).notNull(),
	},
	(users) => {
		return {
			emailIndex: uniqueIndex("email_idx").on(users.email),
		};
	},
);

export const insertUserSchema = createInsertSchema(users);
const selectSchema = createSelectSchema(users);
export type UserModel = typeof users.$inferSelect;
export const selectUserWithoutPasswordSchema = Omit(selectSchema, [
	"password_hash",
]);
