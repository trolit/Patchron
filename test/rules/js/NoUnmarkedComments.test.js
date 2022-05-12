const { describe, expect, it, beforeEach } = require('@jest/globals');
const NoUnmarkedCommentsRule = require('../../../src/rules/common/NoUnmarkedComments');

const validConfig = {
    prefixes: [
        {
            value: 'TODO:',
            meaning: 'needs to be implemented'
        },
        {
            value: '*:',
            meaning: 'important note'
        },
        {
            value: '!:',
            meaning: 'to be removed'
        },
        {
            value: '?:',
            meaning: 'suggestion'
        },
        {
            value: 'TMP:',
            meaning: 'temporary solution'
        }
    ],
    isAppliedToSingleLineComments: true,
    isAppliedToMultiLineComments: true,
    isAppliedToInlineComments: true
};

describe('invoke function', () => {
    let noUnmarkedCommentsRule;

    beforeEach(() => {
        noUnmarkedCommentsRule = new NoUnmarkedCommentsRule(validConfig);
    });

    it('returns empty array on invalid flags config', () => {
        noUnmarkedCommentsRule = new NoUnmarkedCommentsRule({
            ...validConfig,
            isAppliedToSingleLineComments: false,
            isAppliedToMultiLineComments: false,
            isAppliedToInlineComments: false
        });

        const result = noUnmarkedCommentsRule.invoke({
            filename: '...'
        });

        expect(result).toEqual([]);
    });

    it('returns empty array on empty prefixes', () => {
        noUnmarkedCommentsRule = new NoUnmarkedCommentsRule({
            ...validConfig,
            prefixes: []
        });

        const result = noUnmarkedCommentsRule.invoke({
            filename: '...'
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid single line comments', () => {
        const result = noUnmarkedCommentsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +10,7 @@ // this comment shouldn't be counted as it's only hunk header in patch`,
                `+const payload = require('./fixtures/pull_request.opened');`,
                `+const fs = require('fs');`,
                `        // unchanged line comment `,
                `+`,
                `+const { expect, test, beforeEach, afterEach } = require('@jest/globals');`,
                `-// removed comment`,
                `-// removed comment 2`
            ]
        });

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 12);
    });

    it('returns empty array on valid single line comments', () => {
        const result = noUnmarkedCommentsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +10,7 @@        // TODO: my imports`,
                `+const payload = require('./fixtures/pull_request.opened');`,
                `+const fs = require('fs');`,
                `        // !: unchanged line comment `,
                `+`,
                `+const { expect, test, beforeEach, afterEach } = require('@jest/globals');`
            ]
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid multi-line comments', () => {
        const result = noUnmarkedCommentsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,15 @@`,
                `+/**`,
                `+* -> 1`,
                `+* -> 2`,
                `+*/`,
                `+const payload = require('./fixtures/pull_request.opened');`,
                `+/* multi-line comment as one-liner*/`,
                `+/******another one-liner*****/`,
                `+const fs = require('fs');`,
                `+`,
                `+const { expect, test, beforeEach, afterEach } = require('@jest/globals');`,
                `-/* removed comment */`
            ]
        });

        expect(result).toHaveLength(3);

        expect(result[0]).toHaveProperty('start_line', 5);
        expect(result[0]).toHaveProperty('position', 4);

        expect(result[1]).toHaveProperty('line', 10);

        expect(result[2]).toHaveProperty('line', 11);
    });

    it('returns empty array on valid multi-line comments', () => {
        const result = noUnmarkedCommentsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,15 @@`,
                `+/**`,
                `+* -> 1`,
                `+* TMP: -> 2`,
                `+*/`,
                `+const payload = require('./fixtures/pull_request.opened');`,
                `+/* *: multi-line comment as one-liner */`,
                `+/**: multi-line comment as one-liner */`,
                `+const fs = require('fs');`,
                `+`,
                `+const { expect, test, beforeEach, afterEach } = require('@jest/globals');`,
                `+* !: in inline flavour`,
                `+*/`,
                `-/* removed comment */`
            ]
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid inline comments', () => {
        const result = noUnmarkedCommentsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +2,15 @@`,
                `+const payload = require('./fixtures/pull_request.opened'); // inline comment 1`,
                `+const fs = require('fs'); /* inline comment 2 */`,
                `+`,
                `+const { expect, test, beforeEach, afterEach } = require('@jest/globals'); /*`,
                `+* inline comment 3`,
                `+*/`,
                `-/* removed comment */`
            ]
        });

        expect(result).toHaveLength(3);

        expect(result[0]).toHaveProperty('line', 2);

        expect(result[1]).toHaveProperty('line', 3);

        expect(result[2]).toHaveProperty('start_line', 5);
        expect(result[2]).toHaveProperty('position', 6);
    });

    it('returns empty array on valid inline comments', () => {
        const result = noUnmarkedCommentsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +2,15 @@`,
                `+const payload = require('./fixtures/pull_request.opened'); // *: inline comment 1`,
                `+const fs = require('fs'); /* !: inline comment 2 */`,
                `+`,
                `+const { expect, test, beforeEach, afterEach } = require('@jest/globals'); /* `,
                `+* !: inline comment 3`,
                `+*/`,
                `-/* removed comment */`
            ]
        });

        expect(result).toEqual([]);
    });

    it('returns review with correct range on invalid multi-line comments', () => {
        const result = noUnmarkedCommentsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +2,15 @@`,
                `/* `,
                `* line -> 1 (unchanged)`,
                `+* line -> 2 (added)`,
                `-* line -> 3 (removed)`,
                `*/`,
                `+const payload = require('./fixtures/pull_request.opened'); /*`,
                `+* invalid comment`,
                `-* removed line`,
                `*/`,
                `+const fs = require('fs'); /* !: inline comment 2 */`,
                `+`
            ]
        });

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('start_line', 2);
        expect(result[0]).toHaveProperty('position', 4);

        expect(result[1]).toHaveProperty('start_line', 6);
        expect(result[1]).toHaveProperty('position', 7);
    });
});
