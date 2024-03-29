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
const IndividualMethodImportRule = require('src/rules/v1/js/IndividualMethodImport');

const validConfig = {
    packages: [
        {
            name: 'lodash',
            regex: /[(|'|"]lodash[)|'|"]/
        }
    ]
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

    it('returns empty array on empty packages', () => {
        const individualMethodImportRule = new IndividualMethodImportRule(
            patchronContext,
            {
                packages: []
            },
            file
        );

        const result = individualMethodImportRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid lodash cloneDeep require', () => {
        const individualMethodImportRule = new IndividualMethodImportRule(
            patchronContext,
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

        const result = individualMethodImportRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid lodash cloneDeep require', () => {
        const individualMethodImportRule = new IndividualMethodImportRule(
            patchronContext,
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

        const result = individualMethodImportRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 10);

        expect(result[1]).toHaveProperty('line', 16);
    });

    it('returns empty array on valid lodash cloneDeep import', () => {
        const individualMethodImportRule = new IndividualMethodImportRule(
            patchronContext,
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

        const result = individualMethodImportRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid lodash cloneDeep import', () => {
        const individualMethodImportRule = new IndividualMethodImportRule(
            patchronContext,
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

        const result = individualMethodImportRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 10);

        expect(result[1]).toHaveProperty('line', 16);
    });
});
