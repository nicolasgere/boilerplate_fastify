import { faker } from "@faker-js/faker";
import { FastifyInstance } from "fastify";

interface TestBed {
	user: {
		email: string;
		password: string;
		id: number;
		password_hash: string | null;
		sessionIdCookie: string;
		team: {id: number, name: string}
	};
}

export async function newBed(server: FastifyInstance): Promise<TestBed> {
	const {userRepository, teamRepository} = server.diContainer.cradle
	const password = faker.internet.password();
	const user = await userRepository.createUser({
		email: faker.internet.email(),
		password: password,
	});
	const team = await teamRepository.createTeam({
		name: 'default',
		ownerUserId: user.id
	});

	// Super weird, but the only way to get the cookie stored in session
	const response = await server.inject({
		method: "POST",
		url: "/api/v1/auth/login",
		payload: {
			email: user.email,
			password: password,
		},
	});
	if (response.statusCode !== 200) {
		throw "cannot login in seed";
	}
	const sessionIdCookie = response.cookies.find(
		(cookie) => cookie.name === "sessionId",
	)?.value;
	if (!sessionIdCookie) {
		throw "cannot login in seed";
	}

	return { user: { ...user, password, sessionIdCookie, team } };
}
