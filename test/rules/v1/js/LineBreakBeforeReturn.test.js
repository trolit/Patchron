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
const LineBreakBeforeReturnRule = require('src/rules/v1/common/LineBreakBeforeReturn');

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

    it('returns empty array on valid return', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+module.exports = (x) => {`,
                    `+    if (x === 5) {`,
                    `+        const result = doSomething();`,
                    `+        `,
                    `+        return result;`,
                    `+    } else if (x === 10)`,
                    `+        `,
                    `+        return 4;`,
                    `+    else if (x === 15) {`,
                    `+        const a = 2;`,
                    `+        const b = 3;`,
                    `+        `,
                    `+        return a * x + b;`,
                    `+    }`,
                    `+`,
                    `+    return x;`,
                    `+}`
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid return (example 1)', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+module.exports = (x) => {`,
                    `+    return x;`,
                    `+}`
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid return (example 2)', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+module.exports = (x) => {`,
                    `+    for (let i = 2; i < 5; i++)`,
                    `+        if (x + i >= 6)`,
                    `+            return x - i;`,
                    `+`,
                    `+    return x;`,
                    `+}`
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid return (example 3)', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+module.exports = (x) => {`,
                    `+    for (let x = 0; x < 5; x++) if (x == 3) return 5;`,
                    `+`,
                    `+    return x;`,
                    `+}`
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid return (example 4)', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+module.exports = (x) => {`,
                    `+    for (let x = 0; x < 5; x++) if (x == 3) { return 5; }`,
                    `+`,
                    `+    return x;`,
                    `+}`
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid return (example 5)', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+module.exports = (x) => {`,
                    `+    if (x === 5) {`,
                    `+        const y = doSomething();`,
                    `+        `,
                    `+        return y + x;`,
                    `+    }`,
                    `+    `,
                    `+    return x;`,
                    `+}`
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid return (example 6)', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const result = doSomething();`,
                    `+`,
                    `+const y = result + difference;`,
                    `+const z = y * getRandomValue();`,
                    `+`,
                    `+return z;`
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid return (example 7)', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+module.exports = () => {`,
                    `+    const x = 2;`,
                    `+`,
                    `+    return x;`,
                    `+}`
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid return (example 8)', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+module.exports = () => {`,
                    `+    const x = 2;`,
                    `+`,
                    `+    return x;`
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid return (example 9)', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+    {`,
                    `+        return x;`,
                    `+        `,
                    `+        if (x === 2)`,
                    `+            console.log(x);`
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid return (example 10)', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+module.exports = () => {`,
                    `+    for (let i = 0; i < 5; i++) console.log(i);`,
                    `+`,
                    `+    return 1;`,
                    `}`
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid return (example 1)', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+module.exports = (x) => {`,
                    `+    if (x === 5) {`,
                    `+        const result = doSomething();`,
                    `+        return result;`,
                    `+    } else if (x === 10)`,
                    `+        return 4;`,
                    `+    else if (x === 15) {`,
                    `+        const a = 2;`,
                    `+        const b = 3;`,
                    `+        return a * x + b;`,
                    `+    }`,
                    `+    return x;`,
                    `+}`
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toHaveLength(4);

        expect(result[0]).toHaveProperty('line', 13);

        expect(result[1]).toHaveProperty('line', 15);

        expect(result[2]).toHaveProperty('line', 19);

        expect(result[3]).toHaveProperty('line', 21);
    });

    it('returns review on invalid return (example 2)', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+module.exports = () => {`,
                    `+    for (let i = 0; i < 5; i++) console.log(i);`,
                    `+    return 1;`,
                    `}`
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 12);
    });

    it('returns review on invalid return (example 3)', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+module.exports = () => {`,
                    `+    for (let i = 0; i < 5; i++)`,
                    `+        console.log(i);`,
                    `+    return 1;`,
                    `}`
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 13);
    });

    it('returns review on invalid return (example 4)', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+module.exports = () => {`,
                    `+    for (let i = 0; i < 5; i++) {`,
                    `+        console.log(i);`,
                    `+        return 1;`,
                    `+    }`,
                    `}`
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 13);
    });

    it('returns review on return that is part of multi-line string (edge case)', () => {
        const lineBreakBeforeReturnRule = new LineBreakBeforeReturnRule(
            patchronContext,
            null,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const multiLineText = \``,
                    `+return 2 informs to invoke function45`,
                    `+\``
                ]
            }
        );

        const result = lineBreakBeforeReturnRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 11);
    });
});
