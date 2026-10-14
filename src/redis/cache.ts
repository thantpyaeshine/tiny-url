import redis from '@config/redis';

export async function getCache<T>(key: string): Promise<JSON | null> {
    const value = await redis.get(key);

    if (value === null) {
        return null;
    }

    return JSON.parse(value);
}

export async function setCache<T>(
    key: string,
    value: T,
    ttlSeconds = 300,
): Promise<void> {
    await redis.set(key, JSON.stringify(value), {
        EX: ttlSeconds,
    });
}

export async function deleteCache(key: string): Promise<void> {
    await redis.del(key);
}