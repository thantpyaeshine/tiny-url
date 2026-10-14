import handle from '@middleware/handler';
import type { Middleware } from '@type/express';
import { createHash } from 'crypto';
import { getCache, setCache } from '../redis/cache';

export const cache: Middleware = handle(
    async (req, res, next) => {
        const reqData = {
            method: req.method,
            path: req.baseUrl + req.path,
            query: req.query,
            body: req.body,
        };

        const hash = createHash('sha256').update(JSON.stringify(reqData)).digest('hex');

        const cached = await getCache(hash);

        if (cached && cached.status >= 200 && cached.status < 400) {
            return res.status(cached.status).json(cached.data);
        }

        const originalJson = res.json.bind(res);

        res.json = ((data: unknown) => {
            const response = {
                status: res.statusCode,
                data,
            };

            // Cache the response asynchronously.
            void setCache(hash, response).catch(console.error);

            return originalJson(data);
        }) as typeof res.json;

        next();
    }
);