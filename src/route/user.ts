import { Type } from "@sinclair/typebox";
import { ServerError } from "../helpers/error";
import server from "../server";
import { insertUserSchema, selectUserSchema } from "../service/db/schema/user";

export const postUserBodySchema = Type.Omit(insertUserSchema, ["id"]);
export const getUserResponseSchema = selectUserSchema;

export const USER_NOT_FOUND_ERROR = "USER_NOT_FOUND_ERROR";

export function registerUserRoute() {
	server.get(
		"/v1/user/:id",
		{
			schema: {
				params: Type.Object({
					id: Type.Number(),
				}),
				response: {
					200: getUserResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const userRepository = request.diScope.cradle.userRepository;
			const user = await userRepository.getMaybeUserById(request.params.id);
			if (!user) {
				throw new ServerError(USER_NOT_FOUND_ERROR, 404, "user not found");
			}
			return reply.status(201).send(user);
		},
	);
	server.post(
		"/v1/user",
		{
			schema: {
				body: postUserBodySchema,
			},
		},
		async (request, reply) => {
			const userRepository = request.diScope.resolve("userRepository");
			// This is an example, we should not store password this way
			await userRepository.createUser(request.body);
			return reply.status(201).send();
		},
	);
}
