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
            name: 'eq (true)',
            expandedRegex: /a/,
            simplifiedRegex: /a/
        },
        {
            name: 'eq (false)',
            expandedRegex: /a/,
            simplifiedRegex: /a/
        },
        {
            name: 'ne',
            expandedRegex: /a/,
            simplifiedRegex: /a/
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

    it('returns empty array on valid `eq true` pattern', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
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

        const result = simpleComparisionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `eq true` pattern', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
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

        const result = simpleComparisionRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 17);

        expect(result[1]).toHaveProperty('line', 20);
    });

    it('returns empty array on valid `eq false` pattern', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
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

        const result = simpleComparisionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `eq false` pattern', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
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

        const result = simpleComparisionRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 17);

        expect(result[1]).toHaveProperty('line', 20);
    });

    it('returns empty array on valid `ne null, false` pattern', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
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

        const result = simpleComparisionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `ne null, false` pattern', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
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

        const result = simpleComparisionRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 12);

        expect(result[1]).toHaveProperty('line', 17);
    });
});
