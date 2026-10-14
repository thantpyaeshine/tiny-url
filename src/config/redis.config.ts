import ENV from '@config/env';
import { createClient } from 'redis';

const { REDIS_URL } = ENV;

const redis = createClient({
    url: REDIS_URL,
    RESP: 2,
});

redis.on('error', (error) => {
    console.error('Redis Client Error:', error);
});

redis.on('connect', () => {
    console.log('Redis client connected');
});

await redis.connect();

export default redis;