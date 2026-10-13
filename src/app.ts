import app from '@config/app';
import errorHandler from '@middleware/error';
import linkRoutes from '@route/link';

app.use('/', linkRoutes);

app.use(errorHandler);

export default app;