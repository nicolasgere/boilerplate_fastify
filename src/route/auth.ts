import { Type } from "@sinclair/typebox";
import { ServerError } from "../helpers/error";
import server from "../server";
import { selectUserWithoutPasswordSchema } from "../service/db/schema/user";

const loginUserReponseSchema = Type.Object({
	message: Type.String(),
	user: selectUserWithoutPasswordSchema,
});

export function registerAuthRoute() {
	server.post(
		"/api/v1/auth/login",
		{
			schema: {
				body: Type.Object({
					email: Type.String(),
					password: Type.String(),
				}),
				response: {
					200: loginUserReponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { userRepository, configurationService } = request.diScope.cradle;
			const config = configurationService.get();
			const user = await userRepository.verifyEmailPassword({
				email: request.body.email,
				password: request.body.password,
			});
			if (!user) {
				throw new ServerError(
					"AUTHENTICATION_FAIL",
					401,
					"request cannot be authorized",
				);
			}
			reply.setCookie("userLoggedIn", "true", {
				domain: config.cookie_base_domain,
				expires: new Date(
					Date.now() + config.cookie_expire_internal_seconds * 10000,
				),
			});
			request.session.set("user_id", user.id);
			await request.session.save();

			return reply.status(200).send({
				message: "Authentication successful",
				user,
			});
		},
	);
	server.post(
		"/api/v1/auth/signin",
		{
			schema: {
				body: Type.Object({
					email: Type.String(),
					password: Type.String(),
				}),
				response: {
					200: loginUserReponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { userRepository, configurationService } = request.diScope.cradle;
			const config = configurationService.get();
			const user = await userRepository.createUser({
				email: request.body.email,
				password: request.body.password,
			});
			if (!user) {
				throw new ServerError(
					"AUTHENTICATION_FAIL",
					401,
					"request cannot be authorized",
				);
			}
			//
			reply.setCookie("userLoggedIn", "true", {
				domain: config.cookie_base_domain,
				expires: new Date(
					Date.now() + config.cookie_expire_internal_seconds * 10000,
				),
			});
			return reply.status(201).send({
				message: "Authentication successful",
				user,
			});
		},
	);
}
