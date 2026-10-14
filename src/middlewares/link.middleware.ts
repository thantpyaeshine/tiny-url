import handle from '@middleware/handler';
import type { Middleware } from '@type/express';
import { matchedData } from 'express-validator';
import { Link } from '../prisma/db';
import { createHash } from 'crypto';
import { getCache } from '../redis/cache';

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

export const hitCache: Middleware = handle(
    async (req, res, next) => {

        const requestData = {
            method: req.method,
            path: req.baseUrl + req.path,
            query: req.query,
            body: req.body,
        };

        const hash = createHash('sha256').update(JSON.stringify(requestData)).digest('hex');

        const cache = await getCache(hash);

        if (cache) {
            return res.status(200).json(cache);
        }

        next();
    }
);