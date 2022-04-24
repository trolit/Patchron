const fs = require('fs');
const path = require('path');
const nock = require('nock');
const PepegaJs = require('../../..');
const { Probot, ProbotOctokit } = require('probot');
const { describe, expect, it, beforeEach } = require('@jest/globals');
const NoUnmarkedCommentsRule = require('../../../pepega/rules/common/NoUnmarkedComments');

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

const privateKey = fs.readFileSync(
    path.join(__dirname, '../../fixtures/mock-cert.pem'),
    'utf-8'
);

describe('invoke function', () => {
    let probot;
    let noUnmarkedCommentsRule;

    beforeEach(() => {
        nock.disableNetConnect();
        probot = new Probot({
            appId: 123,
            privateKey,
            Octokit: ProbotOctokit.defaults({
                retry: { enabled: false },
                throttle: { enabled: false }
            }),
            logLevel: 'fatal'
        });

        probot.load(PepegaJs);

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
                `+ const payload = require('./fixtures/pull_request.opened');\n`,
                `+ const fs = require('fs');\n`,
                `        // unchanged line comment \n`,
                `+ \n`,
                `+ const { expect, test, beforeEach, afterEach } = require('@jest/globals');\n`,
                `- // removed comment\n`,
                `- // removed comment 2\n`
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
                `+ const payload = require('./fixtures/pull_request.opened');\n`,
                `+ const fs = require('fs');\n`,
                `        // !: unchanged line comment \n`,
                `+ \n`,
                `+ const { expect, test, beforeEach, afterEach } = require('@jest/globals');\n`
            ]
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid multi-line comments', () => {
        const result = noUnmarkedCommentsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,15 @@\n`,
                `+ /**`,
                `+ * -> 1`,
                `+ * -> 2`,
                `+ */`,
                `+ const payload = require('./fixtures/pull_request.opened');\n`,
                `+ /* multi-line comment as one-liner*/`,
                `+ /******another one-liner*****/`,
                `+ const fs = require('fs');\n`,
                `+ \n`,
                `+ const { expect, test, beforeEach, afterEach } = require('@jest/globals');`,
                `- /* removed comment */\n`
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
                `@@ -10,13 +5,15 @@\n`,
                `+ /**`,
                `+ * -> 1`,
                `+ * TMP: -> 2`,
                `+ */`,
                `+ const payload = require('./fixtures/pull_request.opened');\n`,
                `+ /* *: multi-line comment as one-liner */`,
                `+ /**: multi-line comment as one-liner */`,
                `+ const fs = require('fs');\n`,
                `+ \n`,
                `+ const { expect, test, beforeEach, afterEach } = require('@jest/globals');\n`,
                `+ * !: in inline flavour`,
                `+ */`,
                `- /* removed comment */\n`
            ]
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid inline comments', () => {
        const result = noUnmarkedCommentsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +2,15 @@\n`,
                `+ const payload = require('./fixtures/pull_request.opened'); // inline comment 1\n`,
                `+ const fs = require('fs'); /* inline comment 2 */\n`,
                `+ \n`,
                `+ const { expect, test, beforeEach, afterEach } = require('@jest/globals'); /*\n`,
                `+ * inline comment 3\n`,
                `+ */`,
                `- /* removed comment */\n`
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
                `@@ -10,13 +2,15 @@\n`,
                `+ const payload = require('./fixtures/pull_request.opened'); // *: inline comment 1\n`,
                `+ const fs = require('fs'); /* !: inline comment 2 */\n`,
                `+ \n`,
                `+ const { expect, test, beforeEach, afterEach } = require('@jest/globals'); /* \n`,
                `+ * !: inline comment 3\n`,
                `+ */`,
                `- /* removed comment */\n`
            ]
        });

        expect(result).toEqual([]);
    });

    it('returns review with correct range on invalid multi-line comments', () => {
        const result = noUnmarkedCommentsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +2,15 @@\n`,
                ` /* \n`,
                ` * line -> 1 (unchanged)\n`,
                `+ * line -> 2 (added)\n`,
                `- * line -> 3 (removed)\n`,
                ` */`,
                `+ const payload = require('./fixtures/pull_request.opened'); /*`,
                `+ * invalid comment`,
                `- * removed line`,
                ` */`,
                `+ const fs = require('fs'); /* !: inline comment 2 */\n`,
                `+ \n`
            ]
        });

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('start_line', 2);
        expect(result[0]).toHaveProperty('position', 4);

        expect(result[1]).toHaveProperty('start_line', 6);
        expect(result[1]).toHaveProperty('position', 7);
    });
});
