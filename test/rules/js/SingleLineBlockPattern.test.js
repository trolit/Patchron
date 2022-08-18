const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    common: { SingleLineBlockPatternRule }
} = require('src/rules');
const setupPatchronContext = require('test/setupPatchronContext');
const initializeFile = require('test/rules/helpers/initializeFile');

const validConfig = {
    blocks: [
        {
            name: 'for',
            regex: /for.*\(.*\)/,
            countAsSingleLineBlockWhenNoBraces: true
        },
        {
            name: 'for',
            regex: /^for(\s)+\($/,
            multiLineOptions: [
                {
                    limiter: {
                        startsWith: ')',
                        indentation: 'le-indicator'
                    }
                }
            ]
        },
        {
            name: 'do..while',
            regex: /^[\s]*(?:do).*/,
            multiLineOptions: [
                {
                    limiter: {
                        includes: 'while',
                        indentation: 'le-indicator',
                        testInIndicator: true
                    }
                }
            ]
        },
        {
            name: 'if',
            regex: /if.*\(.*\)/,
            countAsSingleLineBlockWhenNoBraces: true
        },
        {
            name: 'if',
            regex: /^if(\s)+\($/,
            multiLineOptions: [
                {
                    limiter: {
                        startsWith: ')',
                        indentation: 'le-indicator'
                    }
                }
            ]
        },
        {
            name: 'else if',
            regex: /(?:else if).*\(.*\)/,
            countAsSingleLineBlockWhenNoBraces: true
        },
        {
            name: 'else if',
            regex: /^(?:else if)(\s)+\($/,
            multiLineOptions: [
                {
                    limiter: {
                        startsWith: ')',
                        indentation: 'le-indicator'
                    }
                }
            ]
        },
        {
            name: 'else',
            regex: /^else.*/,
            countAsSingleLineBlockWhenNoBraces: true
        },
        {
            name: 'while',
            regex: /while.*\(.*\)/,
            countAsSingleLineBlockWhenNoBraces: true
        },
        {
            name: 'while',
            regex: /^while(\s)+\($/,
            multiLineOptions: [
                {
                    limiter: {
                        startsWith: ')',
                        indentation: 'le-indicator'
                    }
                }
            ]
        }
    ],
    curlyBraces: true
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

    it('returns empty array on invalid blocks config', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            {
                blocks: [],
                curlyBraces: false
            },
            file
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toEqual([]);
    });

    /**
     * ---------------------------------------------------
     * SINGLE-LINE IF/ELSE IF/ELSE BLOCKS
     * ---------------------------------------------------
     */

    it('returns empty array on valid single-line if/else if/else blocks (with curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
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
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid single-line if/else if/else blocks (with curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
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
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toHaveLength(8);

        expect(result[0]).toHaveProperty('line', 3);

        expect(result[1]).toHaveProperty('line', 5);

        expect(result[2]).toHaveProperty('line', 7);

        expect(result[3]).toHaveProperty('line', 9);

        expect(result[4]).toHaveProperty('line', 13);

        expect(result[5]).toHaveProperty('line', 16);

        expect(result[6]).toHaveProperty('line', 17);

        expect(result[7]).toHaveProperty('line', 18);
    });

    it('returns empty array on valid nested single-line if block (with curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `+for (let index = 0; index < result; index++) {`,
                    `+    if (1) {`,
                    `+        if (2) {`,
                    `+            if (3) {`,
                    `+                console.log('abc');`,
                    `+            }`,
                    `+        }`,
                    `+    }`,
                    `+}`
                ]
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid nested single-line if block (with curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `+for (let index = 0; index < result; index++) {`,
                    `+    if (1) {`,
                    `+        if (2) {`,
                    `+            if (3)`,
                    `+                console.log('abc');`,
                    `+        }`,
                    `+    }`,
                    `+}`
                ]
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 4);
    });

    it('returns empty array on valid single-line if/else if/else blocks (without curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            {
                ...validConfig,
                curlyBraces: false
            },
            {
                ...file,
                splitPatch: [
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
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid single-line if/else if/else blocks (without curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            {
                ...validConfig,
                curlyBraces: false
            },
            {
                ...file,
                splitPatch: [
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
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toHaveLength(8);

        expect(result[0]).toHaveProperty('line', 3);

        expect(result[1]).toHaveProperty('start_line', 5);
        expect(result[1]).toHaveProperty('line', 8);

        expect(result[2]).toHaveProperty('start_line', 9);
        expect(result[2]).toHaveProperty('line', 12);

        expect(result[3]).toHaveProperty('start_line', 13);
        expect(result[3]).toHaveProperty('line', 16);

        expect(result[4]).toHaveProperty('start_line', 19);
        expect(result[4]).toHaveProperty('line', 21);

        expect(result[5]).toHaveProperty('line', 22);

        expect(result[6]).toHaveProperty('line', 23);

        expect(result[7]).toHaveProperty('line', 24);
    });

    it('returns empty array on valid nested single-line if block (without curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            {
                ...validConfig,
                curlyBraces: false
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `+for (let index = 0; index < result; index++) {`,
                    `+    if (1) {`,
                    `+        if (2) {`,
                    `+            if (3)`,
                    `+                console.log('abc');`,
                    `+        }`,
                    `+    }`,
                    `+}`
                ]
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid nested single-line if block (without curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            {
                ...validConfig,
                curlyBraces: false
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `+for (let index = 0; index < result; index++) {`,
                    `+    if (1) {`,
                    `+        if (2) {`,
                    `+            if (3) {`,
                    `+                console.log('abc');`,
                    `+            }`,
                    `+        }`,
                    `+    }`,
                    `+}`
                ]
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('start_line', 4);
        expect(result[0]).toHaveProperty('line', 6);
    });

    /**
     * ---------------------------------------------------
     * SINGLE-LINE BLOCKS WITH END INDICATOR (DO..WHILE)
     * ---------------------------------------------------
     */

    it('returns empty array on valid single-line do..while blocks (with curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
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
                    `+while (result < 9999);`,
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
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid single-line do..while blocks (with curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
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
                    `+while (result < 9999);`,
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
                    `+while (1);`,
                    `-`,
                    `-do { console.log('test') } while (1);`
                ]
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toHaveLength(6);

        expect(result[0]).toHaveProperty('line', 2);

        expect(result[1]).toHaveProperty('start_line', 4);
        expect(result[1]).toHaveProperty('line', 6);

        expect(result[2]).toHaveProperty('start_line', 8);
        expect(result[2]).toHaveProperty('line', 10);

        expect(result[3]).toHaveProperty('start_line', 12);
        expect(result[3]).toHaveProperty('line', 13);

        expect(result[4]).toHaveProperty('start_line', 17);
        expect(result[4]).toHaveProperty('line', 19);

        expect(result[5]).toHaveProperty('start_line', 26);
        expect(result[5]).toHaveProperty('line', 27);
    });

    it('returns empty array on valid nested single-line do..while block (with curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `+do {`,
                    `+    do`,
                    `+    {`,
                    `+        do {`,
                    `+            console.log('abc');`,
                    `+        } while(3);`,
                    `+    } while(2);`,
                    `+} while (1);`
                ]
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid nested single-line do..while block (with curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `+do {`,
                    `+    do`,
                    `+    {`,
                    `+        do`,
                    `+            console.log('abc');`,
                    `+        while(3);`,
                    `+    } while(2);`,
                    `+} while (1);`
                ]
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('start_line', 4);
        expect(result[0]).toHaveProperty('line', 6);
    });

    it('returns empty array on valid single-line do..while blocks (without curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            {
                ...validConfig,
                curlyBraces: false
            },
            {
                ...file,
                splitPatch: [
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
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid single-line do..while blocks (without curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            {
                ...validConfig,
                curlyBraces: false
            },
            {
                ...file,
                splitPatch: [
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
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toHaveLength(7);

        expect(result[0]).toHaveProperty('line', 2);

        expect(result[1]).toHaveProperty('start_line', 4);
        expect(result[1]).toHaveProperty('line', 6);

        expect(result[2]).toHaveProperty('start_line', 8);
        expect(result[2]).toHaveProperty('line', 12);

        expect(result[3]).toHaveProperty('start_line', 14);
        expect(result[3]).toHaveProperty('line', 15);

        expect(result[4]).toHaveProperty('start_line', 19);
        expect(result[4]).toHaveProperty('line', 22);

        expect(result[5]).toHaveProperty('start_line', 24);
        expect(result[5]).toHaveProperty('line', 27);

        expect(result[6]).toHaveProperty('start_line', 29);
        expect(result[6]).toHaveProperty('line', 30);
    });

    it('returns empty array on valid nested single-line do..while block (without curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            {
                ...validConfig,
                curlyBraces: false
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `+do {`,
                    `+    do`,
                    `+    {`,
                    `+        do`,
                    `+            console.log('abc');`,
                    `+        while(3);`,
                    `+    } while(2);`,
                    `+} while (1);`
                ]
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid nested single-line do..while block (without curly braces)', () => {
        const singleLineBlockPatternRule = new SingleLineBlockPatternRule(
            patchronContext,
            {
                ...validConfig,
                curlyBraces: false
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `+do {`,
                    `+    do`,
                    `+    {`,
                    `+        do {`,
                    `+            console.log('abc');`,
                    `+        } while(3);`,
                    `+    } while(2);`,
                    `+} while (1);`
                ]
            }
        );

        const result = singleLineBlockPatternRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('start_line', 4);
        expect(result[0]).toHaveProperty('line', 6);
    });
});
