const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const setupPatchronContext = require('test/setupPatchronContext');
const initializeFile = require('test/rules/helpers/initializeFile');
const PositionedKeywordsRule = require('src/rules/v1/common/PositionedKeywords');

const importKeywordBaseConfig = {
    name: 'import',
    regex: /import.*(?:from|{)/,
    maxLineBreaks: 0,
    enforced: true,
    breakOnFirstOccurence: false,
    countDifferentCodeAsLineBreak: false,
    multiLineOptions: [
        {
            indicator: {
                notIncludes: 'from'
            },
            limiter: {
                startsWith: '} from'
            }
        }
    ],
    order: [
        {
            name: 'packages',
            regex: /from(?!.*[@,.]\/)/
        },
        {
            name: 'others',
            regex: /from.*[@,.]\//
        }
    ]
};

const importKeywordCustomConfig = {
    ...importKeywordBaseConfig,
    position: {
        BOF: false,
        custom: {
            name: '<script>',
            regex: '<script>'
        }
    }
};

const importKeywordBOFConfig = {
    ...importKeywordBaseConfig,
    position: {
        BOF: true,
        custom: null
    }
};

const requireKeywordConfig = (position, override = null) => {
    return {
        name: 'require',
        regex: /(.*require\(|^(const|let|var)(\s+)?{$)/,
        maxLineBreaks: 0,
        enforced: true,
        breakOnFirstOccurence: false,
        countDifferentCodeAsLineBreak: false,
        multiLineOptions: [
            {
                limiter: {
                    startsWith: '} = require'
                }
            }
        ],
        position,
        override
    };
};

const validConfig = {
    keywords: [importKeywordCustomConfig]
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

    it('returns empty array on empty keywords', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: []
            },
            file
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    /**
     * ---------------------------------------------------
     * CUSTOM POSITION
     * ---------------------------------------------------
     */

    it('returns empty array on missing custom position', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordCustomConfig,
                        enforced: false
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+<scwddwdwript>`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    `+`,
                    `+import method2 from '@/helpers/methods'`,
                    `+`,
                    `+import method3 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid custom positioning', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+<script>`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`,
                    `-`,
                    `-import method6 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid custom positioning (enforced)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `+<scrdwwddwdipt>`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`,
                    `-`,
                    `-import method6 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid custom positioning (maxLineBreaks = 2, countDifferentCodeAsLineBreak = true)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordCustomConfig,
                        maxLineBreaks: 2,
                        countDifferentCodeAsLineBreak: true
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+<script>`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    ` const x = 2;`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+const y = 3;`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`,
                    `-`,
                    `-import method6 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke({
            filename: '...'
        });

        expect(result).toEqual([]);
    });

    it('returns empty array on valid `import`custom positioning (second layer order)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordCustomConfig,
                        order: [
                            {
                                name: 'packages',
                                regex: /import(?!.*@).*/
                            },
                            {
                                name: 'components',
                                regex: /import.*@\/components.*/
                            }
                        ]
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+import uniq from 'lodash/uniq'`,
                    `+import {`,
                    `+    dedent,`,
                    `+    dedent2`,
                    `+} from 'dedent-js'`,
                    `+import { mapGetters } from 'vuex'`,
                    `+import Component1 from '@/components/Component1'`,
                    `+import Component12542 from '@/components/Component12542'`,
                    `+import Component3 from '@/components/Component3'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on only one order type of custom positioning (second layer order)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordCustomConfig,
                        order: [
                            {
                                name: 'packages',
                                regex: /import(?!.*@).*/
                            },
                            {
                                name: 'components',
                                regex: /import.*@\/components.*/
                            }
                        ]
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+import Component1 from '@/components/Component1'`,
                    `+import Component12542 from '@/components/Component12542'`,
                    `+import Component3 from '@/components/Component3'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid custom positioning (maxLineBreaks = 0)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+<script>`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    ` `,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`,
                    `-`,
                    `-import method6 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('start_line', 6);
        expect(result[0]).toHaveProperty('line', 11);

        expect(result[1]).toHaveProperty('start_line', 15);
        expect(result[1]).toHaveProperty('line', 17);
    });

    it('returns review on invalid custom positioning (enforced, maxLineBreaks = 0)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+<scridwdwwdpt>`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    ` const x = 2;`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+const y = 3;`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`,
                    `-`,
                    `-import method6 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('start_line', 6);
        expect(result[0]).toHaveProperty('line', 11);

        expect(result[1]).toHaveProperty('start_line', 15);
        expect(result[1]).toHaveProperty('line', 17);
    });

    it('returns review on invalid custom positioning (maxLineBreaks = 2, countDifferentCodeAsLineBreak = false)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordCustomConfig,
                        maxLineBreaks: 2
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+<script>`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    ` const x = 2;`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+const y = 3;`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`,
                    `-`,
                    `-import method6 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('start_line', 6);
        expect(result[0]).toHaveProperty('line', 11);

        expect(result[1]).toHaveProperty('start_line', 15);
        expect(result[1]).toHaveProperty('line', 17);
    });

    it('returns review on invalid `import` custom positioning (second layer order)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordCustomConfig,
                        order: [
                            {
                                name: 'packages',
                                regex: /import(?!.*@).*/
                            },
                            {
                                name: 'components',
                                regex: /import.*@\/components.*/
                            }
                        ]
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+import uniq from 'lodash/uniq'`,
                    `+import {`,
                    `+    dedent,`,
                    `+    dedent2`,
                    `+} from 'dedent-js'`,
                    `+import Component3 from '@/components/Component3'`,
                    `+import { mapGetters } from 'vuex'`,
                    `+import Component1 from '@/components/Component1'`,
                    `+import Component12542 from '@/components/Component12542'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 11);
    });

    it('returns single comment on invalid custom positioning (breakOnFirstOccurence)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordCustomConfig,
                        breakOnFirstOccurence: true
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+<script>`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    ` const x = 2;`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+const y = 3;`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`,
                    `-`,
                    `-import method6 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('start_line', 6);
        expect(result[0]).toHaveProperty('line', 11);
    });

    /**
     * ---------------------------------------------------
     * BOF
     * ---------------------------------------------------
     */

    it('returns empty array on missing BOF position', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordBOFConfig,
                        enforced: false
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+<scwddwdwript>`,
                    `+import method1 from '@/helpers/methods`,
                    `-`,
                    `+`,
                    `+import method2 from '@/helpers/methods'`,
                    `+`,
                    `+import method3 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid BOF positioning', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [importKeywordBOFConfig]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`,
                    `-`,
                    `-import method6 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid BOF positioning (enforced)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [importKeywordBOFConfig]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +4,7 @@`,
                    `+<scrdwwddwdipt>`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`,
                    `-`,
                    `-import method6 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid BOF positioning (maxLineBreaks = 2, countDifferentCodeAsLineBreak = true)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordBOFConfig,
                        maxLineBreaks: 2,
                        countDifferentCodeAsLineBreak: true
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    ` const x = 2;`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+const y = 3;`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`,
                    `-`,
                    `-import method6 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid `import` BOF positioning (second layer order)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordBOFConfig,
                        order: [
                            {
                                name: 'packages',
                                regex: /import(?!.*@).*/
                            },
                            {
                                name: 'components',
                                regex: /import.*@\/components.*/
                            }
                        ]
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `+import uniq from 'lodash/uniq'`,
                    `+import {`,
                    `+    dedent,`,
                    `+    dedent2`,
                    `+} from 'dedent-js'`,
                    `+import { mapGetters } from 'vuex'`,
                    `+import Component1 from '@/components/Component1'`,
                    `+import Component12542 from '@/components/Component12542'`,
                    `+import Component3 from '@/components/Component3'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on only one order type of BOF positioning (second layer order)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordBOFConfig,
                        order: [
                            {
                                name: 'packages',
                                regex: /import(?!.*@).*/
                            },
                            {
                                name: 'components',
                                regex: /import.*@\/components.*/
                            }
                        ]
                    }
                ]
            },
            {
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `+import Component3 from '@/components/Component3'`,
                    `+import Component1 from '@/components/Component1'`,
                    `+import Component12542 from '@/components/Component12542'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid BOF position', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordBOFConfig,
                        maxLineBreaks: 2,
                        countDifferentCodeAsLineBreak: true
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `const abc = 5;`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    ` const x = 2;`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+const y = 3;`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`,
                    `-`,
                    `-import method6 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 1);
    });

    it('returns review on invalid BOF positioning (maxLineBreaks = 0)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [importKeywordBOFConfig]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    ` `,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`,
                    `-`,
                    `-import method6 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('start_line', 1);
        expect(result[0]).toHaveProperty('line', 6);

        expect(result[1]).toHaveProperty('start_line', 10);
        expect(result[1]).toHaveProperty('line', 12);
    });

    it('returns review on invalid BOF positioning (enforced, maxLineBreaks = 0)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [importKeywordBOFConfig]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+const a = 2;`,
                    `+const b = 6;`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    `const x = 2;`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+const y = 3;`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`,
                    `-`,
                    `-import method6 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('start_line', 7);
        expect(result[0]).toHaveProperty('line', 12);

        expect(result[1]).toHaveProperty('start_line', 16);
        expect(result[1]).toHaveProperty('line', 18);
    });

    it('returns review on invalid BOF positioning (maxLineBreaks = 2, countDifferentCodeAsLineBreak = false)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordBOFConfig,
                        maxLineBreaks: 2
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+const a = 2;`,
                    `+const b = 6;`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    ` const x = 2;`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+const y = 3;`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`,
                    `-`,
                    `-import method6 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('start_line', 7);
        expect(result[0]).toHaveProperty('line', 12);

        expect(result[1]).toHaveProperty('start_line', 16);
        expect(result[1]).toHaveProperty('line', 18);
    });

    it('returns empty array on valid BOF positioning (two BOF keywords)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    importKeywordBOFConfig,
                    requireKeywordConfig({ custom: null, BOF: true })
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,17 @@`,
                    `+const gamma = require('...')`,
                    `+const beta = require('...');`,
                    `+const alpha = require('...');`,
                    `+`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `import` BOF positioning (two BOF keywords)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    importKeywordBOFConfig,
                    requireKeywordConfig({ custom: null, BOF: true })
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,19 @@`,
                    `+const gamma = require('...')`,
                    `+const beta = require('...');`,
                    `+const alpha = require('...');`,
                    `+const b = () => { ... }`,
                    `+const a = () => { ... }`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 4);
    });

    it('returns review on invalid `import` BOF positioning (second layer order)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordBOFConfig,
                        order: [
                            {
                                name: 'packages',
                                regex: /import(?!.*@).*/
                            },
                            {
                                name: 'components',
                                regex: /import.*@\/components.*/
                            }
                        ]
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    `+import uniq from 'lodash/uniq'`,
                    `+import {`,
                    `+    dedent,`,
                    `+    dedent2`,
                    `+} from 'dedent-js'`,
                    `+import Component3 from '@/components/Component3'`,
                    `+import { mapGetters } from 'vuex'`,
                    `+import Component1 from '@/components/Component1'`,
                    `+import Component12542 from '@/components/Component12542'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 7);
    });

    it('returns single comment on invalid BOF positioning (breakOnFirstOccurence)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordBOFConfig,
                        breakOnFirstOccurence: true
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,7 @@`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    ` const x = 2;`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+const y = 3;`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`,
                    `-`,
                    `-import method6 from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('start_line', 1);
        expect(result[0]).toHaveProperty('line', 6);
    });

    it('returns single comment on invalid `import` and `const` BOF positioning (two BOF keywords)', () => {
        const positionedKeywordsRule = new PositionedKeywordsRule(
            patchronContext,
            {
                keywords: [
                    importKeywordBOFConfig,
                    requireKeywordConfig({ custom: null, BOF: true })
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +1,19 @@`,
                    `+kappa`,
                    `+const gamma = require('...')`,
                    `+const beta = require('...');`,
                    `+const alpha = require('...');`,
                    `+const b = () => { ... }`,
                    `+const a = () => { ... }`,
                    ` import {`,
                    `     method4,`,
                    `     method5,`,
                    ` } from '@/helpers/methods'`,
                    `+import method1 from '@/helpers/methods'`,
                    `-`,
                    ` import {`,
                    `     method24,`,
                    ` } from '@/helpers/methods'`,
                    `+import method2 from '@/helpers/methods'`,
                    `+import method3 from '@/helpers/methods'`,
                    ` import {`,
                    `     method34,`,
                    ` } from '@/helpers/methods'`
                ]
            }
        );

        const result = positionedKeywordsRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('line', 1);
    });
});
