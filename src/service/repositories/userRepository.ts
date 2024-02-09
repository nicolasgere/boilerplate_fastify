import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { DatabaseError } from "pg";
import { ServerError } from "../../helpers/error";
import { DbService } from "../db/db";
import { Team, teams } from "../db/schema/team";
import { teamMembership } from "../db/schema/teamMembership";
import { UserModel, users } from "../db/schema/user";
import { UNIQUE_VIOLATION } from "../db/utils";

export const UNIQUE_EMAIL_ERROR = "UNIQUE_EMAIL_ERROR";

export class UserRepository {
	private dbService: DbService;
	constructor({ dbService }: { dbService: DbService }) {
		this.dbService = dbService;
	}
	async createUser({ email, password }: { email: string; password: string }) {
		const passwordHash = await bcrypt.hash(password, 10);
		try {
			const [user] = await this.dbService
				.getClient()
				.insert(users)
				.values({ email, password_hash: passwordHash })
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

	async getTeamsForUser(userId: number){
		const rows = await this.dbService
			.getClient()
			.select()
			.from(users)
			.innerJoin(teamMembership, eq(teamMembership.userId, users.id))
			.innerJoin(teams, eq(teamMembership.userId, users.id))
			.where(eq(users.id, userId));
		return rows.map((row) => row.teams);
	}

	async verifyEmailPassword({
		email,
		password,
	}: { email: string; password: string }): Promise<UserModel | undefined> {
		const user = await this.dbService
			.getClient()
			.query.users.findFirst({ where: eq(users.email, email) });
		if (!user) {
			return;
		}
		const valid = await bcrypt.compare(password, user.password_hash);
		if (valid) {
			return user;
		}
	}
}
