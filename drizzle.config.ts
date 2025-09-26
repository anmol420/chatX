import { defineConfig } from "drizzle-kit";

import { env } from "./src/helpers/env.helper";

export default defineConfig({
    out: './drizzle/migrations',
    schema: './src/db/schemas/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: env.DATABASE_URL,
    },
    verbose: true,
    strict: true,
});