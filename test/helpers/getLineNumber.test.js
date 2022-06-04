const { describe, expect, it } = require('@jest/globals');

const { getLineNumber } = require('src/helpers');

describe('invoke function', () => {
    it('returns valid line numbers', () => {
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

        const lineNumber1 = getLineNumber(splitPatch, 'RIGHT', 1);
        expect(lineNumber1).toEqual(6);

        const lineNumber2 = getLineNumber(splitPatch, 'LEFT', 1);
        expect(lineNumber2).toEqual(10);

        const lineNumber3 = getLineNumber(splitPatch, 'LEFT', 3);
        expect(lineNumber3).toEqual(12);

        const lineNumber4 = getLineNumber(splitPatch, 'RIGHT', 6);
        expect(lineNumber4).toEqual(8);

        const lineNumber5 = getLineNumber(splitPatch, 'LEFT', 5);
        expect(lineNumber5).toEqual(13);
    });

    it('returns invalid line number on invalid index (out of range)', () => {
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

        const lineNumber = getLineNumber(splitPatch, 'RIGHT', 8);
        expect(lineNumber).toEqual(-1);
    });
});
