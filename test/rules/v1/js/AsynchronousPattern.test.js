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
const AsynchronousPatternRule = require('src/rules/v1/js/AsynchronousPattern');

const awaitConfig = { pattern: 'await' };
const thenConfig = { pattern: 'then' };

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

    it('returns empty array on valid asynchronous pattern (await)', () => {
        const asynchronousPatternRule = new AsynchronousPatternRule(
            patchronContext,
            awaitConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const result = await Task.findAll({`,
                    `+    where: {`,
                    `+        email: req.params.email`,
                    `+    }`,
                    `+});`
                ]
            }
        );

        const result = asynchronousPatternRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid asynchronous pattern (await)', () => {
        const asynchronousPatternRule = new AsynchronousPatternRule(
            patchronContext,
            awaitConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+Task.findAll({`,
                    `+    where: {`,
                    `+        email: req.params.email`,
                    `+    }`,
                    `+}).then(data) => {`,
                    `+    res.status(200).send(data)`,
                    `+}).catch(() => {`,
                    `+    res.status(500).send();`,
                    `+});`
                ]
            }
        );

        const result = asynchronousPatternRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 14);
    });

    it('returns empty array on valid asynchronous pattern (then)', () => {
        const asynchronousPatternRule = new AsynchronousPatternRule(
            patchronContext,
            thenConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+Task.findAll({`,
                    `+    where: {`,
                    `+        email: req.params.email`,
                    `+    }`,
                    `+}).then(data) => {`,
                    `+    res.status(200).send(data)`,
                    `+}).catch(() => {`,
                    `+    res.status(500).send();`,
                    `+});`
                ]
            }
        );

        const result = asynchronousPatternRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid asynchronous pattern (then)', () => {
        const asynchronousPatternRule = new AsynchronousPatternRule(
            patchronContext,
            thenConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const result = await Task.findAll({`,
                    `+    where: {`,
                    `+        email: req.params.email`,
                    `+    }`,
                    `+});`
                ]
            }
        );

        const result = asynchronousPatternRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 10);
    });
});
