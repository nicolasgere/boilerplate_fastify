# Project Commands Overview
## Run test
Start postgres `docker compose up`, run the migration `pnpm db:push`, run the test `pnpm test`

## Change the schema
Update schema in `service/db/schema`, generate migration `pnpm db:generate_migration`, apply `pnpm db:push`

## Commands
### `pnpm dev`
- **Runs the project in watch mode**, automatically recompiling TypeScript files on changes.

### `pnpm test`
- **Executes all `.test.ts` files** in the `src` directory, running unit tests to verify code integrity.

### `pnpm build`
- **Compiles the TypeScript project** according to `tsconfig.json`, producing JavaScript files for deployment.

### `pnpm db:generate_migration`
- **Generates a new database migration script** using Drizzle Kit for PostgreSQL schema changes.

### `pnpm db:push`
- **Applies the latest database schema changes** to the PostgreSQL database, updating it to match your current schema.

### `pnpm db:studio`
- **Launches Drizzle Kit Studio**, a UI for inspecting and interacting with your database.

### `pnpm format`
- **Format code with biome**,
