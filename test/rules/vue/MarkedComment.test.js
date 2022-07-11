const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    html: { MarkedCommentRule }
} = require('src/rules');
const setupPatchronContext = require('test/setupPatchronContext');
const initializeFile = require('test/rules/helpers/initializeFile');

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

    it('returns empty array on marked comments', () => {
        const markedCommentRule = new MarkedCommentRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +3,7 @@`,
                    `+<template>`,
                    `+<!--`,
                    `+@NOTE might not work perfect due to problems with API`,
                    `-@WARNING`,
                    `+-->`,
                    `+<div> <!-- @NOTE another comment -->`,
                    `+    <!-- @TODO`,
                    `+         Update props once PR#859 will be merged`,
                    `+    -->`,
                    `+    <my-custom-component`,
                    `+        :data="data"`,
                    `+        :labels="labels"`,
                    `+        :container="container"`,
                    `+        @click="onClick"`,
                    `+    />`,
                    `+    <!-- @TMP data preview -->`,
                    `+    {{ data }}`,
                    `+</div>`,
                    `+<!--`
                ]
            }
        );

        const result = markedCommentRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on unmarked comments', () => {
        const markedCommentRule = new MarkedCommentRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +3,7 @@`,
                    `+<template>`,
                    `+<!--`,
                    `+might not work perfect due to problems with API`,
                    `-@WARNING`,
                    `+-->`,
                    `+<div> <!-- another comment -->`,
                    `+    <!--`,
                    `+        Update props once PR#859 will be merged`,
                    `+    -->`,
                    `+    <my-custom-component`,
                    `+        :data="data"`,
                    `+        :labels="labels"`,
                    `+        :container="container"`,
                    `+        @click="onClick"`,
                    `+    />`,
                    `+    <!-- tmp data preview -->`,
                    `+    {{ data }}`,
                    `+</div>`,
                    `+<!--`
                ]
            }
        );

        const result = markedCommentRule.invoke();

        expect(result).toHaveLength(3);

        expect(result[0]).toHaveProperty('start_line', 4);
        expect(result[0]).toHaveProperty('position', 4);

        expect(result[1]).toHaveProperty('start_line', 8);
        expect(result[1]).toHaveProperty('position', 8);

        expect(result[2]).toHaveProperty('line', 17);
    });
});
