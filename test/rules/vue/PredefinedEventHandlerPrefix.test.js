const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    vue: { PredefinedEventHandlerPrefixRule }
} = require('src/rules');
const setupApp = require('test/rules/helpers/setupApp');
const initializeFile = require('test/rules/helpers/initializeFile');

const config = {
    prefix: 'on'
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

    it('returns empty array on valid event handlers /on/ prefixes', () => {
        const predefinedEventHandlerPrefixRule =
            new PredefinedEventHandlerPrefixRule(pepegaContext, config, {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+<template>`,
                    `+<div>`,
                    `+    <my-custom-component`,
                    `+        @click="onClick"`,
                    `+        v-on:click="onClick"`,
                    `+        @keyup.s="$emit('test1')"`,
                    `+        @keyup.enter="someBoolean = true"`,
                    `+        @keyup.w="someString = 'someValue'"`,
                    `+    />`,
                    `+</div>`
                ]
            });

        const result = predefinedEventHandlerPrefixRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on missing event handlers /on/ prefixes', () => {
        const predefinedEventHandlerPrefixRule =
            new PredefinedEventHandlerPrefixRule(pepegaContext, config, {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+<template>`,
                    `+<div>`,
                    `+    <my-custom-component`,
                    `+        @click="clickHandler"`,
                    `+        v-on:click="clickHandler"`,
                    `+        @keyup.s="$emit('test1')"`,
                    `+        @keyup.enter="someBoolean = true"`,
                    `+        @keyup.w="someString = 'someValue'"`,
                    `+    />`,
                    `+</div>`
                ]
            });

        const result = predefinedEventHandlerPrefixRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 8);

        expect(result[1]).toHaveProperty('line', 9);
    });
});
