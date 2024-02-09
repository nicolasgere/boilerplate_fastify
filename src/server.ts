import { fastifyAwilixPlugin } from "@fastify/awilix";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { asValue } from "awilix";
import Fastify from "fastify";
import { ServerError } from "./helpers/error";
import { registerRoute } from "./route";
import { registerService } from "./service";
import { UserModel } from "./service/db/schema/user";

declare module "fastify" {
	interface Session {
		user_id?: number;
		user: UserModel;
	}
}

const server = Fastify().withTypeProvider<TypeBoxTypeProvider>();

export default server;

export async function initServer() {
	await server.register(require("@fastify/swagger"), {
		swagger: {
			info: {
				title: "Chroma API",
				description: "Testing the Fastify swagger API",
				version: "0.1.0",
			},
		},
	});
	await server.register(require("@scalar/fastify-api-reference"), {
		routePrefix: "/documentation",
		title: "Chroma API",
	});
	await server.register(fastifyAwilixPlugin, {
		disposeOnClose: true,
		asyncDispose: true,
		asyncInit: true,
	});
	await server.register(fastifyCookie);
	await server.register(fastifySession, {
		secret: "this_is_fake_secret_this_is_fake_secret_this_is_fake_secret",
	});
	// await server.register(fastifyPassport.initialize())
	// fastifyPassport.use('local', localStrategy)
	await registerService();

	server.addHook("onRequest", (request, reply, done) => {
		request.diScope.register({
			request: asValue(request),
			reply: asValue(reply),
		});
		done();
	});
	registerRoute();
	server.setErrorHandler((error, request, reply) => {
		if (error instanceof ServerError) {
			reply
				.status(error.httpCode)
				.send({ description: error.description, name: error.name });
			return;
		}
		throw error;
	});
	return server;
}
