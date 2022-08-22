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
const SelfClosingTagRule = require('src/rules/v1/vue/SelfClosingTag');

const config = {};

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

    it('returns empty array on valid tags', () => {
        const selfClosingTagRule = new SelfClosingTagRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+<template>`,
                    `+<v-data-table`,
                    `+    :headers="headers"`,
                    `+    :items="desserts"`,
                    `+    :items-per-page="5"`,
                    `+/>`,
                    `+`,
                    `+<first-component/>`,
                    `+`,
                    `+<second-component`,
                    `+    :prop1="value1"`,
                    `+    :prop2="value2"`,
                    `+/>`
                ]
            }
        );

        const result = selfClosingTagRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid tags', () => {
        const selfClosingTagRule = new SelfClosingTagRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+<template>`,
                    `+<v-data-table`,
                    `+    :headers="headers"`,
                    `+    :items="desserts"`,
                    `+    :items-per-page="5"`,
                    `+></v-data-table>`,
                    `+`,
                    `+<first-component></first-component>`,
                    `+`,
                    `+<second-component`,
                    `+    :prop1="value1"`,
                    `+    :prop2="value2"`,
                    `+></second-component>`
                ]
            }
        );

        const result = selfClosingTagRule.invoke();

        expect(result).toHaveLength(3);

        expect(result[0]).toHaveProperty('line', 10);

        expect(result[1]).toHaveProperty('line', 12);

        expect(result[2]).toHaveProperty('line', 17);
    });
});
