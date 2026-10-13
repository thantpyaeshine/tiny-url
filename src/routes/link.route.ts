import handle from '@controller/handler';
import { createLink, fetchLink } from '@controller/link';
import { protectGetLink, protectCreateLink } from '@middleware/link';
import express from 'express';
import { validateSlug, validateURL } from '@validator/link';

const router = express.Router();

router.get('/:slug', validateSlug, protectGetLink, handle(fetchLink));

router.post('/', validateURL, protectCreateLink, handle(createLink));

export default router;