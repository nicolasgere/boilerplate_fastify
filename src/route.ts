import { Static, Type } from "@sinclair/typebox";
import server from "./server";

export const PingPayloadSchema = Type.Object({
  name: Type.String(),
});

export const PingResponseSchema = Type.Object({
  name: Type.String(),
});

export type PingPayload = Static<typeof PingPayloadSchema>;
export type PingReponse = Static<typeof PingResponseSchema>;

export function registerRoute() {
  server.get("/", async (request, reply) => {
    const userRepositoryForReq = request.diScope.resolve("userService");
    return userRepositoryForReq.hello();
  });
  server.post(
    "/ping",
    {
      schema: {
        body: PingPayloadSchema,
        response: {
          201: PingResponseSchema
        }
      },
    },
    async (request, reply) => {
      return reply.status(201).send({name: "Hello " + request.body.name});
    }
  );
}
