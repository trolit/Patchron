const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    js: { ImportWithoutExtensionRule }
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
        const importWithoutExtensionRule = new ImportWithoutExtensionRule(
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
                    `+import ReviewBuilder from '../review/Builder'`,
                    `+import ReviewValidator from '../review/Validator'`,
                    `+import calculateReviewScore from 'src/helpers/calculateReviewScore'`
                ]
            }
        );

        const result = importWithoutExtensionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on import with extension (ES module)', () => {
        const importWithoutExtensionRule = new ImportWithoutExtensionRule(
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
                    `+import ReviewBuilder from './review/Builder'`,
                    `+import ReviewValidator from '../review/Validator.js'`,
                    `+import calculateReviewScore from 'src/helpers/calculateReviewScore.js'`
                ]
            }
        );

        const result = importWithoutExtensionRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 15);

        expect(result[1]).toHaveProperty('line', 16);
    });

    it('returns empty array on valid imports (commonJS module)', () => {
        const importWithoutExtensionRule = new ImportWithoutExtensionRule(
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
                    `+const ReviewBuilder = require('./review/Builder');`,
                    `+const ReviewValidator = require('../review/Validator');`,
                    `+const calculateReviewScore = require('src/helpers/calculateReviewScore');`
                ]
            }
        );

        const result = importWithoutExtensionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on import with extension (commonJS module)', () => {
        const importWithoutExtensionRule = new ImportWithoutExtensionRule(
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
                    `+const ReviewBuilder = require('./review/Builder');`,
                    `+const ReviewValidator = require('../review/Validator.js');`,
                    `+const calculateReviewScore = require('src/helpers/calculateReviewScore.js');`
                ]
            }
        );

        const result = importWithoutExtensionRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 15);

        expect(result[1]).toHaveProperty('line', 16);
    });
});
