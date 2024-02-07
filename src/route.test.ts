import assert from "node:assert";
import { after, before, describe, it } from "node:test";
import { initServer } from "./server";
import { FastifyInstance } from "fastify";
import { PingPayload } from "./route";

describe("Test endpoint", () => {
  let server: FastifyInstance;
  before(async () => {
    server = await initServer();
  });
  after(async ()=>{
    await server.close()
  })
  it("Get", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/",
    });
    assert.equal(response.payload, "HELLO FROM SERVICE");
  });
  it("Post", async () => {
    const payload: PingPayload = {
      name: "toto",
    };
    const response = await server.inject({
      method: "POST",
      url: "/ping",
      payload,
    });
    assert.equal(response.payload, "pong toto");
  });
});
