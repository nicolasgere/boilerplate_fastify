import { diContainer } from "@fastify/awilix";
import { Lifetime, asClass } from "awilix";
import { FastifyReply } from "fastify";
import { FastifyRequest } from "fastify/types/request";
import { DbService } from "./db/db";
import { UserRepository } from "./repositories/userRepository";
import { ConfigurationService } from "./utils/configuration";
import { Logger } from "./utils/logger";
declare module "@fastify/awilix" {
	interface Cradle {
		userRepository: UserRepository;
		dbService: DbService;
		configurationService: ConfigurationService;
		logger: Logger;
	}
	interface RequestCradle {
		request: FastifyRequest;
		reply: FastifyReply;
	}
}

export function registerService() {
	diContainer.register({
		configurationService: asClass(ConfigurationService, {
			lifetime: Lifetime.SINGLETON,
		}),
	});
	diContainer.register({
		dbService: asClass(DbService, {
			lifetime: Lifetime.SINGLETON,
			// @ts-ignore
			asyncDispose: "dispose",
			asyncInit: "init",
		}),
	});
	diContainer.register(
		"userRepository",
		asClass(UserRepository, {
			lifetime: Lifetime.SCOPED,
		}),
	);
	diContainer.register({
		logger: asClass(Logger, {
			lifetime: Lifetime.SCOPED,
		}),
	});
}
