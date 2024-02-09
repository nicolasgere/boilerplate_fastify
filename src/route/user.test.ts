import assert from "node:assert";
import { after, before, describe, it } from "node:test";
import { faker } from "@faker-js/faker";
import { FastifyInstance } from "fastify";
import { initServer } from "../server";
import { newBed } from "../test_utils/bed";

describe("User endpoint", () => {
	let server: FastifyInstance;
	before(async () => {
		server = await initServer();
		await server.ready();
	});
	after(async () => {
		await server.close();
	});
	describe("POST /api/v1/whoami", () => {
		it("Should succeed with logged", async () => {
			const seed = await newBed(server);
			const response = await server.inject({
				method: "GET",
				url: "/api/v1/whoami",
				cookies: {
					sessionId: seed.user.sessionIdCookie,
				},
			});
			assert.equal(response.statusCode, 200);
			const result = response.json();
			assert.equal(result.email, seed.user.email);
		});
		it("Should fail with wrong session", async () => {
			const response = await server.inject({
				method: "GET",
				url: "/api/v1/whoami",
				cookies: {
					sessionId: faker.string.alpha(),
				},
			});
			assert.equal(response.statusCode, 403);
		});
	});
});
