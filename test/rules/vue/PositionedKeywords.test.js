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

    it('returns empty array on invalid keyword config', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                {
                    ...importKeywordCustomConfig,
                    position: {
                        custom: {
                            name: '<script>',
                            expression: /<script>/,
                        },
                        BOF: true,
                        EOF: true,
                    },
                },
            ],
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
    it('returns empty array on valid custom positioning (enforced)', () => {
        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,7 @@`,
                `+ <script>\n`,
                `+ import method1 from '@/helpers/methods\n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toEqual([]);
    });

    it('returns empty array on valid custom positioning (not enforced)', () => {
        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
                `+ <script>\n`,
                `+ import method1 from '@/helpers/methods\n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
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
                `+ import method1 from '@/helpers/methods\n`,
                `+ \n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ import method3 from '@/helpers/methods'\n`,
                ` \n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 7);

        expect(result[1]).toHaveProperty('line', 10);
    });

    // TODO!!!!
    it.skip('returns empty array on valid custom positioning (maxLineBreaks = 2)', () => {
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
                `+ \n`,
                `+ \n`,
                `+ import method1 from '@/helpers/methods\n`,
                `+ \n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ import method3 from '@/helpers/methods'\n`,
                ` \n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toEqual([]);
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
                `+ import method1 from '@/helpers/methods\n`,
                `+ \n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ \n`,
                `+ import method3 from '@/helpers/methods'`,
            ],
        });

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 7);
    });

    it('returns review on invalid custom positioning (enforced)', () => {
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

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 7);

        expect(result[1]).toHaveProperty('line', 9);
    });

    it('returns empty array on missing custom position (not enforced)', () => {
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

    it('returns review on invalid custom positioning (not enforced)', () => {
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
                `@@ -10,13 +1,7 @@`,
                `+ <script>\n`,
                `+ import method1 from '@/helpers/methods\n`,
                `- \n`,
                `+ \n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ \n`,
                `+ import method3 from '@/helpers/methods'`,
            ],
        });

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 3);

        expect(result[1]).toHaveProperty('line', 5);
    });

    /**
     * ---------------------------------------------------
     * BOF
     * ---------------------------------------------------
     */
    it('returns empty array on valid BOF positioning (enforced)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [importKeywordBOFConfig],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,7 @@`,
                `+ import method1 from '@/helpers/methods\n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toEqual([]);
    });

    it('returns empty array on valid BOF positioning (not enforced)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [importKeywordBOFConfig],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
                `+ import method1 from '@/helpers/methods\n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid BOF positioning (maxLineBreaks = 0)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [importKeywordBOFConfig],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
                `+ import method1 from '@/helpers/methods\n`,
                ` \n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ \n`,
                ` \n`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toHaveLength(4);

        expect(result[0]).toHaveProperty('line', 2);

        expect(result[1]).toHaveProperty('start_line', 4);
        expect(result[1]).toHaveProperty('position', 5);

        expect(result[2]).toHaveProperty('line', 6);

        expect(result[3]).toHaveProperty('line', 7);
    });

    it('returns empty array on valid BOF positioning (maxLineBreaks = 2)', () => {
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
                `@@ -10,13 +1,7 @@`,
                `+ import method1 from '@/helpers/methods\n`,
                ` \n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ \n`,
                ` \n`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toEqual([]);
    });

    it('returns single comment on invalid custom positioning (breakOnFirstOccurence)', () => {
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
                `+ import method1 from '@/helpers/methods\n`,
                ` \n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ \n`,
                ` \n`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 2);
    });

    it('returns review on invalid BOF positioning (enforced)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [importKeywordBOFConfig],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,7 @@`,
                `+ import method1 from '@/helpers/methods\n`,
                ` \n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ \n`,
                ` \n`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toHaveLength(4);

        expect(result[0]).toHaveProperty('line', 6);

        // TODO: Why no 7?
        expect(result[1]).toHaveProperty('start_line', 8);
        expect(result[1]).toHaveProperty('position', 5);

        expect(result[2]).toHaveProperty('line', 10);

        expect(result[3]).toHaveProperty('line', 11);
    });

    it('returns empty array on missing BOF position (not enforced)', () => {
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
                `+ import method1 from '@/helpers/methods\n`,
                ` \n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ \n`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid BOF positioning (not enforced)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [importKeywordBOFConfig],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
                `+ import method1 from '@/helpers/methods\n`,
                ` \n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ \n`,
                `+ import method3 from '@/helpers/methods'\n`,
                `  import {\n`,
                `   method4,\n`,
                `   method5,\n`,
                `  from '@/helpers/methods'\n`,
                `- \n`,
                `- import method6 from '@/helpers/methods'\n`,
            ],
        });

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 2);

        expect(result[1]).toHaveProperty('line', 4);
    });

    /**
     * ---------------------------------------------------
     * EOF
     * TBD
     * ---------------------------------------------------
     */
});
