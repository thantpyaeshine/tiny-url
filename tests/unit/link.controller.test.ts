import { describe, expect, it, jest } from '@jest/globals';

const update = jest.fn(async (_data: { slug: string }) => 1);

jest.unstable_mockModule('@/lib/util', () => ({
    generateId: () => 1234,
}));

jest.unstable_mockModule('@/prisma/db', () => ({
    Link: {
        create: jest.fn(async ({ id, url }: { id: number; url: string }) => ({
            id,
            url,
        })),
        where: jest.fn(() => ({ update })),
    },
}));

const { createLink, fetchLink } = await import('@/controllers/link.controller');
const { Link } = await import('@/prisma/db');

describe('link controller', () => {
    it('creates a link, stores its slug, and returns it', async () => {
        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await createLink(
            { url: 'example.com' } as any,
            response as any,
            jest.fn(),
        );

        expect(Link.create).toHaveBeenCalledWith({
            id: 1234,
            url: 'example.com',
        });
        expect(update).toHaveBeenCalledWith({ slug: 'jU' });
        expect(response.status).toHaveBeenCalledWith(201);
        expect(response.json).toHaveBeenCalledWith({ slug: 'jU' });
    });

    it('redirects to the stored URL with HTTPS', async () => {
        const response = {
            status: jest.fn().mockReturnThis(),
            redirect: jest.fn(),
        };

        await fetchLink(
            { link: { url: 'example.com' } } as any,
            response as any,
            jest.fn(),
        );

        expect(response.status).toHaveBeenCalledWith(302);
        expect(response.redirect).toHaveBeenCalledWith('https://example.com');
    });

    it('falls back to root redirect when a link is unavailable', async () => {
        const response = {
            status: jest.fn().mockReturnThis(),
            redirect: jest.fn(),
        };

        await fetchLink(
            {} as any,
            response as any,
            jest.fn(),
        );

        expect(response.status).toHaveBeenCalledWith(302);
        expect(response.redirect).toHaveBeenCalledWith('https:///');
    });
});
