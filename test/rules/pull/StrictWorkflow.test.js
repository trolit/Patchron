const { describe, expect, it, beforeEach } = require('@jest/globals');
const StrictWorkflowRule = require('../../../pepega/rules/pull/StrictWorkflow');

const validConfig = {
    enabled: true,
    workflow: [
        {
            base: 'master',
            head: 'release'
        },
        {
            base: 'develop',
            head: 'release'
        },
        {
            base: 'develop',
            head: 'feature'
        },
        {
            base: 'master',
            head: 'develop'
        },
        {
            base: 'master',
            head: 'hotfix'
        },
        {
            base: 'develop',
            head: 'hotfix'
        }
    ],
    abortReviewOnInvalidBranchPrefix: true,
    abortReviewOnInvalidFlow: true
};

describe('invoke function', () => {
    let strictWorkflowRule;

    beforeEach(() => {
        strictWorkflowRule = new StrictWorkflowRule(validConfig);
    });

    it('returns null when rule is not enabled', () => {
        strictWorkflowRule = new StrictWorkflowRule({
            ...validConfig,
            enabled: false
        });

        const result = strictWorkflowRule.invoke({
            filename: '...'
        });

        expect(result).toEqual(null);
    });

    it('returns null when rule workflow is empty', () => {
        strictWorkflowRule = new StrictWorkflowRule({
            ...validConfig,
            workflow: []
        });

        const result = strictWorkflowRule.invoke({
            filename: '...'
        });

        expect(result).toEqual(null);
    });

    it('returns null when workflow is valid', () => {
        const result = strictWorkflowRule.invoke({
            pull_request: {
                head: {
                    ref: 'feature/do-something-1'
                },
                base: {
                    ref: 'develop'
                }
            }
        });

        expect(result).toEqual(null);
    });

    it('returns object when flow is invalid (wrong head prefix)', () => {
        const result = strictWorkflowRule.invoke({
            pull_request: {
                head: {
                    ref: 'not/do-something-1'
                },
                base: {
                    ref: 'develop'
                }
            }
        });

        expect(result).toHaveProperty('body');
    });

    it('returns object when flow is invalid (valid head prefix)', () => {
        const result = strictWorkflowRule.invoke({
            pull_request: {
                head: {
                    ref: 'feature/do-something-1'
                },
                base: {
                    ref: 'master'
                }
            }
        });

        expect(result).toHaveProperty('body');
    });
});
