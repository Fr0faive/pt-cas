import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export const DRIZZLE_DB = 'DRIZZLE_DB';

export const drizzleProvider = {
  provide: DRIZZLE_DB,
  useFactory: () => {
    const connectionString =
      process.env.DATABASE_URL ??
      'postgresql://postgres:dfasofd005@localhost:5433/postgres';

    const client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 5,
    });

    return drizzle(client, { schema });
  },
};

export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;
