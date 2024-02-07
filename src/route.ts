import { Static, Type } from "@sinclair/typebox";
import server from "./server";

export const PingPayloadSchema = Type.Object({
  name: Type.String(),
});
export type PingPayload = Static<typeof PingPayloadSchema>;
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
      },
    },
    async (request, reply) => {
      return `pong ${request.body.name}`;
    }
  );
}
