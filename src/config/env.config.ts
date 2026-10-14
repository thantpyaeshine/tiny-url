import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { z } from 'zod';

const envs = {
    production: ['prod', 'production'],
    development: ['dev', 'development', 'local'],
    test: ['test'],
} as const satisfies Record<string, readonly string[]>;

const path = (
    [
        ...(envs[(process.env.NODE_ENV || 'development') as keyof typeof envs] ?? []),
        '',
    ]
        .map((name) => (name ? `.env.${name}` : '.env'))
        .find((filePath) => existsSync(filePath)) ?? '.env'
);

config({
    path,
});

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    PORT: z.coerce.number().int().default(3000),

    REDIS_URI: z.string().min(1, 'REDIS_URI is required'),

    DATABASE_URL: z
        .string()
        .min(1, 'DATABASE_URL is required'),

});

const ENV = envSchema.parse(process.env);

export default ENV;
