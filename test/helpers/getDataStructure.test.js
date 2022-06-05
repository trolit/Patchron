const { describe, expect, it } = require('@jest/globals');

const { getDataStructure } = require('src/helpers');

function prepareData(patch) {
    return patch.map((line, index) => ({ index, trimmedContent: line }));
}

describe('', () => {
    it('returns complete structure', () => {
        const data = prepareData([
            `@@ -10,13 +10,5 @@`,
            `module.exports = (x) => {`,
            `const result = x * 3;`,
            `if (x > 15) {`,
            `return 0;`,
            `}`,
            `return result;`,
            `}`
        ]);

        const result = getDataStructure(data);

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('from', 1);
        expect(result[0]).toHaveProperty('to', 7);

        expect(result[1]).toHaveProperty('from', 3);
        expect(result[1]).toHaveProperty('to', 5);
    });

    it('returns partial structure (without incomplete block)', () => {
        const data = prepareData([
            `@@ -10,13 +10,5 @@`,
            `module.exports = (x) => {`,
            `const result = x * 3;`,
            `if (x > 15) {`,
            `return 0;`,
            `}`,
            `return result;`
        ]);

        const result = getDataStructure(data);

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('from', 3);
        expect(result[0]).toHaveProperty('to', 5);
    });

    it('returns partial structure (with incomplete block)', () => {
        const data = prepareData([
            `@@ -10,13 +10,5 @@`,
            `module.exports = (x) => {`,
            `const result = x * 3;`,
            `if (x > 15) {`,
            `return 0;`,
            `}`,
            `return result;`
        ]);

        const result = getDataStructure(data, true);

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('from', 1);
        expect(result[0]).toHaveProperty('to', undefined);

        expect(result[1]).toHaveProperty('from', 3);
        expect(result[1]).toHaveProperty('to', 5);
    });
});
