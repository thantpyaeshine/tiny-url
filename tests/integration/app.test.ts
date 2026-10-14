import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';

type TestServer = {
    address: () => { port: number } | string | null;
    close: (callback: (error?: Error) => void) => void;
};

type LinkRecord = {
    id: number;
    url: string;
    slug: string;
};

const links: LinkRecord[] = [];
let idCounter = 1_000_000_000;

const env = (globalThis as typeof globalThis & {
    process: { env: Record<string, string | undefined> };
}).process.env;

env.BETTER_AUTH_SECRET ??= 'integration-test-secret';
env.AUTH_DB_URI ??= 'postgres://localhost:5432/auth_test';
env.DATABASE_URL ??= 'postgres://localhost:5432/link_test';

jest.unstable_mockModule('@/lib/util', () => ({
    generateId: () => idCounter++,
}));

jest.unstable_mockModule('@/prisma/db', () => ({
    Link: {
        create: async ({ id, url }: { id: number; url: string }) => {
            const record: LinkRecord = {
                id,
                url,
                slug: '',
            };
            links.push(record);

            return record;
        },
        where: (query: Partial<LinkRecord>) => {
            if (query.slug === 'explode') {
                throw new Error('simulated persistence failure');
            }

            return {
                first: async () =>
                    links.find((link) => (
                        (query.id !== undefined && link.id === query.id) ||
                        (query.url !== undefined && link.url === query.url) ||
                        (query.slug !== undefined && link.slug === query.slug)
                    )) ?? null,
                update: async (data: Partial<LinkRecord>) => {
                    const link = links.find((item) => item.id === query.id);
                    if (!link) {
                        return 0;
                    }

                    Object.assign(link, data);
                    return 1;
                },
            };
        },
    },
}));

jest.unstable_mockModule('@/redis/cache', () => ({
    getCache: async () => null,
    setCache: async () => {},
}));

const appModulePath = '@/app';
const { default: app } = await import(appModulePath);

describe('Express app link route integration', () => {
    let server: TestServer;
    let baseUrl: string;

    beforeAll(async () => {
        server = await new Promise<TestServer>((resolve) => {
            const runningServer: TestServer = app.listen(0, () => resolve(runningServer));
        });

        const address = server.address();
        if (!address || typeof address === 'string') {
            throw new Error('Test server did not expose a TCP address');
        }
        baseUrl = `http://127.0.0.1:${address.port}`;
    });

    beforeEach(() => {
        links.splice(0, links.length);
        idCounter = 1_000_000_000;
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        });
    });

    it('serves the homepage', async () => {
        const response = await fetch(baseUrl);

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/html');
        await expect(response.text()).resolves.toContain('<title>Tiny URL</title>');
    });

    it('creates a slug for a new URL', async () => {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ url: 'https://example.com' }),
        });

        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toEqual({ slug: '15FTGg' });
    });

    it('returns the existing slug for duplicate URLs', async () => {
        await fetch(baseUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ url: 'https://example.com' }),
        });

        const duplicate = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ url: 'https://example.com' }),
        });

        expect(duplicate.status).toBe(201);
        await expect(duplicate.json()).resolves.toEqual({ slug: '15FTGg' });
    });

    it('rejects invalid URL input', async () => {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ url: 'not-a-url' }),
        });
        const body = await response.json() as { errors: Array<{ msg: string }> };

        expect(response.status).toBe(400);
        expect(body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'url must be a valid URL' }),
            ]),
        );
    });

    it('redirects to the expanded URL for an existing slug', async () => {
        await fetch(baseUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ url: 'https://example.com' }),
        });

        const response = await fetch(`${baseUrl}/15FTGg`, { redirect: 'manual' });

        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toBe('https://example.com');
    });

    it('returns 404 when the requested slug does not exist', async () => {
        const response = await fetch(`${baseUrl}/missing-slug`);

        expect(response.status).toBe(404);
        await expect(response.json()).resolves.toEqual({ error: 'Link not found' });
    });

    it('routes thrown route errors through centralized error handling', async () => {
        const log = jest.spyOn(console, 'error').mockImplementation(() => {});

        const response = await fetch(`${baseUrl}/explode`);

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            message: 'Internal server error',
        });
        expect(log).toHaveBeenCalledWith(
            'Unhandled request error:',
            expect.any(Error),
        );
        log.mockRestore();
    });
});
