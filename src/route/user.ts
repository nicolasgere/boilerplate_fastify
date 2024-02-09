import { FastifyInstance } from "fastify";
import { selectUserWithoutPasswordSchema } from "../service/db/schema/user";

export function registerUserRoute(instance: FastifyInstance) {
	instance.get(
		"/api/v1/whoami",
		{
			schema: {
				response: {
					200: selectUserWithoutPasswordSchema,
				},
			},
		},
		async (request, reply) => {
			return reply.status(200).send(request.session.user);
		},
	);
}
