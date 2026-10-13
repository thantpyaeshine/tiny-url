import { randomInt } from 'node:crypto';

export const generateId = (): Number => {
    return Number(BigInt(randomInt(1_000_000_000, 2_000_000_000)));
};