const fs = require('fs');
const path = require('path');
const nock = require('nock');
const PepegaJs = require('../../..');
const { Probot, ProbotOctokit } = require('probot');
const { describe, expect, it, beforeEach } = require('@jest/globals');
const NoUnmarkedCommentsRule = require('../../../pepega/rules/common/NoUnmarkedComments');

const validConfig = {
    prefixes: [
        {
            value: 'TODO:',
            meaning: 'needs to be implemented',
        },
        {
            value: '*:',
            meaning: 'important note',
        },
        {
            value: '!:',
            meaning: 'to be removed',
        },
        {
            value: '?:',
            meaning: 'suggestion',
        },
        {
            value: 'TMP:',
            meaning: 'temporary solution',
        },
    ],
    isAppliedToSingleLineComments: true,
    isAppliedToMultiLineComments: true,
    isAppliedToInlineComments: true,
};

const privateKey = fs.readFileSync(
    path.join(__dirname, '../../fixtures/mock-cert.pem'),
    'utf-8'
);

describe('invoke function', () => {
    let probot;
    let noUnmarkedCommentsRule;

    beforeEach(() => {
        nock.disableNetConnect();
        probot = new Probot({
            appId: 123,
            privateKey,
            Octokit: ProbotOctokit.defaults({
                retry: { enabled: false },
                throttle: { enabled: false },
            }),
            logLevel: 'fatal',
        });

        probot.load(PepegaJs);

        noUnmarkedCommentsRule = new NoUnmarkedCommentsRule(validConfig);
    });

    it('returns empty array on invalid flags config', () => {
        noUnmarkedCommentsRule = new NoUnmarkedCommentsRule({
            ...validConfig,
            isAppliedToSingleLineComments: false,
            isAppliedToMultiLineComments: false,
            isAppliedToInlineComments: false,
        });

        const result = noUnmarkedCommentsRule.invoke({
            filename: '...',
        });

        expect(result).toEqual([]);
    });
});
