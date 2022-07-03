const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    js: { SimpleComparisionRule }
} = require('src/rules');
const setupApp = require('test/rules/helpers/setupApp');
const initializeFile = require('test/rules/helpers/initializeFile');

const config = {
    patterns: [
        {
            name: 'eq',
            regex: /={2,3}(\s)*?(true|false|null|undefined)/,
            suggestions: [
                'value === true -> value',
                'value === false/null/undefined -> !value'
            ]
        },
        {
            name: 'ne',
            regex: /!={1,2}(\s)*?(true|false|null|undefined)/,
            suggestions: [
                'value !== true -> !value',
                'value !== false/null/undefined -> value'
            ]
        }
    ]
};

describe('invoke function', () => {
    let patchronContext = null;
    let file = {};

    beforeEach(() => {
        patchronContext = setupApp();

        file = initializeFile();
    });

    afterEach(() => {
        nock.cleanAll();

        nock.enableNetConnect();
    });

    it('returns empty array on empty patterns', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
            patchronContext,
            {
                patterns: []
            },
            {
                ...file
            }
        );

        const result = simpleComparisionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid `eq` pattern', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const withActionType = !!this.getActionType();`,
                    `+`,
                    `+if (!withActionType) {`,
                    `+    action = pickAction(context);`,
                    `+}`,
                    `+`,
                    `+const isNull = !result;`,
                    `+const isUndefined = !this.validateActionType();`,
                    `+const isChecked = !isNull && !isUndefined && this.testNode(button, action);`,
                    `+`,
                    `+return isChecked;`
                ]
            }
        );

        const result = simpleComparisionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `eq` pattern', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const withActionType = !!this.getActionType();`,
                    `+`,
                    `+if (withActionType === false) {`,
                    `+    action = pickAction(context);`,
                    `+}`,
                    `+`,
                    `+const isNull = result === null;`,
                    `+const isUndefined = this.validateActionType() === undefined;`,
                    `+const isChecked = !isNull && !isUndefined && this.testNode(button, action);`,
                    `+`,
                    `+return isChecked == true;`
                ]
            }
        );

        const result = simpleComparisionRule.invoke();

        expect(result).toHaveLength(4);

        expect(result[0]).toHaveProperty('line', 12);

        expect(result[1]).toHaveProperty('line', 16);

        expect(result[2]).toHaveProperty('line', 17);

        expect(result[3]).toHaveProperty('line', 20);
    });

    it('returns empty array on valid `ne` pattern', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const withActionType = !!this.getActionType();`,
                    `+`,
                    `+if (!withActionType) {`,
                    `+    action = pickAction(context);`,
                    `+}`,
                    `+`,
                    `+const isNull = !!result;`,
                    `+const isUndefined = !!this.validateActionType();`,
                    `+const isChecked = !isNull && !isUndefined && this.testNode(button, action);`,
                    `+`,
                    `+return isChecked;`
                ]
            }
        );

        const result = simpleComparisionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `ne` pattern', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const withActionType = !!this.getActionType();`,
                    `+`,
                    `+if (withActionType !== true) {`,
                    `+    action = pickAction(context);`,
                    `+}`,
                    `+`,
                    `+const isNull = result !== null;`,
                    `+const isUndefined = this.validateActionType() != undefined;`,
                    `+const isChecked = !isNull && !isUndefined && this.testNode(button, action);`,
                    `+`,
                    `+return isChecked != false;`
                ]
            }
        );

        const result = simpleComparisionRule.invoke();

        expect(result).toHaveLength(4);

        expect(result[0]).toHaveProperty('line', 12);

        expect(result[1]).toHaveProperty('line', 16);

        expect(result[2]).toHaveProperty('line', 17);

        expect(result[3]).toHaveProperty('line', 20);
    });
});
