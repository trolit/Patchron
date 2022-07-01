const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    js: { OperatorStyleRule }
} = require('src/rules');
const setupApp = require('test/rules/helpers/setupApp');
const initializeFile = require('test/rules/helpers/initializeFile');

const config = {
    mode: 'simplified',
    patterns: [
        {
            name: 'OR',
            expression: /a/,
            expected: {
                simplified: /a/,
                expanded: /a/
            }
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

    it('returns empty array on invalid mode', () => {
        const operatorStyleRule = new OperatorStyleRule(
            patchronContext,
            {
                mode: 'xyz',
                patterns: [
                    {
                        name: 'pattern1'
                    }
                ]
            },
            {
                ...file
            }
        );

        const result = operatorStyleRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on empty patterns', () => {
        const operatorStyleRule = new OperatorStyleRule(
            patchronContext,
            {
                mode: 'simplified',
                patterns: []
            },
            {
                ...file
            }
        );

        const result = operatorStyleRule.invoke();

        expect(result).toEqual([]);
    });

    /**
     * ---------------------------------------------------
     * SIMPLIFIED MODE TESTS
     * ---------------------------------------------------
     */

    it('returns empty array on valid `OR null, true, false` pattern', () => {
        const operatorStyleRule = new OperatorStyleRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const actionType = !!this.getActionType();`,
                    `+`,
                    `+if (!actionType) {`,
                    `+    action = pickAction(context);`,
                    `+}`,
                    `+`,
                    `+const isNull = this.findProperties();`,
                    `+const isValid = this.validateActionType();`,
                    `+const isChecked = !isNull && isValid && this.testNode(button, action);`,
                    `+`,
                    `+return isChecked;`
                ]
            }
        );

        const result = operatorStyleRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `OR null, true, false` pattern', () => {
        const operatorStyleRule = new OperatorStyleRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const actionType = this.getActionType() || null;`,
                    `+`,
                    `+if (!actionType) {`,
                    `+    action = pickAction(context);`,
                    `+}`,
                    `+`,
                    `+const isNull = this.findProperties();`,
                    `+const isValid = this.validateActionType() || false;`,
                    `+const isChecked = !isNull && isValid && this.testNode(button, action);`,
                    `+`,
                    `+return isChecked || false;`
                ]
            }
        );

        const result = operatorStyleRule.invoke();

        expect(result).toHaveLength(3);

        expect(result[0]).toHaveProperty('line', 10);

        expect(result[1]).toHaveProperty('line', 17);

        expect(result[2]).toHaveProperty('line', 20);
    });

    it('returns empty array on valid `EQ true` pattern', () => {
        const operatorStyleRule = new OperatorStyleRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const actionType = !!this.getActionType();`,
                    `+`,
                    `+if (!actionType) {`,
                    `+    action = pickAction(context);`,
                    `+}`,
                    `+`,
                    `+const isNull = this.findProperties();`,
                    `+const isValid = this.validateActionType();`,
                    `+const isChecked = !isNull && isValid && this.testNode(button, action);`,
                    `+`,
                    `+return isChecked;`
                ]
            }
        );

        const result = operatorStyleRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `EQ true` pattern', () => {
        const operatorStyleRule = new OperatorStyleRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const actionType = !!this.getActionType();`,
                    `+`,
                    `+if (!actionType) {`,
                    `+    action = pickAction(context);`,
                    `+}`,
                    `+`,
                    `+const isNull = this.findProperties();`,
                    `+const isValid = this.validateActionType() === true;`,
                    `+const isChecked = !isNull && isValid && this.testNode(button, action);`,
                    `+`,
                    `+return isChecked == true;`
                ]
            }
        );

        const result = operatorStyleRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 17);

        expect(result[1]).toHaveProperty('line', 20);
    });

    it('returns empty array on valid `EQ false` pattern', () => {
        const operatorStyleRule = new OperatorStyleRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const actionType = !!this.getActionType();`,
                    `+`,
                    `+if (!actionType) {`,
                    `+    action = pickAction(context);`,
                    `+}`,
                    `+`,
                    `+const isNull = this.findProperties();`,
                    `+const isValid = !this.validateActionType();`,
                    `+const isChecked = !isNull && isValid && this.testNode(button, action);`,
                    `+`,
                    `+return !isChecked;`
                ]
            }
        );

        const result = operatorStyleRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `EQ false` pattern', () => {
        const operatorStyleRule = new OperatorStyleRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const actionType = !!this.getActionType();`,
                    `+`,
                    `+if (!actionType) {`,
                    `+    action = pickAction(context);`,
                    `+}`,
                    `+`,
                    `+const isNull = this.findProperties();`,
                    `+const isValid = this.validateActionType() === false;`,
                    `+const isChecked = !isNull && isValid && this.testNode(button, action);`,
                    `+`,
                    `+return isChecked == false;`
                ]
            }
        );

        const result = operatorStyleRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 17);

        expect(result[1]).toHaveProperty('line', 20);
    });

    it('returns empty array on valid `NE null, false` pattern', () => {
        const operatorStyleRule = new OperatorStyleRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const actionType = !!this.getActionType();`,
                    `+`,
                    `+if (!actionType) {`,
                    `+    action = pickAction(context);`,
                    `+}`,
                    `+`,
                    `+const isNull = this.findProperties();`,
                    `+const isValid = this.validateActionType();`,
                    `+const isChecked = !isNull && isValid && this.testNode(button, action);`,
                    `+`,
                    `+return isChecked;`
                ]
            }
        );

        const result = operatorStyleRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `NE null, false` pattern', () => {
        const operatorStyleRule = new OperatorStyleRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const actionType = !!this.getActionType();`,
                    `+`,
                    `+if (actionType !== null) {`,
                    `+    action = pickAction(context);`,
                    `+}`,
                    `+`,
                    `+const isNull = this.findProperties();`,
                    `+const isValid = this.validateActionType() != false;`,
                    `+const isChecked = !isNull && isValid && this.testNode(button, action);`,
                    `+`,
                    `+return isChecked;`
                ]
            }
        );

        const result = operatorStyleRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 12);

        expect(result[1]).toHaveProperty('line', 17);
    });
});
