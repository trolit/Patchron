const { describe, expect, it } = require('@jest/globals');
const ValueComparisionStyleRule = require('../../../src/rules/common/ValueComparisionStyle');

describe('invoke function', () => {
    let valueComparisionStyleRule;

    it('returns empty array on empty allowed levels config', () => {
        valueComparisionStyleRule = new ValueComparisionStyleRule({
            allowedLevels: []
        });

        const result = valueComparisionStyleRule.invoke({
            filename: '...'
        });

        expect(result).toEqual([]);
    });

    it('returns empty array on all allowed levels', () => {
        valueComparisionStyleRule = new ValueComparisionStyleRule({
            allowedLevels: [0, 1, 2]
        });

        const result = valueComparisionStyleRule.invoke({
            filename: '...'
        });

        expect(result).toEqual([]);
    });

    it('returns empty array on valid comparision style (weak equality)', () => {
        valueComparisionStyleRule = new ValueComparisionStyleRule({
            allowedLevels: [0]
        });

        const result = valueComparisionStyleRule.invoke({
            filename: '...',
            split_patch: [
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
        });

        expect(result).toEqual([]);
    });

    it('returns empty array on valid comparision style (strict equality)', () => {
        valueComparisionStyleRule = new ValueComparisionStyleRule({
            allowedLevels: [1]
        });

        const result = valueComparisionStyleRule.invoke({
            filename: '...',
            split_patch: [
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
        });

        expect(result).toEqual([]);
    });

    it('returns empty array on valid comparision style (Object.is)', () => {
        valueComparisionStyleRule = new ValueComparisionStyleRule({
            allowedLevels: [2]
        });

        const result = valueComparisionStyleRule.invoke({
            filename: '...',
            split_patch: [
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
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid comparision style (weak equality)', () => {
        valueComparisionStyleRule = new ValueComparisionStyleRule({
            allowedLevels: [0]
        });

        const result = valueComparisionStyleRule.invoke({
            filename: '...',
            split_patch: [
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
        });

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 3);

        expect(result[1]).toHaveProperty('start_line', 5);
        expect(result[1]).toHaveProperty('position', 8);
    });

    it('returns review on invalid comparision style (weak equality)', () => {
        valueComparisionStyleRule = new ValueComparisionStyleRule({
            allowedLevels: [0]
        });

        const result = valueComparisionStyleRule.invoke({
            filename: '...',
            split_patch: [
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
        });

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 3);

        expect(result[1]).toHaveProperty('start_line', 5);
        expect(result[1]).toHaveProperty('position', 8);
    });

    it('returns review on invalid comparision style (strict equality)', () => {
        valueComparisionStyleRule = new ValueComparisionStyleRule({
            allowedLevels: [1]
        });

        const result = valueComparisionStyleRule.invoke({
            filename: '...',
            split_patch: [
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
        });

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 3);

        expect(result[1]).toHaveProperty('start_line', 5);
        expect(result[1]).toHaveProperty('position', 8);
    });

    it('returns review on invalid comparision style (Object.is)', () => {
        valueComparisionStyleRule = new ValueComparisionStyleRule({
            allowedLevels: [2]
        });

        const result = valueComparisionStyleRule.invoke({
            filename: '...',
            split_patch: [
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
        });

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('line', 3);

        expect(result[1]).toHaveProperty('start_line', 5);
        expect(result[1]).toHaveProperty('position', 8);
    });
});
