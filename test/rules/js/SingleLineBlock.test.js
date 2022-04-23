const fs = require('fs');
const path = require('path');
const nock = require('nock');
const PepegaJs = require('../../..');
const { Probot, ProbotOctokit } = require('probot');
const { describe, expect, it, beforeEach } = require('@jest/globals');
const SingleLineBlockRule = require('../../../pepega/rules/common/SingleLineBlock');

const validConfig = {
    blocks: [
        {
            name: 'if',
            expression: /^[\s]*(?:if).*[(].*[)].*/
        },
        {
            name: 'else',
            expression: /^(?:[{].*(?:else)).*|^(?:else).*/
        },
        {
            name: 'else if',
            expression: /^[{]?[\s]*(?:else if).*[(].*[)].*/
        },
        {
            name: 'for',
            expression: /^[\s]*(?:for).*[(].*[)].*/
        },
        {
            name: 'do..while',
            expression: /^[\s]*(?:do).*/,
            endIndicator: /^while/
        },
        {
            name: 'while',
            expression: /^[\s]*(?:while).*[(].*[)].*/
        }
    ],
    curlyBraces: true
};

const privateKey = fs.readFileSync(
    path.join(__dirname, '../../fixtures/mock-cert.pem'),
    'utf-8'
);

describe('invoke function', () => {
    let probot;
    let singleLineBlockRule;

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
});
