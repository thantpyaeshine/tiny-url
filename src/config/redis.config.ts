import { createClient } from 'redis';
import ENV from '@config/env'

const { REDIS_URI } = ENV;

const redis = createClient({
    url: REDIS_URI,
});

redis.on('error', (error) => {
    console.error('Redis Client Error:', error);
});

export default redis;