import { eq } from "drizzle-orm";
import { DatabaseError } from "pg";
import { ServerError } from "../../helpers/error";
import { DbService } from "../db/db";
import { users } from "../db/schema/user";
import { UNIQUE_VIOLATION } from "../db/utils";

export const UNIQUE_EMAIL_ERROR = "UNIQUE_EMAIL_ERROR";

export class UserRepository {
	private dbService: DbService;
	constructor({ dbService }: { dbService: DbService }) {
		this.dbService = dbService;
	}
	async createUser({ email, password }: { email: string; password: string }) {
		try {
			const [user] = await this.dbService
				.getClient()
				.insert(users)
				.values({ email, password })
				.returning();
			return user;
		} catch (err) {
			if (err instanceof DatabaseError && err.code === UNIQUE_VIOLATION) {
				throw new ServerError(UNIQUE_EMAIL_ERROR, 409, "email not available");
			}
			throw err;
		}
	}
	async getMaybeUserById(id: number) {
		return await this.dbService
			.getClient()
			.query.users.findFirst({ where: eq(users.id, id) });
	}
}
