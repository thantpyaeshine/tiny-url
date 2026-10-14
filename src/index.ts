import app from '@/app';
import ENV from '@config/env';
import redis from '@config/redis';

const { PORT } = ENV;

try {
    await redis.connect().then(() => {
        console.log('Connected to Redis successfully');
    });

    app.listen(PORT, () => {
        console.log(`Server is listening on port:${PORT}`);
    });
} catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
}