import { DbService } from "../db/db";
import { teams } from "../db/schema/team";
import { teamMembership } from "../db/schema/teamMembership";

export const UNIQUE_EMAIL_ERROR = "UNIQUE_EMAIL_ERROR";

export class TeamRepository {
	private dbService: DbService;
	constructor({ dbService }: { dbService: DbService }) {
		this.dbService = dbService;
	}
	async createTeam({
		name,
		ownerUserId,
	}: { name: string; ownerUserId: number }) {
		// TODO VALIDATE NAME AND CREATE OUTBOX ITEM
		return await this.dbService.getClient().transaction(async (tx) => {
			const [team] = await tx.insert(teams).values({ name }).returning();
			await tx
				.insert(teamMembership)
				.values({ userId: ownerUserId, teamId: team.id });
			return team;
		});
	}
}
