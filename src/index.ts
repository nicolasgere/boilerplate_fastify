
import { initDI } from "./service";
import  {initServer} from "./server";
import { registerRoute } from "./route";


async function main() {
  const server = await initServer()
  server.listen({ port: 8080 }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
}

main().then(console.log).catch(console.error);
