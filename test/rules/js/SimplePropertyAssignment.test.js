const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    js: { SimplePropertyAssignment }
} = require('src/rules');
const setupApp = require('test/rules/helpers/setupApp');
const initializeFile = require('test/rules/helpers/initializeFile');

const config = { };

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
        const simplePropertyAssignment = new SimplePropertyAssignment(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const object1 = {`,
                    `+    filter1,`,
                    `+    filter2,`,
                    `+    rules: result.filter(element => element.type === 'result')`,
                    `+};`
                    `+`,
                    ` const object2 = {`,
                    `     property1: 123,`,
                    `     property2: 'hello',`,
                    `     property3,`,
                    ` };`,
                    `-`,
                    `-const object3 = {`,
                    `-    property1: property1,`,
                    `-    property2: property2,`,
                    `-    property3: property3,`,
                    `-};`,
                ]
            }
        );

        const result = simplePropertyAssignment.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid simple object property assignment', () => {
        const simplePropertyAssignment = new SimplePropertyAssignment(
            patchronContext,
            config,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +10,5 @@`,
                    `+const object1 = {`,
                    `+    filter1,`,
                    `+    filter2: filter2,`,
                    `+    rules: result.filter(element => element.type === 'result')`,
                    `+};`
                    `+`,
                    ` const object2 = {`,
                    `     property1: property1,`,
                    `     property2: 'hello',`,
                    `     property3,`,
                    ` };`,
                    `-`,
                    `-const object3 = {`,
                    `-    property1: property1,`,
                    `-    property2: property2,`,
                    `-    property3: property3,`,
                    `-};`,
                ]
            }
        );

        const result = simplePropertyAssignment.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 12);
        
        expect(result[1]).toHaveProperty('line', 17);
    });

});
