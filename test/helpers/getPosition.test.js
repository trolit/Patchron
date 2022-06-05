const { describe, expect, it } = require('@jest/globals');

const { getPosition } = require('src/helpers');

describe('', () => {
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

    it('returns expected outcomes', () => {
        const outcome1 = getPosition(splitPatch, 6, 'RIGHT');
        expect(outcome1).toEqual(3);

        const outcome2 = getPosition(splitPatch, 5, 'LEFT');
        expect(outcome2).toEqual(4);

        const outcome3 = getPosition(splitPatch, 15, 'RIGHT');
        expect(outcome3).toEqual(-1);

        const outcome4 = getPosition(splitPatch, -15, 'RIGHT');
        expect(outcome4).toEqual(-1);

        const outcome5 = getPosition([], 5, 'RIGHT');
        expect(outcome5).toEqual(-1);
    });
});
