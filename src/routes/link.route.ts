import handle from '@controller/handler';
import { createLink, fetchLink } from '@controller/link';
import { protectGetLink, protectCreateLink, hitCache } from '@middleware/link';
import express from 'express';
import { validateSlug, validateURL } from '@validator/link';

const router = express.Router();

router.get('/:slug',
    validateSlug,
    hitCache,
    protectGetLink,
    handle(fetchLink)
);

router.post('/',
    validateURL,
    protectCreateLink,
    handle(createLink),
    (req, res) => {
        return console.log('POST CONTROLLER!')
    }
);

export default router;