const { describe, expect, it } = require('@jest/globals');
const extendWithBackticks = require('../../../src/extensions/setup-data/extendWithBackticks');

describe('invoke function', () => {
    it('returns data extended with backticks', () => {
        const result = extendWithBackticks(
            [
                { index: 0, trimmedContent: `@@ -10,13 +1,7 @@` },
                { index: 1, trimmedContent: `const t = \`some text message\`` },
                { index: 2, trimmedContent: `const y = \`` },
                { index: 3, trimmedContent: `- this is test row1` },
                { index: 4, trimmedContent: `- this is test row2: \`\${a}\`` },
                { index: 5, trimmedContent: `- this is test row3` },
                { index: 6, trimmedContent: `\`` }
            ],
            {
                abortOnUnevenBackticksCountInPatch: true
            }
        );

        expect(result[1].backticks).toMatchObject({
            endLineIndex: 1
        });

        expect(result[2].backticks).toMatchObject({
            endLineIndex: 6
        });
    });

    it('returns data (default value) on uneven backticks in patch', () => {
        const data = [
            { index: 0, trimmedContent: `@@ -10,13 +1,7 @@` },
            { index: 1, trimmedContent: `const t = \`some text message\`` },
            { index: 2, trimmedContent: `const y = \`` },
            { index: 3, trimmedContent: `- this is test row1` },
            { index: 4, trimmedContent: `- this is test row2: \`\${a}\`` },
            { index: 5, trimmedContent: `- this is test row3` }
        ];

        const result = extendWithBackticks(data, {
            abortOnUnevenBackticksCountInPatch: true
        });

        expect(result).toEqual(data);
    });

    it('returns empty array on uneven backticks in patch', () => {
        const result = extendWithBackticks(
            [
                { index: 0, trimmedContent: `@@ -10,13 +1,7 @@` },
                { index: 1, trimmedContent: `const t = \`some text message\`` },
                { index: 2, trimmedContent: `const y = \`` },
                { index: 3, trimmedContent: `- this is test row1` },
                { index: 4, trimmedContent: `- this is test row2: \`\${a}\`` },
                { index: 5, trimmedContent: `- this is test row3` }
            ],
            { resultOnAbort: [], abortOnUnevenBackticksCountInPatch: true }
        );

        expect(result).toEqual([]);
    });
});
