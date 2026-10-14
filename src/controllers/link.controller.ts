import type { Controller } from '@type/express';
import base62 from 'base62';
import { fileURLToPath } from 'node:url';
import { generateId } from '../lib/util';
import { Link } from '../prisma/db';

export const createLink: Controller = async (req, res) => {
    const { url } = req;
    const id = Number(generateId());

    const link = await Link.create({
        id,
        url,
    });

    const slug = base62.encode(link.id);

    await Link.where({ id: link.id }).update({
        slug,
    });

    res.status(201).json({ slug });
};

export const fetchLink: Controller = async (req, res) => {
    const { link } = req;

    res.status(302).redirect(`https://${link?.url || '/'}`);
};

export const homepage: Controller = async (req, res) => {
    const path = fileURLToPath(new URL('../lib/index.html', import.meta.url));
    res.status(200).sendFile(path);
};