import { diContainer } from "@fastify/awilix";
import { asClass, asFunction, Lifetime } from "awilix";

declare module "@fastify/awilix" {
  interface Cradle {
    userService: UserService;
    userRepository: UserRepository;
  }
}

export class UserRepository {
  constructor() {
    // Constructor logic goes here
  }

  async dispose() {
    console.log("BYE")
  }
  async init() {
    await new Promise((resolve) => {
      setTimeout(() => {
        console.log("INIT ASYNC");
        resolve(undefined);
      }, 1000);
    });
  }
}

export class UserService {
  private userRepository;
  constructor({ userRepository }: { userRepository: UserRepository }) {
    this.userRepository = userRepository;
  }
  hello(): string {
    return "HELLO FROM SERVICE";
  }
  async dispose() {
    console.log("BYE")
  }
}

export const initDI = () => {
  diContainer.register('userRepository', asClass(UserRepository, {
    lifetime: Lifetime.SINGLETON,
    // Wrong type in the package
    // @ts-ignore
    asyncInit: 'init',
    asyncDispose: 'dispose',
    dispose: (module) => module.dispose(),
    
  }))
  diContainer.register({
    userService: asClass(UserService, {
      lifetime: Lifetime.SINGLETON,
      // @ts-ignore
      asyncDispose: 'dispose',
     
    }),
  });
};
