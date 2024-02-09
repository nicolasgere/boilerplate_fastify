import server from "../server";
import { registerAuthRoute } from "./auth";
import { authGuard } from "./guard/auth";
import { registerUserRoute } from "./user";

export function registerRoute() {
	registerAuthRoute();

	// Register all which require authentication
	server.register((instance, opts, next) => {
		instance.addHook("preValidation", authGuard);
		registerUserRoute(instance);
		next();
	});
}
