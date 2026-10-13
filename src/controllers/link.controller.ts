import type { Controller } from '@type/express';
import base62 from 'base62';
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

    res.json({ slug });
};

export const fetchLink: Controller = async (req, res) => {
    const { link } = req;

    res.status(302).redirect(`https://${link?.url || '/'}`);
};