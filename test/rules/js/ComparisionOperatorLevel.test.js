const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    common: { ComparisionOperatorLevelRule }
} = require('src/rules');
const setupPatchronContext = require('test/setupPatchronContext');
const initializeFile = require('test/rules/helpers/initializeFile');

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

    it('returns empty array on empty allowed levels config', () => {
        const comparisionOperatorLevelRule = new ComparisionOperatorLevelRule(
            patchronContext,
            {
                allowedLevels: []
            },
            file
        );

        const result = comparisionOperatorLevelRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on all allowed levels', () => {
        const comparisionOperatorLevelRule = new ComparisionOperatorLevelRule(
            patchronContext,
            {
                allowedLevels: [0, 1, 2]
            },
            file
        );

        const result = comparisionOperatorLevelRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid comparision style (weak equality)', () => {
        const comparisionOperatorLevelRule = new ComparisionOperatorLevelRule(
            patchronContext,
            {
                allowedLevels: [0]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    ` const x = 5;`,
                    ` const y = 3;`,
                    ` const z = x == 4 ? 1 : 2;`,
                    `+`,
                    `+cost multiLineString = \`text1 text2 text3 \${y != 2 ? 1 : 0}`,
                    `+ \${x == y ? 'enter' : 'exit'}`,
                    `+ leave a message containing \\=\\= to stop app`,
                    `+\``
                ]
            }
        );

        const result = comparisionOperatorLevelRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid comparision style (strict equality)', () => {
        const comparisionOperatorLevelRule = new ComparisionOperatorLevelRule(
            patchronContext,
            {
                allowedLevels: [1]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    ` const x = 5;`,
                    ` const y = 3;`,
                    ` const z = x === 4 ? 1 : 2;`,
                    `+`,
                    `+cost multiLineString = \`text1 text2 text3 \${y !== 2 ? 1 : 0}`,
                    `+ \${x === y ? 'enter' : 'exit'}`,
                    `+ leave a message containing \\=\\= to stop app`,
                    `+\``
                ]
            }
        );

        const result = comparisionOperatorLevelRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid comparision style (Object.is)', () => {
        const comparisionOperatorLevelRule = new ComparisionOperatorLevelRule(
            patchronContext,
            {
                allowedLevels: [2]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    ` const x = 5;`,
                    ` const y = 3;`,
                    ` const z = Object.is(x, 4) ? 1 : 2;`,
                    `+`,
                    `+cost multiLineString = \`text1 text2 text3 \${!Object.is(y, 2) ? 1 : 0}`,
                    `+ \${Object.is(x, y) ? 'enter' : 'exit'}`,
                    `+ leave a message containing \\=\\= to stop app`,
                    `+\``
                ]
            }
        );

        const result = comparisionOperatorLevelRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid comparision style (weak equality)', () => {
        const comparisionOperatorLevelRule = new ComparisionOperatorLevelRule(
            patchronContext,
            {
                allowedLevels: [0]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    ` const x = 5;`,
                    ` const y = 3;`,
                    ` const z = x === 4 ? 1 : 2;`,
                    `+`,
                    `+cost multiLineString = \`text1 text2 text3 \${y !== 2 ? 1 : 0}`,
                    `+ \${x === y ? 'enter' : 'exit'}`,
                    `+ leave a message containing \\=\\= to stop app`,
                    `+\``
                ]
            }
        );

        const result = comparisionOperatorLevelRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 3);

        expect(result[1]).toHaveProperty('start_line', 5);
        expect(result[1]).toHaveProperty('line', 8);
    });

    it('returns review on invalid comparision style (strict equality)', () => {
        const comparisionOperatorLevelRule = new ComparisionOperatorLevelRule(
            patchronContext,
            {
                allowedLevels: [1]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    ` const x = 5;`,
                    ` const y = 3;`,
                    ` const z = x == 4 ? 1 : 2;`,
                    `+`,
                    `+cost multiLineString = \`text1 text2 text3 \${!Object.is(y, 2) ? 1 : 0}`,
                    `+ \${x == y ? 'enter' : 'exit'}`,
                    `+ leave a message containing \\=\\= to stop app`,
                    `+\``
                ]
            }
        );

        const result = comparisionOperatorLevelRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 3);

        expect(result[1]).toHaveProperty('start_line', 5);
        expect(result[1]).toHaveProperty('line', 8);
    });

    it('returns review on invalid comparision style (Object.is)', () => {
        const comparisionOperatorLevelRule = new ComparisionOperatorLevelRule(
            patchronContext,
            {
                allowedLevels: [2]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    ` const x = 5;`,
                    ` const y = 3;`,
                    ` const z = x == 4 ? 1 : 2;`,
                    `+`,
                    `+cost multiLineString = \`text1 text2 text3 \${!Object.is(y, 2) ? 1 : 0}`,
                    `+ \${x == y ? 'enter' : 'exit'}`,
                    `+ leave a message containing \\=\\= to stop app`,
                    `+\``
                ]
            }
        );

        const result = comparisionOperatorLevelRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 3);

        expect(result[1]).toHaveProperty('start_line', 5);
        expect(result[1]).toHaveProperty('line', 8);
    });
});
