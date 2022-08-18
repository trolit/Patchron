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
const setupPatchronContext = require('test/setupPatchronContext');
const initializeFile = require('test/rules/helpers/initializeFile');

const config = {
    regex: /(\w+).length/
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
     * FOR LOOP
     * ---------------------------------------------------
     */

    it('returns empty array on valid single-line for loop condition statement', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            patchronContext,
            config,
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

    it('returns review on invalid single-line for loop condition statement', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            patchronContext,
            config,
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

    it('returns empty array on insufficient multi-line for loop fragment', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+for (`,
                    `+    let index = 0,`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid multi-line for loop condition statement (example 1)', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+const dataLength = data.length;`,
                    `+for (`,
                    `+    let index = 0, secondIndex = 1;`,
                    `+    index == 5 ||`,
                    `+    index < dataLength`,
                    `+) {`,
                    `+    const a = doSomething();`,
                    `+    if (index === dataLength - 1) { break; }`,
                    `+}`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid multi-line for loop condition statement (example 2)', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+const dataLength = data.length;`,
                    `+for (`,
                    `+    let index = 0,`,
                    `+    secondIndex = 1,`,
                    `+    thirdIndex = 2;`,
                    `+    index == 5 ||`,
                    `+    index < dataLength`,
                    `+) {`,
                    `+    const a = doSomething();`,
                    `+    if (index === dataLength - 1) { break; }`,
                    `+}`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid multi-line for loop condition statement (example 1)', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+for (`,
                    `+    let index = 0, secondIndex = 1;`,
                    `+    index == 5 ||`,
                    `+    index < data.length`,
                    `+) {`,
                    `+    const a = doSomething();`,
                    `+    if (index === dataLength - 1) { break; }`,
                    `+}`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 6);
    });

    it('returns review on invalid multi-line for loop condition statement (example 2)', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+const dataLength = data.length;`,
                    `+for (`,
                    `+    let index = 0,`,
                    `+    secondIndex = 1,`,
                    `+    thirdIndex = 2;`,
                    `+    index == 5 ||`,
                    `+    index < data.length`,
                    `+) {`,
                    `+    const a = doSomething();`,
                    `+    if (index === dataLength - 1) { break; }`,
                    `+}`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 7);
    });

    /**
     * ---------------------------------------------------
     * WHILE LOOP
     * ---------------------------------------------------
     */

    it('returns empty array on valid single-line while loop condition statement', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            patchronContext,
            config,
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

    it('returns review on invalid single-line while loop condition statement', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            patchronContext,
            config,
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

    it('returns empty array on valid multi-line while loop condition statement (example 1)', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+const dataLength = data.length;`,
                    `+while (`,
                    `+    index < dataLength ||`,
                    `+    index === 0`,
                    `+) {`,
                    `+    const a = doSomething();`,
                    `+    if (index === dataLength - 1) { break; }`,
                    `+}`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid multi-line while loop condition statement (example 2)', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+const dataLength = data.length;`,
                    `+while (`,
                    `+    index > 5 && index < 7 ||`,
                    `+    index < dataLength ||`,
                    `+    index === 0`,
                    `+) {`,
                    `+    const a = doSomething();`,
                    `+    if (index === dataLength - 1) { break; }`,
                    `+}`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid multi-line while loop fragment', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+const dataLength = data.length;`,
                    `+while (`,
                    `+    index > 5,`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid multi-line while loop condition statement (example 1)', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+while (`,
                    `+    index === 0 ||`,
                    `+    index < data.length`,
                    `+) {`,
                    `+    const a = doSomething();`,
                    `+    if (index === dataLength - 1) { break; }`,
                    `+}`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 6);
    });

    it('returns review on invalid multi-line while loop condition statement (example 2)', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +6,15 @@`,
                    `+while (`,
                    `+    index > 5 && index < 7 ||`,
                    `+    index < data.length ||`,
                    `+    index === 0`,
                    `+) {`,
                    `+    const a = doSomething();`,
                    `+    if (index === dataLength - 1) { break; }`,
                    `+}`
                ]
            }
        );

        const result = fixedLoopLengthConditionRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 6);
    });

    /**
     * ---------------------------------------------------
     * DO WHILE LOOP
     * ---------------------------------------------------
     */

    it('returns empty array on valid do..while loop condition statement', () => {
        const fixedLoopLengthConditionRule = new FixedLoopLengthConditionRule(
            patchronContext,
            config,
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
            patchronContext,
            config,
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
