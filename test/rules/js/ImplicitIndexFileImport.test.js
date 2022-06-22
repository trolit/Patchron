const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    js: { ImplicitIndexFileImportRule }
} = require('src/rules');
const setupApp = require('test/rules/helpers/setupApp');
const initializeFile = require('test/rules/helpers/initializeFile');

const moduleConfig = { type: 'module' };
const commonJsConfig = { type: 'commonjs' };

describe('invoke function', () => {
    let patchronContext = null;
    let file = {};

    beforeEach(() => {
        patchronContext = setupApp();

        file = initializeFile();
    });

    afterEach(() => {
        nock.cleanAll();

        nock.enableNetConnect();
    });

    it('returns empty array on valid imports (ES module)', () => {
        const implicitIndexFileImportRule = new ImplicitIndexFileImportRule(
            patchronContext,
            moduleConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+import {`,
                    `+    state,`,
                    `+    constants`,
                    `+} from 'src/utilities'`,
                    `+import { Builder, Validator }  from '../review'`,
                    `+import calculateReviewScore from 'src/helpers/calculateReviewScore'`
                ]
            }
        );

        const result = implicitIndexFileImportRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on import with extension (ES module)', () => {
        const implicitIndexFileImportRule = new ImplicitIndexFileImportRule(
            patchronContext,
            moduleConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+import {`,
                    `+    state,`,
                    `+    constants`,
                    `+} from 'src/utilities/index'`,
                    `+import { Builder, Validator }  from '../review/index'`,
                    `+import calculateReviewScore from 'src/helpers/calculateReviewScore'`
                ]
            }
        );

        const result = implicitIndexFileImportRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 13);

        expect(result[1]).toHaveProperty('line', 14);
    });

    it('returns empty array on valid imports (commonJS module)', () => {
        const implicitIndexFileImportRule = new ImplicitIndexFileImportRule(
            patchronContext,
            commonJsConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const {`,
                    `+    state,`,
                    `+    constants`,
                    `+} = require('src/utilities');`,
                    `+const { Builder, Validator } = require('../review');`,
                    `+const calculateReviewScore = require('src/helpers/calculateReviewScore');`
                ]
            }
        );

        const result = implicitIndexFileImportRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on import with extension (commonJS module)', () => {
        const implicitIndexFileImportRule = new ImplicitIndexFileImportRule(
            patchronContext,
            commonJsConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const {`,
                    `+    state,`,
                    `+    constants`,
                    `+} = require('src/utilities/index');`,
                    `+const { Builder, Validator } = require('../review/index');`,
                    `+const calculateReviewScore = require('src/helpers/calculateReviewScore');`
                ]
            }
        );

        const result = implicitIndexFileImportRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 13);

        expect(result[1]).toHaveProperty('line', 14);
    });
});
