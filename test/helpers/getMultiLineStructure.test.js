const { describe, expect, it, beforeEach } = require('@jest/globals');

const BaseRule = require('src/rules/Base');
const setupApp = require('test/rules/helpers/setupApp');
const { getMultiLineStructure } = require('src/helpers');

describe('', () => {
    let baseRule = null;

    beforeEach(() => {
        const patchronContext = setupApp();

        baseRule = new BaseRule(patchronContext);
    });

    it('returns valid endIndex (example 1)', () => {
        const data = baseRule.setupData([
            `@@ -10,13 +10,5 @@`,
            `+module.exports = (x) => {`,
            `+    const result = x * 3;`,
            `+};`
        ]);

        const result = getMultiLineStructure(data, 1, [
            {
                indicator: {
                    startsWith: 'module.exports ='
                },
                limiter: {
                    startsWith: '}',
                    indentation: 'eq-indicator'
                }
            }
        ]);

        expect(result).toHaveProperty('endIndex', 3);
    });

    it('returns invalid endIndex on missing limiter (example 1)', () => {
        const data = baseRule.setupData([
            `@@ -10,13 +10,5 @@`,
            `+module.exports = (x) => {`,
            `+    const result = x * 3;`,
            `+};`
        ]);

        const result = getMultiLineStructure(data, 1, [
            {
                indicator: {
                    startsWith: 'module.exports ='
                },
                limiter: {
                    startsWith: '}',
                    indentation: 'gt-indicator'
                }
            }
        ]);

        expect(result).toHaveProperty('endIndex', -1);
    });

    it('returns valid endIndex (example 2)', () => {
        const data = baseRule.setupData([
            `@@ -10,13 +10,5 @@`,
            `+module.exports = (x) => {`,
            `+    const result = x * 3;`,
            `+};`
        ]);

        const result = getMultiLineStructure(data, 1, [
            {
                indicator: {
                    startsWith: 'module.exports ='
                },
                limiter: {
                    startsWith: '};',
                    indentation: ['eq', 0]
                }
            }
        ]);

        expect(result).toHaveProperty('endIndex', 3);
    });

    it('returns invalid endIndex on missing limiter (example 2)', () => {
        const data = baseRule.setupData([
            `@@ -10,13 +10,5 @@`,
            `+module.exports = (x) => {`,
            `+    const result = x * 3;`,
            `+};`
        ]);

        const result = getMultiLineStructure(data, 1, [
            {
                indicator: {
                    startsWith: 'module.exports ='
                },
                limiter: {
                    startsWith: '};',
                    indentation: ['eq', 4]
                }
            }
        ]);

        expect(result).toHaveProperty('endIndex', -1);
    });

    it('returns valid endIndex (example 3)', () => {
        const data = baseRule.setupData([
            `@@ -10,13 +10,5 @@`,
            `+import {`,
            `+    method1`,
            `+} from 'src/helpers';`
        ]);

        const result = getMultiLineStructure(data, 1, [
            {
                indicator: {
                    notIncludes: 'from'
                },
                limiter: {
                    includes: 'from',
                    until: '/'
                }
            }
        ]);

        expect(result).toHaveProperty('endIndex', 3);
    });

    it('returns invalid endIndex on missing limiter (example 3)', () => {
        const data = baseRule.setupData([
            `@@ -10,13 +10,5 @@`,
            `+import {`,
            `+    method1`,
            `+} /from 'src/helpers';`
        ]);

        const result = getMultiLineStructure(data, 1, [
            {
                indicator: {
                    notIncludes: 'from'
                },
                limiter: {
                    includes: 'from',
                    until: '/'
                }
            }
        ]);

        expect(result).toHaveProperty('endIndex', -1);
    });

    it('returns valid endIndex (example 4)', () => {
        const data = baseRule.setupData([
            `@@ -10,13 +10,5 @@`,
            `+const {`,
            `+    method1`,
            `+    method2`,
            `+} = require('src/helpers');`
        ]);

        const result = getMultiLineStructure(data, 1, [
            {
                indicator: {
                    equals: 'const {'
                },
                limiter: {
                    startsWith: '} = require'
                }
            }
        ]);

        expect(result).toHaveProperty('endIndex', 4);
    });

    it('returns invalid endIndex on missing limiter (example 4)', () => {
        const data = baseRule.setupData([
            `@@ -10,13 +10,5 @@`,
            `+const {`,
            `+    method1`,
            `+    method2`
        ]);

        const result = getMultiLineStructure(data, 1, [
            {
                indicator: {
                    equals: 'const {'
                },
                limiter: {
                    startsWith: '} = require'
                }
            }
        ]);

        expect(result).toHaveProperty('endIndex', -1);
    });

    it('returns valid endIndex (example 5)', () => {
        const data = baseRule.setupData([
            `@@ -10,13 +10,5 @@`,
            `+const {`,
            `+    method1`,
            `+    method2`,
            `+} = require('src/helpers');`
        ]);

        const result = getMultiLineStructure(data, 1, [
            {
                indicator: {
                    expression: /const {/
                },
                limiter: {
                    expression: /} = require\(.*/
                }
            }
        ]);

        expect(result).toHaveProperty('endIndex', 4);
    });

    it('returns invalid endIndex on missing limiter (example 5)', () => {
        const data = baseRule.setupData([
            `@@ -10,13 +10,5 @@`,
            `+const {`,
            `+    method1`,
            `+    method2`
        ]);

        const result = getMultiLineStructure(data, 1, [
            {
                indicator: {
                    expression: /const {/
                },
                limiter: {
                    expression: /} = require\(.*/
                }
            }
        ]);

        expect(result).toHaveProperty('endIndex', -1);
    });
});
