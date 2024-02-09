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
			const { userRepository, configurationService, teamRepository } =
				request.diScope.cradle;
			const config = configurationService.get();
			const user = await userRepository.createUser({
				email: request.body.email,
				password: request.body.password,
			});
			await teamRepository.createTeam({
				name: "default",
				ownerUserId: user.id,
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
			return reply.status(201).send({
				message: "Authentication successful",
				user,
			});
		},
	);
	server.get(
		"/api/v1/auth/:provider/signup",
		{
			schema: {
				params: Type.Object({
					provider: Type.Union([Type.Literal("google")]),
				}),
			},
		},
		async (request, reply) => {
			const { openIdService } = request.diScope.cradle;
			const redirectUrl = await openIdService.getRedirectUrl(
				request.params.provider,
				"signup",
			);
			reply.redirect(302, redirectUrl);
		},
	);
	server.get(
		"/auth/:provider/callback",
		{
			schema: {
				params: Type.Object({
					provider: Type.Union([Type.Literal("google")]),
				}),
				querystring: Type.Object({
					code: Type.String(),
					state: Type.String(),
				}),
			},
		},
		async (request, reply) => {
			const { openIdService, userRepository, teamRepository, configurationService } =
				request.diScope.cradle;
			const config = configurationService.get()
			const { code, state } = request.query;
			const openIdUser = await openIdService.exchangeCode(
				request.params.provider,
				code,
				state,
			);
			// Check if openIdUser have already a linked account
			let user = await userRepository.getMaybeUserByAuthUUID(openIdUser.uuid);
			if (!user) {
				// Check if openIdUser have already an account with email
				user = await userRepository.getMaybeUserByEmail(openIdUser.email);
				if (!user) {
					user = await userRepository.createUserWithoutPassword(
						openIdUser.email,
					);
				}
				await userRepository.createUserLinked({
					userId: user.id,
					uuid: openIdUser.uuid,
				});
				await teamRepository.createTeam({
					name: "default",
					ownerUserId: user.id,
				});
			}
			reply.setCookie("userLoggedIn", "true", {
				domain: config.cookie_base_domain,
				expires: new Date(
					Date.now() + config.cookie_expire_internal_seconds * 10000,
				),
			});
			request.session.set("user_id", user.id);
			await request.session.save();
			reply.status(200).send("ok");
		},
	);
}
