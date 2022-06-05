const { describe, expect, it } = require('@jest/globals');

const { getLineNumber } = require('src/helpers');

describe('', () => {
    const splitPatch = [
        `@@ -10,13 +6,5 @@`,
        ` module.exports = (x) => {`,
        `-    const result = x * 3;`,
        `-    if (x > 15) {`,
        `+        return 0;`,
        `-    }`,
        `+    return result;`,
        ` }`
    ];

    it('returns expected outcomes', () => {
        const outcome1 = getLineNumber(splitPatch, 'RIGHT', 1);
        expect(outcome1).toEqual(6);

        const outcome2 = getLineNumber(splitPatch, 'LEFT', 1);
        expect(outcome2).toEqual(10);

        const outcome3 = getLineNumber(splitPatch, 'LEFT', 3);
        expect(outcome3).toEqual(12);

        const outcome4 = getLineNumber(splitPatch, 'RIGHT', 6);
        expect(outcome4).toEqual(8);

        const outcome5 = getLineNumber(splitPatch, 'LEFT', 5);
        expect(outcome5).toEqual(13);

        const outcome6 = getLineNumber(splitPatch, 'RIGHT', 8);
        expect(outcome6).toEqual(-1);
    });
});
