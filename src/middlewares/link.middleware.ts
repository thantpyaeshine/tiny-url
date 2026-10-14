import handle from '@middleware/handler';
import type { Middleware } from '@type/express';
import { matchedData } from 'express-validator';
import { Link } from '../prisma/db';

export const protectCreateLink: Middleware = handle(
    async (req, res, next) => {
        let { url } = matchedData(req);

        url = url.startsWith('https://')
            ? url.slice('https://'.length)
            : url;

        const link = await Link.where({
            url,
        }).first();

        if (link) {
            return res.status(201).json({ slug: link.slug });
        }

        req.url = url;

        next();
    }
);

export const protectGetLink: Middleware = handle(
    async (req, res, next) => {
        const { slug } = matchedData(req);

        const link = await Link.where({
            slug,
        }).first();

        if (!link) {
            return res.status(404).json({ error: 'Link not found' });
        }

        req.link = link;
        next();
    }
);