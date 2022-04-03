const fs = require('fs');
const path = require('path');
const nock = require('nock');
const PepegaJs = require('../../..');
const { Probot, ProbotOctokit } = require('probot');
const { describe, expect, it, beforeEach } = require('@jest/globals');
const PositionedKeywords = require('../../../pepega/rules/common/PositionedKeywords');

const importKeywordCustomConfig = {
    name: 'import',
    regex: /import.*/,
    multilineOptions: ['from'],
    position: {
        custom: {
            name: '<script>',
            expression: /<script>/,
        },
        BOF: false,
        EOF: false,
    },
    maxLineBreaks: 0,
    enforced: true,
    breakOnFirstOccurence: false,
    countDifferentCodeAsLineBreak: false,
};

const importKeywordBOFConfig = {
    name: 'import',
    regex: /import.*/,
    multilineOptions: ['from'],
    position: {
        custom: null,
        BOF: true,
        EOF: false,
    },
    maxLineBreaks: 0,
    enforced: true,
    breakOnFirstOccurence: false,
    countDifferentCodeAsLineBreak: false,
};

const importKeywordEOFConfig = {
    name: 'import',
    regex: /import.*/,
    multilineOptions: ['from'],
    position: {
        custom: null,
        BOF: false,
        EOF: true,
    },
    maxLineBreaks: 0,
    enforced: true,
    breakOnFirstOccurence: false,
    countDifferentCodeAsLineBreak: false,
};

const validConfig = {
    keywords: [importKeywordCustomConfig],
};

const privateKey = fs.readFileSync(
    path.join(__dirname, '../../fixtures/mock-cert.pem'),
    'utf-8'
);

describe('invoke function', () => {
    let probot;
    let positionedKeywordsRule;

    beforeEach(() => {
        nock.disableNetConnect();
        probot = new Probot({
            appId: 123,
            privateKey,
            Octokit: ProbotOctokit.defaults({
                retry: { enabled: false },
                throttle: { enabled: false },
            }),
            logLevel: 'fatal',
        });

        probot.load(PepegaJs);

        positionedKeywordsRule = new PositionedKeywords(validConfig);
    });

    it('returns empty array on empty keywords', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
        });

        expect(result).toEqual([]);
    });

    /**
     * ---------------------------------------------------
     * CUSTOM POSITION
     * ---------------------------------------------------
     */

    it('returns empty array on missing custom position', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                {
                    ...importKeywordCustomConfig,
                    enforced: false,
                },
            ],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,7 @@`,
                `+ <scwddwdwript>\n`,
                `+ import method1 from '@/helpers/methods\n`,
                `- \n`,
                `+ \n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ \n`,
                `+ import method3 from '@/helpers/methods'`,
            ],
        });

        expect(result).toEqual([]);
    });

    it('returns empty array on valid custom positioning', () => {
        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,7 @@`,
                `+ <script>\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                `+ import method1 from '@/helpers/methods\n`,
                `- \n`,
                `  import {\n`,
                `   method24,\n`,
                `  from '@/helpers/methods'\n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method34,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toEqual([]);
    });

    it('returns empty array on valid custom positioning (enforced)', () => {
        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
                `+ <scrdwwddwdipt>\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                `+ import method1 from '@/helpers/methods\n`,
                `- \n`,
                `  import {\n`,
                `   method24,\n`,
                `  from '@/helpers/methods'\n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method34,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toEqual([]);
    });

    it('returns empty array on valid custom positioning (maxLineBreaks = 2, countDifferentCodeAsLineBreak = true)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                {
                    ...importKeywordCustomConfig,
                    maxLineBreaks: 2,
                    countDifferentCodeAsLineBreak: true,
                },
            ],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,7 @@`,
                `+ <script>\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                ` const x = 2;`,
                `+ import method1 from '@/helpers/methods\n`,
                `- \n`,
                `  import {\n`,
                `   method24,\n`,
                `  from '@/helpers/methods'\n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ const y = 3;`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method34,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid custom positioning (maxLineBreaks = 0)', () => {
        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,7 @@`,
                `+ <script>\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                ` \n`,
                `+ import method1 from '@/helpers/methods\n`,
                `- \n`,
                `  import {\n`,
                `   method24,\n`,
                `  from '@/helpers/methods'\n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ \n`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method34,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('start_line', 6);
        expect(result[0]).toHaveProperty('position', 7);

        expect(result[1]).toHaveProperty('start_line', 15);
        expect(result[1]).toHaveProperty('position', 13);
    });

    it('returns review on invalid custom positioning (enforced, maxLineBreaks = 0)', () => {
        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,7 @@`,
                `+ <scridwdwwdpt>\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                ` const x = 2;`,
                `+ import method1 from '@/helpers/methods\n`,
                `- \n`,
                `  import {\n`,
                `   method24,\n`,
                `  from '@/helpers/methods'\n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ const y = 3;`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method34,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('start_line', 6);
        expect(result[0]).toHaveProperty('position', 7);

        expect(result[1]).toHaveProperty('start_line', 15);
        expect(result[1]).toHaveProperty('position', 13);
    });

    it('returns review on invalid custom positioning (maxLineBreaks = 2, countDifferentCodeAsLineBreak = false)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                {
                    ...importKeywordCustomConfig,
                    maxLineBreaks: 2,
                },
            ],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,7 @@`,
                `+ <script>\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                ` const x = 2;`,
                `+ import method1 from '@/helpers/methods\n`,
                `- \n`,
                `  import {\n`,
                `   method24,\n`,
                `  from '@/helpers/methods'\n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ const y = 3;`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method34,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('start_line', 6);
        expect(result[0]).toHaveProperty('position', 7);

        expect(result[1]).toHaveProperty('start_line', 15);
        expect(result[1]).toHaveProperty('position', 13);
    });

    it('returns single comment on invalid custom positioning (breakOnFirstOccurence)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                {
                    ...importKeywordCustomConfig,
                    breakOnFirstOccurence: true,
                },
            ],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,7 @@`,
                `+ <script>\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                ` const x = 2;`,
                `+ import method1 from '@/helpers/methods\n`,
                `- \n`,
                `  import {\n`,
                `   method24,\n`,
                `  from '@/helpers/methods'\n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ const y = 3;`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method34,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('start_line', 6);
        expect(result[0]).toHaveProperty('position', 7);
    });

    /**
     * ---------------------------------------------------
     * BOF
     * ---------------------------------------------------
     */

    /**
     * ---------------------------------------------------
     * EOF
     * ---------------------------------------------------
     */
});
