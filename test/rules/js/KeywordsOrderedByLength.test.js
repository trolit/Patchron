const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    common: { KeywordsOrderedByLengthRule }
} = require('src/rules');
const setupPatchronContext = require('test/setupPatchronContext');
const initializeFile = require('test/rules/helpers/initializeFile');

const importKeywordConfig = {
    name: 'import',
    regex: /import.*/,
    order: 'ascending',
    ignoreNewline: false,
    multiLineOptions: [
        {
            indicator: {
                notIncludes: 'from'
            },
            limiter: {
                startsWith: '} = from'
            }
        }
    ]
};

const importPackageKeywordConfig = {
    name: 'import (packages)',
    regex: /import(?!.*@).*/,
    order: 'ascending',
    ignoreNewline: false,
    multiLineOptions: [
        {
            indicator: {
                notIncludes: 'from'
            },
            limiter: {
                startsWith: '} = from'
            }
        }
    ]
};

const importComponentKeywordConfig = {
    name: 'import (components)',
    regex: /import.*@\/components.*/,
    order: 'ascending',
    ignoreNewline: false,
    multiLineOptions: [
        {
            indicator: {
                notIncludes: 'from'
            },
            limiter: {
                startsWith: '} = from'
            }
        }
    ]
};

const validConfig = {
    keywords: [importKeywordConfig]
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
        const keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule(
            patchronContext,
            {
                keywords: []
            },
            file
        );

        const result = keywordsOrderedByLengthRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid ascending `import` group order', () => {
        const keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    ` import dedent from 'dedent-js'`,
                    `+import getLastNumber from '../helpers/getLastNumber'`,
                    `+import usersController from '../controllers/UsersController'`,
                    `+import socialMediaIconProvider from '../helpers/icons/socialMediaIconProvider'`,
                    `+`,
                    `+import baseHelper from 'helpers/base'`,
                    `+`,
                    `+import staticFiles from '../../assets'`
                ]
            }
        );

        const result = keywordsOrderedByLengthRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `import` group order', () => {
        const keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+import getLastNumber from '../helpers/getLastNumber'`,
                    `+import usersController from '../controllers/UsersController'`,
                    ` import dedent from 'dedent-js'`,
                    `+import socialMediaIconProvider from '../helpers/icons/socialMediaIconProvider'`,
                    `+`,
                    `+import baseHelper from 'helpers/base'`,
                    `+`,
                    `+import staticFiles from '../../assets'`
                ]
            }
        );

        const result = keywordsOrderedByLengthRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('start_line', 5);
        expect(result[0]).toHaveProperty('line', 8);
    });

    it('returns empty array on valid ascending `import` groups order', () => {
        const keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    ` import dedent from 'dedent-js'`,
                    `+import getLastNumber from '../helpers/getLastNumber'`,
                    `+import usersController from '../controllers/UsersController'`,
                    `+import socialMediaIconProvider from '../helpers/icons/socialMediaIconProvider'`,
                    `+`,
                    `+import baseHelper from 'helpers/base'`,
                    `+import staticFiles from '../../assets'`
                ]
            }
        );

        const result = keywordsOrderedByLengthRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid ascending `import` groups order', () => {
        const keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule(
            patchronContext,
            validConfig,
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    ` import dedent from 'dedent-js'`,
                    `+import usersController from '../controllers/UsersController'`,
                    `-import getLastNumber from '../helpers/getLastNumber'`,
                    `+import socialMediaIconProvider from '../helpers/icons/socialMediaIconProvider'`,
                    `+`,
                    `+import staticFiles from '../../assets'`,
                    `+import baseHelper from 'helpers/base'`
                ]
            }
        );

        const result = keywordsOrderedByLengthRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('start_line', 9);
        expect(result[0]).toHaveProperty('line', 10);
    });

    it('returns empty array on valid descending `import` group order', () => {
        const keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordConfig,
                        order: 'descending'
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+import socialMediaIconProvider from '../helpers/icons/socialMediaIconProvider'`,
                    `+import usersController from '../controllers/UsersController'`,
                    `+import getLastNumber from '../helpers/getLastNumber'`,
                    `+import {`,
                    `+    dedent,`,
                    `+    dedent2`,
                    `+} from 'dedent-js'`,
                    `+`,
                    `+import baseHelper from 'helpers/base'`,
                    `+`,
                    `+import staticFiles from '../../assets'`
                ]
            }
        );

        const result = keywordsOrderedByLengthRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid descending `import` group order', () => {
        const keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordConfig,
                        order: 'descending'
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+import usersController from '../controllers/UsersController'`,
                    `+import socialMediaIconProvider from '../helpers/icons/socialMediaIconProvider'`,
                    ` import dedent from 'dedent-js'`,
                    `+import getLastNumber from '../helpers/getLastNumber'`,
                    `+`,
                    `+import baseHelper from 'helpers/base'`,
                    `+`,
                    `+import staticFiles from '../../assets'`
                ]
            }
        );

        const result = keywordsOrderedByLengthRule.invoke();

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('start_line', 5);
        expect(result[0]).toHaveProperty('line', 8);
    });

    it('returns empty array on valid `import` order with ignoreNewline enabled', () => {
        const keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordConfig,
                        order: 'ascending',
                        ignoreNewline: true
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+import {`,
                    `+    dedent,`,
                    `+    dedent2`,
                    `+} from 'dedent-js'`,
                    `+import baseHelper from 'helpers/base'`,
                    `+import staticFiles from '../../assets'`,
                    `+import getLastNumber from '../helpers/getLastNumber'`,
                    `+import usersController from '../controllers/UsersController'`,
                    `+import socialMediaIconProvider from '../helpers/icons/socialMediaIconProvider'`
                ]
            }
        );

        const result = keywordsOrderedByLengthRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `import` order with ignoreNewline enabled', () => {
        const keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule(
            patchronContext,
            {
                keywords: [
                    {
                        ...importKeywordConfig,
                        order: 'ascending',
                        ignoreNewline: true
                    }
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+import {`,
                    `+    dedent,`,
                    `+    dedent2`,
                    `+} from 'dedent-js'`,
                    `+import socialMediaIconProvider from '../helpers/icons/socialMediaIconProvider'`,
                    `+import usersController from '../controllers/UsersController'`,
                    `+import getLastNumber from '../helpers/getLastNumber'`,
                    `+`,
                    `+import baseHelper from 'helpers/base'`,
                    `+`,
                    `+import staticFiles from '../../assets'`
                ]
            }
        );

        const result = keywordsOrderedByLengthRule.invoke();

        expect(result).toHaveLength(4);

        expect(result[0]).toHaveProperty('line', 9);

        expect(result[1]).toHaveProperty('line', 10);

        expect(result[2]).toHaveProperty('line', 13);

        expect(result[3]).toHaveProperty('line', 15);
    });

    it('returns empty array on valid `import` order split into packages and components', () => {
        const keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule(
            patchronContext,
            {
                keywords: [
                    importPackageKeywordConfig,
                    importComponentKeywordConfig
                ]
            },
            {
                ...file,
                splitPatch: [
                    `@@ -10,13 +5,7 @@`,
                    `+import {`,
                    `+    dedent,`,
                    `+    dedent2`,
                    `+} from 'dedent-js'`,
                    `+import uniq from 'lodash/uniq'`,
                    `+import { mapGetters } from 'vuex'`,
                    `+`,
                    `+import Component1 from '@/components/Component1'`,
                    `+import Component2 from '@/components/Component2'`,
                    `+import Component3 from '@/components/Component3'`
                ]
            }
        );

        const result = keywordsOrderedByLengthRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid `import` order split into packages and components', () => {
        const keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule(
            patchronContext,
            {
                keywords: [
                    importPackageKeywordConfig,
                    importComponentKeywordConfig
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
                    `+`,
                    `+import Component1 from '@/components/Component1'`,
                    `+import Component12542 from '@/components/Component12542'`,
                    `+import Component3 from '@/components/Component3'`
                ]
            }
        );

        const result = keywordsOrderedByLengthRule.invoke();

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('start_line', 5);
        expect(result[0]).toHaveProperty('line', 10);

        expect(result[1]).toHaveProperty('start_line', 12);
        expect(result[1]).toHaveProperty('line', 14);
    });
});
