const { describe, expect, it } = require('@jest/globals');

const { getNearestHunkHeader } = require('src/helpers');

describe('invoke function', () => {
    it('returns valid hunk header', () => {
        const splitPatch = [
            `@@ -10,5 +6,4 @@`,
            ` module.exports = (x) => {`,
            `-    const result = x * 3;`,
            `-    if (x > 15) {`,
            `+        return 0;`,
            `-    }`,
            `+    return result;`,
            ` }`,
            `@@ -15,16 +10,20`,
            `+`,
            `+const y = 15;`,
            `+const z = 33;`
        ];

        const hunkHeader1 = getNearestHunkHeader(splitPatch, 5);
        expect(hunkHeader1).toHaveProperty('index', 0);

        const hunkHeader2 = getNearestHunkHeader(splitPatch, 10);
        expect(hunkHeader2).toHaveProperty('index', 8);
    });

    it('returns null on index out of range', () => {
        const result = getNearestHunkHeader([], 15);
        expect(result).toEqual(null);
    });

    it('returns null on invalid index', () => {
        const result = getNearestHunkHeader([], -15);
        expect(result).toEqual(null);
    });

    it('returns null on invalid first parameter type', () => {
        const result = getNearestHunkHeader(15, -15);
        expect(result).toEqual(null);
    });
});
