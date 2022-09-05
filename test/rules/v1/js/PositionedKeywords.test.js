const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const setupPatchronContext = require('test/setupPatchronContext');
const initializeFile = require('test/rules/helpers/initializeFile');
const PositionedKeywordsRule = require('src/rules/v1/common/PositionedKeywords');

const requireKeywordBOFConfig = {
    name: 'require',
    regex: 'const.*(?:require|{)',
    position: {
        BOF: true,
        custom: null
    },
    maxLineBreaks: 0,
    enforced: true,
    breakOnFirstOccurence: false,
    countDifferentCodeAsLineBreak: false,
    multiLineOptions: [
        {
            indicator: {
                notIncludes: 'require'
            },
            limiter: {
                startsWith: '} = require'
            }
        }
    ],
    order: [
        {
            name: 'packages',
            regex: 'require(?!.*[@,.]/)'
        },
        {
            name: 'others',
            regex: 'require(.*[@,.]/)'
        }
    ]
};

const validConfig = {
    keywords: [requireKeywordBOFConfig]
};

describe('invoke function', () => {
    let patchronContext = null;
    let file = {};

    beforeEach(() => {
        patchronContext = setupPatchronContext();

        file = initializeFile();
    });

    afterEach(() => {
        nock.cleanAll();

        nock.enableNetConnect();
    });

    /**
     * ---------------------------------------------------
     * BOF POSITION
     * ---------------------------------------------------
     */

    it('returns empty array on valid require BOF position + order', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `-removed line`,
                    `+const method4 = require('package2');`,
                    `-`,
                    `+const {`,
                    `+    method2`,
                    `+    method3`,
                    `+} = require('@/helpers/methods2')`,
                    `+const method1 = require('@/helpers/methods');`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid require BOF position + order', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `-removed line`,
                    `+some code`,
                    `+const method1 = require('../helpers/methods');`,
                    `-`,
                    `+const {`,
                    `+    method2`,
                    `+    method3`,
                    `+} = require('@/helpers/methods2')`,
                    `+`,
                    `+const method4 = require('package2');`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 1);

        expect(result[1]).toHaveProperty('line', 8);
    });

    it('returns empty array on valid require BOF position + order (enforced)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+const method4 = require('package2');`,
                    `-`,
                    `+const {`,
                    `+    method2`,
                    `+    method3`,
                    `+} = require('./helpers/methods2')`,
                    `+const method1 = require('@/helpers/methods');`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid require BOF position + order (enforced)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+const method1 = require('@/helpers/methods');`,
                    `-`,
                    `+const {`,
                    `+    method2`,
                    `+    method3`,
                    `+} = require('./helpers/methods2')`,
                    `+`,
                    `+const method4 = require('package2');`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('start_line', 6);
        expect(result[0]).toHaveProperty('line', 11);

        expect(result[1]).toHaveProperty('line', 11);
    });

    it('returns empty array on valid require order (example1, enforced)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+const method4 = require('package2');`,
                    `+const {`,
                    `+    method2`,
                    `+    method3`,
                    `+} = require('./helpers/methods2')`,
                    `+const method1 = require('@/helpers/methods');`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid require order (example1, enforced)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+const {`,
                    `+    method2`,
                    `+    method3`,
                    `+} = require('./helpers/methods2')`,
                    `+const method1 = require('@/helpers/methods');`,
                    `+const method4 = require('package2');`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 10);
    });

    it('returns empty array on valid require order (example2, enforced)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+const {`,
                    `+    method5`,
                    `+    method6`,
                    `+} = require('package3')`,
                    `+const method4 = require('package2');`,
                    `+const method7 = require('package3/index');`,
                    `+const {`,
                    `+    method2`,
                    `+    method3`,
                    `+} = require('./helpers/methods2')`,
                    `+const method1 = require('@/helpers/methods');`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid require order (example2, enforced)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+const method7 = require('package3/index');`,
                    `+const {`,
                    `+    method2`,
                    `+    method3`,
                    `+} = require('./helpers/methods2')`,
                    `+const method1 = require('@/helpers/methods');`,
                    `+const {`,
                    `+    method5`,
                    `+    method6`,
                    `+} = require('package3')`,
                    `+const method4 = require('package2');`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 11);

        expect(result[1]).toHaveProperty('line', 15);
    });
});
