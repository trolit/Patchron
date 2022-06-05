const { describe, expect, it } = require('@jest/globals');

const { getNearestHunkHeader } = require('src/helpers');

describe('', () => {
    it('returns expected outcomes', () => {
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

        const outcome1 = getNearestHunkHeader(splitPatch, 5);
        expect(outcome1).toHaveProperty('index', 0);

        const outcome2 = getNearestHunkHeader(splitPatch, 10);
        expect(outcome2).toHaveProperty('index', 8);

        const outcome3 = getNearestHunkHeader([], 15);
        expect(outcome3).toEqual(null);

        const outcome4 = getNearestHunkHeader([], -15);
        expect(outcome4).toEqual(null);

        const outcome5 = getNearestHunkHeader(15, -15);
        expect(outcome5).toEqual(null);
    });
});
