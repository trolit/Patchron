const { describe, expect, it, beforeEach } = require('@jest/globals');
const SingleLineBlockRule = require('../../../pepega/rules/common/SingleLineBlock');

const validConfig = {
    blocks: [
        {
            name: 'if',
            expression: /^[\s]*(?:if).*[(].*[)].*/
        },
        {
            name: 'else if',
            expression: /^[{}]?[\s]*(?:else if).*[(].*[)].*/
        },
        {
            name: 'else',
            expression: /^(?:[{}].*(?:else)).*|^(?:else).*/
        },
        {
            name: 'for',
            expression: /^[\s]*(?:for).*[(].*[)].*/
        },
        {
            name: 'do..while',
            expression: /^[\s]*(?:do).*/,
            endIndicator: /while/
        },
        {
            name: 'while',
            expression: /^[\s]*(?:while).*[(].*[)].*/
        }
    ],
    curlyBraces: true
};

describe('invoke function', () => {
    let singleLineBlockRule;

    beforeEach(() => {
        singleLineBlockRule = new SingleLineBlockRule(validConfig);
    });

    it('returns empty array on invalid blocks config', () => {
        singleLineBlockRule = new SingleLineBlockRule({
            blocks: [],
            curlyBraces: false
        });

        const result = singleLineBlockRule.invoke({
            filename: '...'
        });

        expect(result).toEqual([]);
    });

    it('returns empty array on empty patch', () => {
        const result = singleLineBlockRule.invoke({
            filename: '...'
        });

        expect(result).toEqual([]);
    });

    /**
     * ---------------------------------------------------
     * SINGLE-LINE IF/ELSE IF/ELSE BLOCKS
     * ---------------------------------------------------
     */

    it('returns empty array on valid single-line if/else if/else blocks (with curly braces)', () => {
        const result = singleLineBlockRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
                `-const x = 3;`,
                `+const x = 4;`,
                `+const y = 5;`,
                `+if (x === y) { result = x; }`,
                `+`,
                `+if (x > y)`,
                `+{`,
                `+    result = x + y;`,
                `+}`,
                `+else if (x <= y)`,
                `+{`,
                `+    result = x - y;`,
                `+}`,
                `+else`,
                `+{`,
                `+    result = 0;`,
                `+}`,
                `+`,
                `+for (let index = 0; index < result; index++) {`,
                `+    if (index % 2 === 0) {`,
                `+        console.log(index);`,
                `+    } else if (index % 3 === 0) {`,
                `+        if (result > 18) { continue; }`,
                `+        else if (result < 6) { result += 2; }`,
                `+        else { break; }`,
                `+    }`,
                `+}`
            ]
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid single-line if/else if/else blocks (with curly braces)', () => {
        const result = singleLineBlockRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
                `-const x = 3;`,
                `+const x = 4;`,
                `+const y = 5;`,
                `+if (x === y) result = x;`,
                `+`,
                `+if (x > y)`,
                `+    result = x + y;`,
                `+else if (x <= y)`,
                `+    result = x - y;`,
                `+else`,
                `+    result = 0;`,
                `+`,
                `+for (let index = 0; index < result; index++) {`,
                `+    if (index % 2 === 0)`,
                `+        console.log(index);`,
                `+    else if (index % 3 === 0) {`,
                `+        if (result > 18) continue;`,
                `+        else if (result < 6) result += 2;`,
                `+        else break;`,
                `+    }`,
                `+}`
            ]
        });

        expect(result).toHaveLength(8);

        expect(result[0]).toHaveProperty('line', 3);

        expect(result[1]).toHaveProperty('start_line', 5);
        expect(result[1]).toHaveProperty('position', 6);

        expect(result[2]).toHaveProperty('start_line', 7);
        expect(result[2]).toHaveProperty('position', 8);

        expect(result[3]).toHaveProperty('start_line', 9);
        expect(result[3]).toHaveProperty('position', 10);

        expect(result[4]).toHaveProperty('start_line', 13);
        expect(result[4]).toHaveProperty('position', 14);

        expect(result[5]).toHaveProperty('line', 16);

        expect(result[6]).toHaveProperty('line', 17);

        expect(result[7]).toHaveProperty('line', 18);
    });

    it('returns empty array on valid single-line if/else if/else blocks (without curly braces)', () => {
        const singleLineBlockRule = new SingleLineBlockRule({
            ...validConfig,
            curlyBraces: false
        });

        const result = singleLineBlockRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
                `-const x = 3;`,
                `+const x = 4;`,
                `+const y = 5;`,
                `+if (x === y) result = x;`,
                `+`,
                `+if (x > y)`,
                `+    result = x + y;`,
                `+else if (x <= y)`,
                `+    result = x - y;`,
                `+else`,
                `+    result = 0;`,
                `+`,
                `+for (let index = 0; index < result; index++) {`,
                `+    if (index % 2 === 0)`,
                `+        console.log(index);`,
                `+    else if (index % 3 === 0) {`,
                `+        if (result > 18) continue;`,
                `+        else if (result < 6) result += 2;`,
                `+        else break;`,
                `+    }`,
                `+}`
            ]
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid single-line if/else if/else blocks (without curly braces)', () => {
        const singleLineBlockRule = new SingleLineBlockRule({
            ...validConfig,
            curlyBraces: false
        });

        const result = singleLineBlockRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
                `-const x = 3;`,
                `+const x = 4;`,
                `+const y = 5;`,
                `+if (x === y) { result = x; }`,
                `+`,
                `+if (x > y)`,
                `+{`,
                `+    result = x + y;`,
                `+}`,
                `+else if (x <= y)`,
                `+{`,
                `+    result = x - y;`,
                `+}`,
                `+else`,
                `+{`,
                `+    result = 0;`,
                `+}`,
                `+`,
                `+for (let index = 0; index < result; index++) {`,
                `+    if (index % 2 === 0) {`,
                `+        console.log(index);`,
                `+    } else if (index % 3 === 0) {`,
                `+        if (result > 18) { continue; }`,
                `+        else if (result < 6) { result += 2; }`,
                `+        else { break; }`,
                `+    }`,
                `+}`
            ]
        });

        expect(result).toHaveLength(8);

        expect(result[0]).toHaveProperty('line', 3);

        expect(result[1]).toHaveProperty('start_line', 5);
        expect(result[1]).toHaveProperty('position', 8);

        expect(result[2]).toHaveProperty('start_line', 9);
        expect(result[2]).toHaveProperty('position', 12);

        expect(result[3]).toHaveProperty('start_line', 13);
        expect(result[3]).toHaveProperty('position', 16);

        expect(result[4]).toHaveProperty('start_line', 19);
        expect(result[4]).toHaveProperty('position', 21);

        expect(result[5]).toHaveProperty('line', 22);

        expect(result[6]).toHaveProperty('line', 23);

        expect(result[7]).toHaveProperty('line', 24);
    });

    /**
     * ---------------------------------------------------
     * SINGLE-LINE BLOCKS WITH END INDICATOR (DO..WHILE)
     * ---------------------------------------------------
     */

    it('returns empty array on valid single-line do..while blocks (with curly braces)', () => {
        const result = singleLineBlockRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
                `-const x = 3;`,
                `+`,
                ` do result++; { while(result < 9999); }`,
                `+`,
                `+do {`,
                `-    result--;`,
                `+    result++;`,
                `+} while (result < 9999);`,
                `+`,
                `+do`,
                `+{`,
                `-    result--;`,
                `+    result++;`,
                `+}`,
                `+while (result < 9999);`,
                `+`,
                `-do { result--; }`,
                `+do { result++; }`,
                `+    while (result < 9999);`,
                `+`,
                `+if (result) {`,
                `+    this.increaseResultByValue(10);`,
                `+    do {`,
                `-        console.log('test123');`,
                `+        something();`,
                `+       }`,
                `+    while (result < 9999);`,
                `+}`,
                `+do {`,
                `+    console.log('1');`,
                `+}`,
                `+while (1);`,
                `+while (123 === 123) { break; }`,
                `+do { console.log('1');`,
                `+} while (1);`,
                `-`,
                `-do { console.log('test') } while (1);`
            ]
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid single-line do..while blocks (with curly braces)', () => {
        const result = singleLineBlockRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
                `-const x = 3;`,
                `+`,
                ` do result++; while(result < 9999);`,
                `+`,
                `+do`,
                `-    result--;`,
                `+    result++;`,
                `+while (result < 9999);`,
                `+`,
                `+do`,
                `-    result--;`,
                `+    result++;`,
                `+while (result < 9999);`,
                `+`,
                `-do result--;`,
                `+do result++;`,
                `+    while (result < 9999);`,
                `+`,
                `+if (result) {`,
                `+    this.increaseResultByValue(10);`,
                `+    do`,
                `-        console.log('test123');`,
                `+        something();`,
                `+    while (result < 9999);`,
                `+}`,
                `+do {`,
                `+    console.log('1');`,
                `+}`,
                `+while (1);`,
                `+while (123 === 123) { break; }`,
                `+do console.log('1');`,
                `+    while (1);`,
                `-`,
                `-do { console.log('test') } while (1);`
            ]
        });

        expect(result).toHaveLength(6);

        expect(result[0]).toHaveProperty('line', 2);

        expect(result[1]).toHaveProperty('start_line', 4);
        expect(result[1]).toHaveProperty('position', 6);

        expect(result[2]).toHaveProperty('start_line', 8);
        expect(result[2]).toHaveProperty('position', 10);

        expect(result[3]).toHaveProperty('start_line', 12);
        expect(result[3]).toHaveProperty('position', 13);

        expect(result[4]).toHaveProperty('start_line', 17);
        expect(result[4]).toHaveProperty('position', 19);

        expect(result[5]).toHaveProperty('start_line', 26);
        expect(result[5]).toHaveProperty('position', 27);
    });

    it('returns empty array on valid single-line do..while blocks (without curly braces)', () => {
        const singleLineBlockRule = new SingleLineBlockRule({
            ...validConfig,
            curlyBraces: false
        });

        const result = singleLineBlockRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
                `-const x = 3;`,
                `+`,
                ` do result++; while(result < 9999);`,
                `+`,
                `+do`,
                `-    result--;`,
                `+    result++;`,
                `+while (result < 9999);`,
                `+`,
                `+do`,
                `-    result--;`,
                `+    result++;`,
                `+while (result < 9999);`,
                `+`,
                `-do { result--; }`,
                `+do result++;`,
                `+    while (result < 9999);`,
                `+`,
                `+if (result) {`,
                `+    this.increaseResultByValue(10);`,
                `+    do`,
                `-        console.log('test123');`,
                `+        something();`,
                `+    while (result < 9999);`,
                `+}`,
                `+do`,
                `+    console.log('1');`,
                `+while (1);`,
                `+while (123 === 123) break;`,
                `+do console.log('1');`,
                `+    while (1);`,
                `-`,
                `-do { console.log('test') } while (1);`
            ]
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid single-line do..while blocks (without curly braces)', () => {
        const singleLineBlockRule = new SingleLineBlockRule({
            ...validConfig,
            curlyBraces: false
        });

        const result = singleLineBlockRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +1,7 @@`,
                `-const x = 3;`,
                `+`,
                ` do result++; { while(result < 9999); }`,
                `+`,
                `+do {`,
                `-    result--;`,
                `+    result++;`,
                `+} while (result < 9999);`,
                `+`,
                `+do`,
                `+{`,
                `-    result--;`,
                `+    result++;`,
                `+}`,
                `+while (result < 9999);`,
                `+`,
                `-do { result--; }`,
                `+do { result++; }`,
                `+    while (result < 9999);`,
                `+`,
                `+if (result) {`,
                `+    this.increaseResultByValue(10);`,
                `+    do {`,
                `-        console.log('test123');`,
                `+        something();`,
                `+       }`,
                `+    while (result < 9999);`,
                `+}`,
                `+do {`,
                `+    console.log('1');`,
                `+}`,
                `+while (1);`,
                `+while (123 === 123) break;`,
                `+do { console.log('1');`,
                `+} while (1);`,
                `-`,
                `-do { console.log('test') } while (1);`
            ]
        });

        expect(result).toHaveLength(7);

        expect(result[0]).toHaveProperty('line', 2);

        expect(result[1]).toHaveProperty('start_line', 4);
        expect(result[1]).toHaveProperty('position', 6);

        expect(result[2]).toHaveProperty('start_line', 8);
        expect(result[2]).toHaveProperty('position', 12);

        expect(result[3]).toHaveProperty('start_line', 14);
        expect(result[3]).toHaveProperty('position', 15);

        expect(result[4]).toHaveProperty('start_line', 19);
        expect(result[4]).toHaveProperty('position', 22);

        expect(result[5]).toHaveProperty('start_line', 24);
        expect(result[5]).toHaveProperty('position', 27);

        expect(result[6]).toHaveProperty('start_line', 29);
        expect(result[6]).toHaveProperty('position', 30);
    });
});
