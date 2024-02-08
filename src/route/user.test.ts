import assert from "node:assert";
import { after, before, describe, it } from "node:test";
import { faker } from "@faker-js/faker";
import { Static } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { initServer } from "../server";
import { UNIQUE_EMAIL_ERROR } from "../service/repositories/userRepository";
import { newBed } from "../test_utils/bed";
import { postUserBodySchema } from "./user";

describe("User endpoint", () => {
	let server: FastifyInstance;
	before(async () => {
		server = await initServer();
	});
	after(async () => {
		await server.close();
	});
	describe("POST /user", () => {
		it("Should create a user", async () => {
			const payload: Static<typeof postUserBodySchema> = {
				email: faker.internet.email(),
				password: faker.internet.password(),
			};
			const response = await server.inject({
				method: "POST",
				url: "/v1/user",
				payload,
			});
			assert.equal(response.statusCode, 201);
		});
		it("Should fail with duplicated user", async () => {
			const seed = await newBed(server);
			const payload: Static<typeof postUserBodySchema> = {
				email: seed.user.email,
				password: faker.internet.password(),
			};
			const response = await server.inject({
				method: "POST",
				url: "/v1/user",
				payload,
			});
			assert.equal(response.statusCode, 409);
			assert.equal(response.json().name, UNIQUE_EMAIL_ERROR);
		});
	});
});
