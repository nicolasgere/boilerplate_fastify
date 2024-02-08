import { fastifyAwilixPlugin } from "@fastify/awilix";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { asValue } from "awilix";
import Fastify from "fastify";
import { ServerError } from "./helpers/error";
import { registerRoute } from "./route";
import { registerService } from "./service";
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
		}
		throw error;
	});
	return server;
}
