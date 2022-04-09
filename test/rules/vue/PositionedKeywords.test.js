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
            BOF: false,
        },
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

const constKeywordConfig = (position, override = null) => {
    return {
        name: 'const',
        regex: /const.*require.*/,
        multilineOptions: [],
        maxLineBreaks: 0,
        enforced: true,
        breakOnFirstOccurence: false,
        countDifferentCodeAsLineBreak: false,
        position,
        override,
    };
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

    it('returns empty array on missing BOF position', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                {
                    ...importKeywordBOFConfig,
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

    it('returns empty array on valid BOF positioning', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [importKeywordBOFConfig],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
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

    it('returns empty array on valid BOF positioning (enforced)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [importKeywordBOFConfig],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +4,7 @@`,
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

    it('returns empty array on valid BOF positioning (maxLineBreaks = 2, countDifferentCodeAsLineBreak = true)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                {
                    ...importKeywordBOFConfig,
                    maxLineBreaks: 2,
                    countDifferentCodeAsLineBreak: true,
                },
            ],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
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

    it('returns review on invalid BOF position', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                {
                    ...importKeywordBOFConfig,
                    maxLineBreaks: 2,
                    countDifferentCodeAsLineBreak: true,
                },
            ],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
                `const abc = 5;`,
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

        expect(result[0]).toHaveProperty('line', 1);
    });

    it('returns review on invalid BOF positioning (maxLineBreaks = 0)', () => {
        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
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

        expect(result[0]).toHaveProperty('start_line', 1);
        expect(result[0]).toHaveProperty('position', 6);

        expect(result[1]).toHaveProperty('start_line', 10);
        expect(result[1]).toHaveProperty('position', 12);
    });

    it('returns review on invalid BOF positioning (enforced, maxLineBreaks = 0)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [importKeywordBOFConfig],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,7 @@`,
                `+ const a = 2;\n`,
                `+ const b = 6;\n`,
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

        expect(result[0]).toHaveProperty('start_line', 7);
        expect(result[0]).toHaveProperty('position', 8);

        expect(result[1]).toHaveProperty('start_line', 16);
        expect(result[1]).toHaveProperty('position', 14);
    });

    it('returns review on invalid BOF positioning (maxLineBreaks = 2, countDifferentCodeAsLineBreak = false)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                {
                    ...importKeywordBOFConfig,
                    maxLineBreaks: 2,
                },
            ],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,7 @@`,
                `+ const a = 2;\n`,
                `+ const b = 6;\n`,
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

        expect(result[0]).toHaveProperty('start_line', 7);
        expect(result[0]).toHaveProperty('position', 8);

        expect(result[1]).toHaveProperty('start_line', 16);
        expect(result[1]).toHaveProperty('position', 14);
    });

    it('returns single comment on invalid BOF positioning (breakOnFirstOccurence)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                {
                    ...importKeywordBOFConfig,
                    breakOnFirstOccurence: true,
                },
            ],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
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

        expect(result[0]).toHaveProperty('start_line', 1);
        expect(result[0]).toHaveProperty('position', 6);
    });

    it('returns empty array on valid BOF positioning (two BOF keywords)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                importKeywordBOFConfig,
                constKeywordConfig({ custom: null, BOF: true }),
            ],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,17 @@`,
                `+ const gamma = require('...')\n`,
                `+ const beta = require('...');\n`,
                `+ const alpha = require('...');\n`,
                `+ \n`,
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
            ],
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid `import` BOF positioning (two BOF keywords)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                importKeywordBOFConfig,
                constKeywordConfig({ custom: null, BOF: true }),
            ],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,19 @@`,
                `+ const gamma = require('...')\n`,
                `+ const beta = require('...');\n`,
                `+ const alpha = require('...');\n`,
                `+ const b = () => { ... }\n`,
                `+ const a = () => { ... }\n`,
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
            ],
        });

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 4);
    });

    it('returns review on invalid `import` BOF positioning (two BOF keywords)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                importKeywordBOFConfig,
                constKeywordConfig({ custom: null, BOF: true }),
            ],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,19 @@`,
                `+ const gamma = require('...')\n`,
                `+ const beta = require('...');\n`,
                `+ const alpha = require('...');\n`,
                `+ const b = () => { ... }\n`,
                `+ const a = () => { ... }\n`,
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
            ],
        });

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 4);
    });

    it('returns single comment on invalid `import` and `const` BOF positioning (two BOF keywords)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                importKeywordBOFConfig,
                constKeywordConfig({ custom: null, BOF: true }),
            ],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,19 @@`,
                `+ kappa\n`,
                `+ const gamma = require('...')\n`,
                `+ const beta = require('...');\n`,
                `+ const alpha = require('...');\n`,
                `+ const b = () => { ... }\n`,
                `+ const a = () => { ... }\n`,
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
            ],
        });

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 1);
    });
});
