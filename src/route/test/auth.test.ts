import assert from "node:assert";
import { after, before, describe, it, mock } from "node:test";
import { faker } from "@faker-js/faker";
import { FastifyInstance } from "fastify";
import { initServer } from "../../server";
import { UNIQUE_EMAIL_ERROR } from "../../service/repositories/userRepository";
import { newBed } from "../../test_utils/bed";
import { OpenIdService } from "../../service/utils/openid";
import { randomUUID } from "node:crypto";

describe("Auth endpoint", () => {
	let server: FastifyInstance;
	before(async () => {
		server = await initServer();
		await server.ready();
	});
	after(async () => {
		await server.close();
	});
	describe("POST /api/v1/auth/signin", () => {
		it("Should create a user", async () => {
			const payload = {
				email: faker.internet.email(),
				password: faker.internet.password(),
			};
			const response = await server.inject({
				method: "POST",
				url: "/api/v1/auth/signin",
				payload,
			});
			assert.equal(response.statusCode, 201);
			assert.equal(response.cookies[0].name, "userLoggedIn");
		});
		it("Should fail with duplicated user", async () => {
			const seed = await newBed(server);
			const payload = {
				email: seed.user.email,
				password: faker.internet.password(),
			};
			const response = await server.inject({
				method: "POST",
				url: "/api/v1/auth/signin",
				payload,
			});
			assert.equal(response.statusCode, 409);
			assert.equal(response.json().name, UNIQUE_EMAIL_ERROR);
		});
	});
	describe("POST /api/v1/auth/login", () => {
		it("Should login to a user", async () => {
			const seed = await newBed(server);
			const response = await server.inject({
				method: "POST",
				url: "/api/v1/auth/login",
				payload: {
					email: seed.user.email,
					password: seed.user.password,
				},
			});
			assert.equal(response.statusCode, 200);
			assert.equal(response.cookies[0].name, "userLoggedIn");
			assert.equal(response.cookies[1].name, "sessionId");
		});
		it("Should fail login to a user with wrong password", async () => {
			const seed = await newBed(server);
			const response = await server.inject({
				method: "POST",
				url: "/api/v1/auth/login",
				payload: {
					email: seed.user.email,
					password: faker.internet.password(),
				},
			});
			assert.equal(response.statusCode, 401);
			assert.equal(response.cookies.length, 0);
		});
		it("Should fail login to a user with wrong email", async () => {
			const seed = await newBed(server);
			const response = await server.inject({
				method: "POST",
				url: "/api/v1/auth/login",
				payload: {
					email: faker.internet.email(),
					password: seed.user.password,
				},
			});
			assert.equal(response.statusCode, 401);
			assert.equal(response.cookies.length, 0);
		});
	});
	['google'].forEach((provider) => {
		describe(`POST /api/v1/auth/${provider}/signup`, () => {
			it("Should redirect", async () => {
				const response = await server.inject({
					method: "GET",
					url: `/api/v1/auth/${provider}/signup`,
				});
				assert.equal(response.statusCode, 302);
				if(!response.headers.location){
					throw 'location should exist'
				}
				assert.doesNotThrow(() => {new URL(response.headers.location as string)});
			});
			it("Should create an account", async () => {
				mock.method(OpenIdService.prototype, 'exchangeCode', (providerName: string, code: string, state: string) => {
					assert.equal(providerName, provider)
					assert.equal(code, 'code')
					assert.equal(state, 'signup')
					return {email: faker.internet.email(), uuid: randomUUID()}
				} )
				const response = await server.inject({
					method: "GET",
					url: `/auth/${provider}/callback`,
					query: {
						code: 'code',
						state: 'signup'
					}
				});
				assert.equal(response.statusCode, 200);
				assert.equal(response.cookies[0].name, "userLoggedIn");
				assert.equal(response.cookies[1].name, "sessionId");
			});
		});
	})

});
