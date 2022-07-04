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
            name: 'eq/ne (true, false)',
            expression: /(!={1,2}|={2,3})(\s)*?(true|false)/,
            comment: `
            \`value === true\`, \`value !== false\` -> \`value\`
            \`value === false\`, \`value !== true\` -> \`!value\`
            `
        },
        {
            name: 'eq/ne (null, undefined)',
            expression: /(!={1,2}|={2,3})(\s)*?(null|undefined)/,
            comment: `
            \`value === null/undefined\` -> \`!value\`
            \`value !== null/undefined\` -> \`!!value\`
            `,
            multiLineOptions: {
                endsWith: ['=']
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

    it('returns empty array on valid `eq/ne (true, false)` pattern', () => {
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
                    `+const condition1 = !this.isValid1();`,
                    `+const condition2 = this.isValid2();`,
                    `+const isChecked = condition1 && condition2 && this.testNode(button, action);`,
                    `+`,
                    `+return isChecked;`
                ]
            }
        );

        const result = simpleComparisionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `eq/ne (true, false)` pattern', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const withActionType = !!this.getActionType();`,
                    `+`,
                    `+if (withActionType != true) {`,
                    `+    action = pickAction(context);`,
                    `+}`,
                    `+`,
                    `+const condition1 = this.isValid1() === false;`,
                    `+const condition2 = this.isValid2() !== false;`,
                    `+const isChecked = condition1 && condition2 && this.testNode(button, action);`,
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

    it('returns empty array on valid `eq/ne (null, undefined)` pattern', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const withActionType = !!this.getActionType();`,
                    `+`,
                    `+if (withActionType) {`,
                    `+    action = pickAction(context);`,
                    `+}`,
                    `+`,
                    `+const condition1 = !this.isValid1();`,
                    `+const condition2 = !this.isValid2();`,
                    `+const isChecked = !condition1 && condition2`,
                    `+                    && !!this.testNode(button, action);`,
                    `+`,
                    `+return isChecked;`
                ]
            }
        );

        const result = simpleComparisionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `eq/ne (null, undefined)` pattern', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const withActionType = this.getActionType() != null;`,
                    `+`,
                    `+if (withActionType) {`,
                    `+    action = pickAction(context);`,
                    `+}`,
                    `+`,
                    `+const condition1 = this.isValid1() === undefined;`,
                    `+const condition2 = this.isValid2() == undefined;`,
                    `+const isChecked = !condition1 && condition2`,
                    `+                    && this.testNode(button, action) !== null;`,
                    `+`,
                    `+return isChecked;`
                ]
            }
        );

        const result = simpleComparisionRule.invoke();

        expect(result).toHaveLength(4);

        expect(result[0]).toHaveProperty('line', 10);

        expect(result[1]).toHaveProperty('line', 16);

        expect(result[2]).toHaveProperty('line', 17);

        expect(result[3]).toHaveProperty('line', 19);
    });
});
