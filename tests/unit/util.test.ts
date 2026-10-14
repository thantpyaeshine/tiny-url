import { describe, expect, it } from '@jest/globals';

import { generateId } from '@/lib/util';

describe('generateId', () => {
    it('returns an integer between 1,000,000,000 and 1,999,999,999', () => {
        const id = generateId();

        expect(Number.isInteger(id)).toBe(true);
        expect(id).toBeGreaterThanOrEqual(1_000_000_000);
        expect(id).toBeLessThan(2_000_000_000);
    });

    it('returns values in range across repeated calls', () => {
        const ids = Array.from({ length: 50 }, () => generateId());

        expect(ids).toHaveLength(50);
        expect(ids.every((id) => Number.isInteger(id))).toBe(true);
        expect(ids.every((id) => Number(id) >= 1_000_000_000 && Number(id) < 2_000_000_000)).toBe(
            true,
        );
    });
});
