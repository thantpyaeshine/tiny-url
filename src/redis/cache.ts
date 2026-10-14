import redis from '@config/redis';

export const getCache = async (key: string): Promise<{ status: number, data: any } | null> => {
    const value = await redis.get(key);

    if (value === null) {
        return null;
    }

    const { status, data } = JSON.parse(value);
    return { status, data };
};

export const setCache = async (
    key: string,
    value: { status: number, data: any },
    ttlSeconds = 300,
): Promise<void> => {
    await redis.set(key, JSON.stringify(value), {
        EX: ttlSeconds,
    });
};

export const deleteCache = async (key: string): Promise<void> => {
    await redis.del(key);
};