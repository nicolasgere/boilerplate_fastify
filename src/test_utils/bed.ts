import { faker } from "@faker-js/faker";
import { FastifyInstance } from "fastify";

interface TestBed {
	user: { email: string; password: string; id: number };
}

export async function newBed(server: FastifyInstance): Promise<TestBed> {
	const { userRepository } = server.diContainer.cradle;
	const user = await userRepository.createUser({
		email: faker.internet.email(),
		password: faker.internet.password(),
	});
	return { user };
}
