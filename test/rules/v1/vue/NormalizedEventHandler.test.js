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
const NormalizedEventHandlerRule = require('src/rules/v1/vue/NormalizedEventHandler');

const config = {
    prefix: 'on',
    noUnnecessaryBraces: true
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

    it('returns empty array on valid event handlers /on/ prefixes', () => {
        const normalizedEventHandlerRule = new NormalizedEventHandlerRule(
            patchronContext,
            config,
            {
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
            }
        );

        const result = normalizedEventHandlerRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on missing event handlers /on/ prefixes', () => {
        const normalizedEventHandlerRule = new NormalizedEventHandlerRule(
            patchronContext,
            config,
            {
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
            }
        );

        const result = normalizedEventHandlerRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 8);

        expect(result[1]).toHaveProperty('line', 9);
    });

    it('returns empty array when noUnnecessaryBraces = false', () => {
        const normalizedEventHandlerRule = new NormalizedEventHandlerRule(
            patchronContext,
            {
                ...config,
                noUnnecessaryBraces: false
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+<template>`,
                    `+<div>`,
                    `+    <my-custom-component`,
                    `+        @click="onClick()"`,
                    `+        v-on:click="onClick($event)"`,
                    `+        @keyup.s="$emit('test1')"`,
                    `+        @keyup.enter="someBoolean = true"`,
                    `+        @keyup.w="someString = 'someValue'"`,
                    `+    />`,
                    `+</div>`
                ]
            }
        );

        const result = normalizedEventHandlerRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review when noUnnecessaryBraces = true', () => {
        const normalizedEventHandlerRule = new NormalizedEventHandlerRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+<template>`,
                    `+<div>`,
                    `+    <my-custom-component`,
                    `+        @click="onClick()"`,
                    `+        v-on:click="onClick($event)"`,
                    `+        @keyup.s="$emit('test1')"`,
                    `+        @keyup.enter="someBoolean = true"`,
                    `+        @keyup.w="someString = 'someValue'"`,
                    `+    />`,
                    `+</div>`
                ]
            }
        );

        const result = normalizedEventHandlerRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 8);

        expect(result[1]).toHaveProperty('line', 9);
    });
});
