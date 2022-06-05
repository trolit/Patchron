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

    it('returns expected positions', () => {
        const position1 = getPosition(splitPatch, 6, 'RIGHT');
        expect(position1).toEqual(3);

        const position2 = getPosition(splitPatch, 5, 'LEFT');
        expect(position2).toEqual(4);

        const position3 = getPosition(splitPatch, 15, 'RIGHT');
        expect(position3).toEqual(-1);

        const position4 = getPosition(splitPatch, -15, 'RIGHT');
        expect(position4).toEqual(-1);

        const position5 = getPosition([], 5, 'RIGHT');
        expect(position5).toEqual(-1);
    });
});
