import { Static, Type } from "@sinclair/typebox";

const configurationSchema = Type.Object({
	database_url: Type.String(),
});

// For now use embedded configuration, use yaml/secret later

export type Configuration = Static<typeof configurationSchema>;

const dev: Configuration = {
	database_url: "postgres://dev:dev@localhost:5432/dev",
};

export class ConfigurationService {
	private configuration: Configuration;
	constructor() {
		this.configuration = dev;
	}
	get(): Configuration {
		return this.configuration;
	}
}
