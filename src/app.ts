import app from '@config/app';
import { cache } from '@middleware/cache';
import errorHandler from '@middleware/error';
import linkRoutes from '@route/link';

app.use('/', cache, linkRoutes);

app.use(errorHandler);

export default app;