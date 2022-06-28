const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    js: { SimplePropertyAssignmentRule }
} = require('src/rules');
const setupApp = require('test/rules/helpers/setupApp');
const initializeFile = require('test/rules/helpers/initializeFile');

const config = {};

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

    it('returns empty array on valid simple object property assignment', () => {
        const simplePropertyAssignmentRule = new SimplePropertyAssignmentRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const objectA = { filter0, filter1, };`,
                    `+const objectB = { filter0, filter1 };`,
                    `+const objectC = { test1: doSomething() };`,
                    `+const objectD = {`,
                    `+    filter1,`,
                    `+    filter2,`,
                    `+    rules: result.filter(element => element.type === 'result')`,
                    `+};`,
                    `+`,
                    `+const objectE = { filter0, filter1, };`,
                    `+`,
                    `+const objectF = {`,
                    `+    filter1,`,
                    `+    filter2,`,
                    `+    filter3`,
                    `+};`,
                    `+`,
                    ` const objectG = {`,
                    `     property1,`,
                    `     property2: 'hello',`,
                    `     property3`,
                    ` };`,
                    `-`,
                    `-const objectH = {`,
                    `-    property1: property1,`,
                    `-    property2: property2,`,
                    `-    property3: property3,`,
                    `-};`
                ]
            }
        );

        const result = simplePropertyAssignmentRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid simple object property assignment', () => {
        const simplePropertyAssignmentRule = new SimplePropertyAssignmentRule(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const objectA = { filter0, filter1: filter1, };`,
                    `+const objectB = { filter0: filter0, filter1 };`,
                    `+const objectC = { test1: doSomething() };`,
                    `+const objectD = {`,
                    `+    filter1,`,
                    `+    filter2: filter2,`,
                    `+    rules: result.filter(element => element.type === 'result')`,
                    `+};`,
                    `+`,
                    `+const objectE = { filter0, filter1: filter1, };`,
                    `+`,
                    `+const objectF = {`,
                    `+    filter1: filter1,`,
                    `+    filter2,`,
                    `+    filter3,`,
                    `+};`,
                    `+`,
                    ` const objectG = {`,
                    `     property1,`,
                    `     property2: 'hello',`,
                    `     property3: property3`,
                    ` };`,
                    `-`,
                    `-const objectH = {`,
                    `-    property1: property1,`,
                    `-    property2: property2,`,
                    `-    property3: property3,`,
                    `-};`
                ]
            }
        );

        const result = simplePropertyAssignmentRule.invoke();

        expect(result).toHaveLength(6);

        expect(result[0]).toHaveProperty('line', 10);

        expect(result[1]).toHaveProperty('line', 11);

        expect(result[2]).toHaveProperty('line', 15);

        expect(result[3]).toHaveProperty('line', 19);

        expect(result[4]).toHaveProperty('line', 22);

        expect(result[5]).toHaveProperty('line', 30);
    });
});
