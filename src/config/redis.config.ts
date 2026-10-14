import { createClient } from 'redis';
import ENV from '@config/env'

const { REDIS_URI } = ENV;

const redis = createClient({
    url: REDIS_URI,
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