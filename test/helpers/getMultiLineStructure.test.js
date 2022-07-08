const { describe, expect, it } = require('@jest/globals');

const { getMultiLineStructure } = require('src/helpers');

function prepareData(patch) {
    return patch.map((line, index) => ({ index, trimmedContent: line }));
}

describe('', () => {
    it('returns valid endIndex (example 1)', () => {
        const data = prepareData([
            `@@ -10,13 +10,5 @@`,
            `module.exports = (x) => {`,
            `const result = x * 3;`,
            `};`
        ]);

        const result = getMultiLineStructure(data, 1, [
            {
                indicator: {
                    startsWith: 'module.exports ='
                },
                limiter: {
                    startsWith: '}',
                    indentation: 'eq-indicator'
                }
            }
        ]);

        expect(result).toHaveProperty('endIndex', 3);
    });
});
