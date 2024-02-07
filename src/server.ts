import Fastify from "fastify";
import { Type, TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { fastifyAwilixPlugin } from "@fastify/awilix";
import { initDI } from "./service";
import { registerRoute } from "./route";
const server = Fastify().withTypeProvider<TypeBoxTypeProvider>();

export default server;

export async function initServer() {
  await server.register(require("@fastify/swagger"), {
    swagger: {
      info: {
        title: "Chroma API",
        description: "Testing the Fastify swagger API",
        version: "0.1.0",
      },
    },
  });
  await server.register(require('@scalar/fastify-api-reference'), {
    routePrefix: '/documentation',
    title: 'Chroma API',
  })

  
  await initDI();
  await server.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    asyncInit: true,
  });

  registerRoute();
  return server;
}
