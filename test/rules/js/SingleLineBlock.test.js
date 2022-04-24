const fs = require('fs');
const path = require('path');
const nock = require('nock');
const PepegaJs = require('../../..');
const { Probot, ProbotOctokit } = require('probot');
const { describe, expect, it, beforeEach } = require('@jest/globals');
const SingleLineBlockRule = require('../../../pepega/rules/common/SingleLineBlock');

const validConfig = {
    blocks: [
        {
            name: 'if',
            expression: /^[\s]*(?:if).*[(].*[)].*/
        },
        {
            name: 'else',
            expression: /^(?:[{].*(?:else)).*|^(?:else).*/
        },
        {
            name: 'else if',
            expression: /^[{]?[\s]*(?:else if).*[(].*[)].*/
        },
        {
            name: 'for',
            expression: /^[\s]*(?:for).*[(].*[)].*/
        },
        {
            name: 'do..while',
            expression: /^[\s]*(?:do).*/,
            endIndicator: /^while/
        },
        {
            name: 'while',
            expression: /^[\s]*(?:while).*[(].*[)].*/
        }
    ],
    curlyBraces: true
};

const privateKey = fs.readFileSync(
    path.join(__dirname, '../../fixtures/mock-cert.pem'),
    'utf-8'
);

describe('invoke function', () => {
    let probot;
    let singleLineBlockRule;

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

        singleLineBlockRule = new SingleLineBlockRule(validConfig);
    });

    it('returns empty array on invalid blocks config', () => {
        singleLineBlockRule = new SingleLineBlockRule({
            blocks: [],
            curlyBraces: false
        });

        const result = singleLineBlockRule.invoke({
            filename: '...'
        });

        expect(result).toEqual([]);
    });

    it('returns empty array on empty patch', () => {
        const result = singleLineBlockRule.invoke({
            filename: '...'
        });

        expect(result).toEqual([]);
    });

    /**
     * ---------------------------------------------------
     * SINGLE IF BLOCK
     * ---------------------------------------------------
     */

    it('returns empty array on valid single-line `if` blocks (with curly braces)', () => {
        const result = singleLineBlockRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@\n`,
                `+ const x = 4;\n`,
                `+ const y = 5;\n`,
                `+ if (x === y) { result = x; }\n`,
                `+ \n`,
                `+ if (x > y) {\n`,
                `+  result = x + y;\n`,
                `+ }\n`,
                `+ \n`,
                `+ if (x <= y)\n`,
                `+ {\n`,
                `+  result = x - y;\n`,
                `+ }\n`,
                `+ \n`,
                `+ for (let index = 0; index < 10; index++) {\n`,
                `+  if (index % 2 === 0) {\n`,
                `+      console.log(index);\n`,
                `+  }\n`,
                `+  \n`,
                `+  if (index % 3 === 0) {\n`,
                `+      if (result > 20) { continue; }\n`,
                `+      else { break; }\n`,
                `+  }\n`,
                `+ }\n`
            ]
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid single-line `if` blocks (with curly braces)', () => {
        const result = singleLineBlockRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@\n`,
                `+ const x = 4;\n`,
                `+ const y = 5;\n`,
                `+ if (x === y) result = x;\n`,
                `+ \n`,
                `+ if (x > y)\n`,
                `+  result = x + y;\n`,
                `+ \n`,
                `+ if (x <= y)\n`,
                `+  result = x - y;\n`,
                `+ \n`,
                `+ for (let index = 0; index < 10; index++) {\n`,
                `+  if (index % 2 === 0)\n`,
                `+      console.log(index);\n`,
                `+  \n`,
                `+  if (index % 3 === 0) {\n`,
                `+      if (result > 20) continue;\n`,
                `+      else break;\n`,
                `+  }\n`,
                `+ }\n`
            ]
        });

        expect(result).toHaveLength(6);

        expect(result[0]).toHaveProperty('line', 3);

        expect(result[1]).toHaveProperty('start_line', 5);
        expect(result[1]).toHaveProperty('position', 6);

        expect(result[2]).toHaveProperty('start_line', 8);
        expect(result[2]).toHaveProperty('position', 9);

        expect(result[3]).toHaveProperty('start_line', 12);
        expect(result[3]).toHaveProperty('position', 13);

        expect(result[4]).toHaveProperty('line', 16);

        expect(result[5]).toHaveProperty('line', 17);
    });
});
