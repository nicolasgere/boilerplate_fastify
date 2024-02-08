
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/service/db/schema',
  out: './migration',
  driver: 'pg',
  dbCredentials: {
    connectionString: 'postgres://dev:dev@localhost:5432/dev'
  }
} satisfies Config;