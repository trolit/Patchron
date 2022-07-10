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
const setupPatchronContext = require('test/setupPatchronContext');
const initializeFile = require('test/rules/helpers/initializeFile');

const config = {
    patterns: [
        {
            name: 'eq/ne (true, false)',
            expression: /(!={1,2}|={2,3})(\s)*?(true|false)/,
            comment: `
            \`value === true\`, \`value !== false\` -> \`value\`
            \`value === false\`, \`value !== true\` -> \`!value\`
            `,
            multiLineOptions: [
                {
                    indicator: {
                        endsWith: '='
                    },
                    limiter: 'nextLine'
                }
            ]
        },
        {
            name: 'eq/ne (null, undefined)',
            expression: /(!={1,2}|={2,3})(\s)*?(null|undefined)/,
            comment: `
            \`value === null/undefined\` -> \`!value\`
            \`value !== null/undefined\` -> \`!!value\`, \`value\`
            `,
            multiLineOptions: [
                {
                    indicator: {
                        endsWith: '='
                    },
                    limiter: 'nextLine'
                }
            ]
        },
        {
            name: 'ne (-1)',
            expression: /!={1,2}(\s)*?-1/,
            comment: `
            \`value !== -1\` -> \`~value\`
            `
        }
    ]
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
                    `+const customHeight =`,
                    `+                    isPredefinedHeight()`,
                    `+                        ? 150`,
                    `+                        : 300;`,
                    `+const customWidth =`,
                    `+                    !isPredefinedWidth()`,
                    `+                        ? 256`,
                    `+                        : 128;`,
                    `+`,
                    `+const customScale =`,
                    `+                    isPredefinedScale()`
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
                    `+const isChecked = condition1 && condition2 && this.testNode(button, action) == true;`,
                    `+`,
                    `+const customHeight =`,
                    `+                    isPredefinedHeight() ===`,
                    `+                    true`,
                    `+                        ? 150`,
                    `+                        : 300;`,
                    `+const customWidth =`,
                    `+                    isPredefinedWidth() !==`,
                    `+                    false`,
                    `+                        ? 256`,
                    `+                        : 128;`,
                    `+`,
                    `+const customScale =`,
                    `+                    isPredefinedScale() ===`
                ]
            }
        );

        const result = simpleComparisionRule.invoke();

        expect(result).toHaveLength(6);

        expect(result[0]).toHaveProperty('line', 12);

        expect(result[1]).toHaveProperty('line', 16);

        expect(result[2]).toHaveProperty('line', 17);

        expect(result[3]).toHaveProperty('line', 18);

        expect(result[4]).toHaveProperty('start_line', 21);
        expect(result[4]).toHaveProperty('position', 13);

        expect(result[5]).toHaveProperty('start_line', 26);
        expect(result[5]).toHaveProperty('position', 18);
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
                    `+const customHeight =`,
                    `+                    getPredefinedHeight()`,
                    `+                        ? 150`,
                    `+                        : 300;`,
                    `+const customWidth =`,
                    `+                    getPredefinedWidth()`,
                    `+                        ? 256`,
                    `+                        : 128;`,
                    `+`,
                    `+const customScale =`,
                    `+                    getPredefinedScale() ===`
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
                    `+const customHeight =`,
                    `+                    getPredefinedHeight() !==`,
                    `+                    null`,
                    `+                        ? 150`,
                    `+                        : 300;`,
                    `+const customWidth =`,
                    `+                    getPredefinedWidth() ===`,
                    `+                    undefined`,
                    `+                        ? 256`,
                    `+                        : 128;`,
                    `+`,
                    `+const customScale =`,
                    `+                    getPredefinedScale() ===`
                ]
            }
        );

        const result = simpleComparisionRule.invoke();

        expect(result).toHaveLength(6);

        expect(result[0]).toHaveProperty('line', 10);

        expect(result[1]).toHaveProperty('line', 16);

        expect(result[2]).toHaveProperty('line', 17);

        expect(result[3]).toHaveProperty('line', 19);

        expect(result[4]).toHaveProperty('start_line', 22);
        expect(result[4]).toHaveProperty('position', 14);

        expect(result[5]).toHaveProperty('start_line', 27);
        expect(result[5]).toHaveProperty('position', 19);
    });

    it('returns empty array on valid `ne (-1)` pattern', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+`,
                    `+if (~actionIndex) {`,
                    `+    action = pickAction(context);`,
                    `+}`
                ]
            }
        );

        const result = simpleComparisionRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `ne (-1)` pattern', () => {
        const simpleComparisionRule = new SimpleComparisionRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+`,
                    `+if (actionIndex !== -1) {`,
                    `+    action = pickAction(context);`,
                    `+}`
                ]
            }
        );

        const result = simpleComparisionRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 11);
    });
});
