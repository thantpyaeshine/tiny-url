import { describe, expect, it, jest } from '@jest/globals';

type LinkRecord = {
    slug: string;
    url?: string;
};

const first = jest.fn<() => Promise<LinkRecord | null>>();

jest.unstable_mockModule('express-validator', () => ({
    matchedData: jest.fn((request: { __matchedData?: Record<string, unknown> }) =>
        request.__matchedData ?? {}),
}));

jest.unstable_mockModule('@/prisma/db', () => ({
    Link: {
        where: jest.fn(() => ({ first })),
    },
}));

const { protectCreateLink, protectGetLink } = await import('@/middlewares/link.middleware');
const { Link } = await import('@/prisma/db');

describe('link middleware', () => {
    it('returns an existing slug without calling next', async () => {
        first.mockResolvedValueOnce({ slug: 'existing-slug' });

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        await protectCreateLink(
            { __matchedData: { url: 'https://example.com' } } as any,
            response as any,
            next,
        );

        expect(Link.where).toHaveBeenCalledWith({ url: 'example.com' });
        expect(response.status).toHaveBeenCalledWith(201);
        expect(response.json).toHaveBeenCalledWith({ slug: 'existing-slug' });
        expect(next).not.toHaveBeenCalled();
    });

    it('stores a normalized URL on the request when the URL is new', async () => {
        first.mockResolvedValueOnce(null);

        const request = { __matchedData: { url: 'https://example.com' } };
        const next = jest.fn();

        await protectCreateLink(
            request as any,
            {} as any,
            next,
        );

        expect((request as any).url).toBe('example.com');
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('returns 404 when a slug does not exist', async () => {
        first.mockResolvedValueOnce(null);

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        await protectGetLink(
            { __matchedData: { slug: 'missing-slug' } } as any,
            response as any,
            next,
        );

        expect(Link.where).toHaveBeenCalledWith({ slug: 'missing-slug' });
        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalledWith({ error: 'Link not found' });
        expect(next).not.toHaveBeenCalled();
    });

    it('attaches the found link and continues for an existing slug', async () => {
        const link = { slug: 'known', url: 'example.com' };
        first.mockResolvedValueOnce(link);

        const request = { __matchedData: { slug: 'known' } };
        const next = jest.fn();

        await protectGetLink(
            request as any,
            {} as any,
            next,
        );

        expect((request as any).link).toBe(link);
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('forwards thrown errors to Express through the handler wrapper', async () => {
        const error = new Error('database failure');
        first.mockRejectedValueOnce(error);
        const next = jest.fn();

        await protectGetLink(
            { __matchedData: { slug: 'boom' } } as any,
            {} as any,
            next,
        );

        expect(next).toHaveBeenCalledWith(error);
    });
});
