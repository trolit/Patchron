const fs = require('fs');
const path = require('path');
const nock = require('nock');
const PepegaJs = require('../../..');
const { Probot, ProbotOctokit } = require('probot');
const { describe, expect, it, beforeEach } = require('@jest/globals');
const PositionedKeywords = require('../../../pepega/rules/common/PositionedKeywords');

const importKeywordConfig = {
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

const validConfig = {
    keywords: [importKeywordConfig],
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
                    ...importKeywordConfig,
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

    it('returns empty array on valid custom positioning', () => {
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

    it('returns review on invalid custom positioning (breakOnFirstOccurence = true)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                {
                    ...importKeywordConfig,
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

    it('returns empty array on invalid custom positioning (!enforced)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                {
                    ...importKeywordConfig,
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

    it('returns empty array on valid BOF positioning (enforced)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                {
                    ...importKeywordConfig,
                    position: {
                        custom: null,
                        BOF: true,
                    },
                },
            ],
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

    it('returns empty array on patch without BOF (!enforced)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                {
                    ...importKeywordConfig,
                    position: {
                        custom: null,
                        BOF: true,
                    },
                    enforced: false,
                },
            ],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,7 @@`,
                `+ import method1 from '@/helpers/methods\n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ import method3 from '@/helpers/methods'`,
            ],
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid BOF positioning (!enforced)', () => {
        positionedKeywordsRule = new PositionedKeywords({
            keywords: [
                {
                    ...importKeywordConfig,
                    position: {
                        custom: null,
                        BOF: true,
                    },
                    enforced: false,
                },
            ],
        });

        const result = positionedKeywordsRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,5 @@`,
                `+ import method1 from '@/helpers/methods\n`,
                `+ import method2 from '@/helpers/methods'\n`,
                `+ \n`,
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

        expect(result).toHaveLength(3);

        expect(result[0]).toHaveProperty('start_line', 3);
        expect(result[0]).toHaveProperty('position', 4);

        expect(result[1]).toHaveProperty('line', 5);

        expect(result[2]).toHaveProperty('line', 6);
    });
});
