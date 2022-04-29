const fs = require('fs');
const path = require('path');
const nock = require('nock');
const PepegaJs = require('../../..');
const { Probot, ProbotOctokit } = require('probot');
const { describe, expect, it, beforeEach } = require('@jest/globals');
const KeywordsOrderedByLengthRule = require('../../../pepega/rules/common/KeywordsOrderedByLength');

const importKeywordConfig = {
    name: 'import',
    regex: /import.*/,
    multilineOptions: ['from'],
    order: 'ascending',
    ignoreNewline: false
};

const validConfig = {
    keywords: [importKeywordConfig]
};

const privateKey = fs.readFileSync(
    path.join(__dirname, '../../fixtures/mock-cert.pem'),
    'utf-8'
);

describe('invoke function', () => {
    let probot;
    let keywordsOrderedByLengthRule;

    beforeEach(() => {
        nock.disableNetConnect();
        probot = new Probot({
            appId: 123,
            privateKey,
            Octokit: ProbotOctokit.defaults({
                retry: { enabled: false },
                throttle: { enabled: false }
            }),
            logLevel: 'fatal'
        });

        probot.load(PepegaJs);

        keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule(
            validConfig
        );
    });

    it('returns empty array on empty keywords', () => {
        keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule({
            keywords: []
        });

        const result = keywordsOrderedByLengthRule.invoke({
            filename: '...'
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid `import` group order', () => {
        const result = keywordsOrderedByLengthRule.invoke({
            filename: '...',
            split_patch: [
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
        });

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('start_line', 5);
        expect(result[0]).toHaveProperty('position', 4);
    });

    it('returns empty array on valid ascending `import` group order', () => {
        const result = keywordsOrderedByLengthRule.invoke({
            filename: '...',
            split_patch: [
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
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid ascending `import` groups order', () => {
        const result = keywordsOrderedByLengthRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,7 @@`,
                ` import dedent from 'dedent-js'`,
                `+import usersController from '../controllers/UsersController'`,
                `-import getLastNumber from '../helpers/getLastNumber'`,
                `+import socialMediaIconProvider from '../helpers/icons/socialMediaIconProvider'`,
                `+`,
                `+import staticFiles from '../../assets'`,
                `+import baseHelper from 'helpers/base'`
            ]
        });

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('start_line', 9);
        expect(result[0]).toHaveProperty('position', 6);
    });

    it('returns empty array on valid ascending `import` groups order', () => {
        const result = keywordsOrderedByLengthRule.invoke({
            filename: '...',
            split_patch: [
                `@@ -10,13 +5,7 @@`,
                ` import dedent from 'dedent-js'`,
                `+import getLastNumber from '../helpers/getLastNumber'`,
                `+import usersController from '../controllers/UsersController'`,
                `+import socialMediaIconProvider from '../helpers/icons/socialMediaIconProvider'`,
                `+`,
                `+import baseHelper from 'helpers/base'`,
                `+import staticFiles from '../../assets'`
            ]
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid descending `import` group order', () => {
        keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule({
            keywords: [
                {
                    ...importKeywordConfig,
                    order: 'descending'
                }
            ]
        });

        const result = keywordsOrderedByLengthRule.invoke({
            filename: '...',
            split_patch: [
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
        });

        expect(result).toHaveLength(1);

        expect(result[0]).toHaveProperty('start_line', 5);
        expect(result[0]).toHaveProperty('position', 4);
    });

    it('returns empty array on valid descending `import` group order', () => {
        keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule({
            keywords: [
                {
                    ...importKeywordConfig,
                    order: 'descending'
                }
            ]
        });

        const result = keywordsOrderedByLengthRule.invoke({
            filename: '...',
            split_patch: [
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
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid `import` order with ignoreNewline enabled', () => {
        keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule({
            keywords: [
                {
                    ...importKeywordConfig,
                    order: 'ascending',
                    ignoreNewline: true
                }
            ]
        });

        const result = keywordsOrderedByLengthRule.invoke({
            filename: '...',
            split_patch: [
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
        });

        expect(result).toHaveLength(4);

        expect(result[0]).toHaveProperty('line', 9);

        expect(result[1]).toHaveProperty('line', 10);

        expect(result[2]).toHaveProperty('line', 13);

        expect(result[3]).toHaveProperty('line', 15);
    });

    it('returns empty array on valid `import` order with ignoreNewline enabled', () => {
        keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule({
            keywords: [
                {
                    ...importKeywordConfig,
                    order: 'ascending',
                    ignoreNewline: true
                }
            ]
        });

        const result = keywordsOrderedByLengthRule.invoke({
            filename: '...',
            split_patch: [
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
        });

        expect(result).toEqual([]);
    });

    it('returns empty array on valid `import` order split into packages and components', () => {
        keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule({
            keywords: [
                {
                    name: 'import (packages)',
                    regex: /import(?!.*@).*/,
                    multilineOptions: ['from'],
                    order: 'ascending',
                    ignoreNewline: false
                },
                {
                    name: 'import (components)',
                    regex: /import.*@\/components.*/,
                    multilineOptions: ['from'],
                    order: 'ascending',
                    ignoreNewline: false
                }
            ]
        });

        const result = keywordsOrderedByLengthRule.invoke({
            filename: '...',
            split_patch: [
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
        });

        expect(result).toEqual([]);
    });

    it('returns review on invalid `import` order split into packages and components', () => {
        keywordsOrderedByLengthRule = new KeywordsOrderedByLengthRule({
            keywords: [
                {
                    name: 'import (packages)',
                    regex: /import(?!.*@).*/,
                    multilineOptions: ['from'],
                    order: 'ascending',
                    ignoreNewline: false
                },
                {
                    name: 'import (components)',
                    regex: /import.*@\/components.*/,
                    multilineOptions: ['from'],
                    order: 'ascending',
                    ignoreNewline: false
                }
            ]
        });

        const result = keywordsOrderedByLengthRule.invoke({
            filename: '...',
            split_patch: [
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
        });

        expect(result).toHaveLength(2);

        expect(result[0]).toHaveProperty('start_line', 5);
        expect(result[0]).toHaveProperty('position', 6);

        expect(result[1]).toHaveProperty('start_line', 12);
        expect(result[1]).toHaveProperty('position', 10);
    });
});
