import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { ConfigurationService } from "../utils/configuration";
import { users } from "./schema/user";

export class DbService {
	private client: Client;
	private db;
	constructor({
		configurationService,
	}: { configurationService: ConfigurationService }) {
		this.client = new Client({
			connectionString: configurationService.get().database_url,
		});
		this.db = drizzle(this.client, { schema: { users } });
	}
	getClient() {
		return this.db;
	}
	protected async init() {
		await this.client.connect();
	}
	protected async dispose() {
		await this.client.end();
	}
}
