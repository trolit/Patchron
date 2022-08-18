const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    common: { PositionedKeywordsRule }
} = require('src/rules');
const setupPatchronContext = require('test/setupPatchronContext');
const initializeFile = require('test/rules/helpers/initializeFile');

const requireKeywordBOFConfig = {
    name: 'require',
    regex: /const.*(?:require|{)/,
    position: {
        BOF: true,
        custom: null
    },
    enforced: true,
    maxLineBreaks: 0,
    breakOnFirstOccurence: false,
    countDifferentCodeAsLineBreak: false,
    multiLineOptions: [
        {
            indicator: {
                notIncludes: 'require'
            },
            limiter: {
                startsWith: '} = require',
                indentation: 'eq-indicator'
            }
        }
    ],
    order: [
        {
            name: 'packages',
            regex: /require(?!.*@).*/
        },
        {
            name: 'other',
            regex: /require.*/
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

    it('returns empty array on valid require BOF position', () => {
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

    it('returns review on invalid require BOF position', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `-removed line`,
                    `+some code`,
                    `+const method1 = require('@/helpers/methods');`,
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

    it('returns empty array on valid require BOF position (enforced)', () => {
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
                    `+} = require('@/helpers/methods2')`,
                    `+const method1 = require('@/helpers/methods');`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid require BOF position (enforced)', () => {
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
                    `+} = require('@/helpers/methods2')`,
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
});
