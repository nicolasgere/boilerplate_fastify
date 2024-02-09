import { FastifyRequest } from "fastify";
import { ServerError } from "../../helpers/error";

export async function authGuard(request: FastifyRequest) {
	const user_id = request.session.get("user_id");
	if (!user_id) {
		throw new ServerError("NON_AUTHORIZED", 403, "request not authenticated");
	}
	const userRepository = request.diScope.resolve("userRepository");
	const user = await userRepository.getMaybeUserById(user_id);
	if (!user) {
		throw new ServerError("NON_AUTHORIZED", 403, "request not authenticated");
	}
	request.session.user = user;
}
