import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';
import ENV from './src/config/env.config';

export default definePrismaConfig({
    orm: ormConfig({
        contract: "./src/prisma/contract.ts",
        db: {
            connection: ENV.DATABASE_URL,
        },
    }),
});
