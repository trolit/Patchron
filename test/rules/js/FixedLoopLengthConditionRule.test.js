const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    common: { FixedLoopLengthConditionRule }
} = require('src/rules');
const setupApp = require('test/rules/helpers/setupApp');
const initializeFile = require('test/rules/helpers/initializeFile');

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

    it('returns empty array on valid for loop condition statement', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            pepegaContext,
            {},
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+const dataLength = data.length;`,
                    `+for (let index = 0; index < dataLength; index++) {`,
                    `+    const a = doSomething();`,
                    `+    if (index === dataLength - 1) { break; }`,
                    `+}`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid for loop condition statement', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            pepegaContext,
            {},
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+for (let index = 0; index < data.length; index++) {`,
                    `+    const a = doSomething();`,
                    `+    if (index === data.length - 1) { break; }`,
                    `+}`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 6);
    });

    it('returns empty array on valid while loop condition statement', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            pepegaContext,
            {},
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+const dataLength = data.length;`,
                    `+while (index < dataLength) {`,
                    `+    const a = doSomething();`,
                    `+    if (index === dataLength - 1) { break; }`,
                    `+}`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid while loop condition statement', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            pepegaContext,
            {},
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+while (index < data.length) {`,
                    `+    const a = doSomething();`,
                    `+    if (index === data.length - 1) { break; }`,
                    `+}`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 6);
    });

    it('returns empty array on valid do..while loop condition statement', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            pepegaContext,
            {},
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+const dataLength = data.length;`,
                    `+do {`,
                    `+    const a = doSomething();`,
                    `+    if (index === dataLength - 1) { break; }`,
                    `+} while(index < dataLength)`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid do..while loop condition statement', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            pepegaContext,
            {},
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+do {`,
                    `+    const a = doSomething();`,
                    `+    if (index === data.length - 1) { break; }`,
                    `+} while(index < data.length)`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 9);
    });
});
