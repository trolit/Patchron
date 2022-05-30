const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    js: { DirectImportRule }
} = require('src/rules');
const setupApp = require('test/rules/helpers/setupApp');
const initializeFile = require('test/rules/helpers/initializeFile');

const validConfig = {
    packages: [
        {
            name: 'lodash',
            expression: /[(|'|"]lodash[)|'|"]/
        }
    ]
};

describe('invoke function', () => {
    let pepegaContext = null;
    let file = {};

    beforeEach(() => {
        pepegaContext = setupApp();

        file = initializeFile();
    });

    afterEach(() => {
        nock.cleanAll();

        nock.enableNetConnect();
    });

    it('returns empty array on empty packages', () => {
        const directImportRule = new DirectImportRule(
            pepegaContext,
            {
                packages: []
            },
            file
        );

        const result = directImportRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid lodash cloneDeep require', () => {
        const directImportRule = new DirectImportRule(
            pepegaContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `-const y = 2;`,
                    `+const _ = require('lodash');`,
                    `+`,
                    `+const {`,
                    `+    cloneDeep,`,
                    `+    uniq,`,
                    `+    isEqual`,
                    `+} = require('lodash')`,
                    `-const { cloneDeep } = require('lodash')`
                ]
            }
        );

        const result = directImportRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 10);

        expect(result[1]).toHaveProperty('line', 16);
    });

    it('returns empty array on valid lodash cloneDeep require', () => {
        const directImportRule = new DirectImportRule(
            pepegaContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `-const y = 2;`,
                    `+const cloneDeep = require('lodash/cloneDeep');`,
                    `+`
                ]
            }
        );

        const result = directImportRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid lodash cloneDeep import', () => {
        const directImportRule = new DirectImportRule(
            pepegaContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `-const y = 2;`,
                    `+import _ from 'lodash';`,
                    `+`,
                    `+import {`,
                    `+    cloneDeep,`,
                    `+    uniq,`,
                    `+    isEqual`,
                    `+} from 'lodash'`,
                    `-import { cloneDeep } from 'lodash'`
                ]
            }
        );

        const result = directImportRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 10);

        expect(result[1]).toHaveProperty('line', 16);
    });

    it('returns empty array on valid lodash cloneDeep import', () => {
        const directImportRule = new DirectImportRule(
            pepegaContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `-const y = 2;`,
                    `+import cloneDeep from 'lodash/cloneDeep';`,
                    `+`
                ]
            }
        );

        const result = directImportRule.invoke();

        expect(result).toEqual([]);
    });
});
