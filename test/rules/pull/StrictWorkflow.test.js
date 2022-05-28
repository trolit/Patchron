const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    pull: { StrictWorkflowRule }
} = require('src/rules');
const setupApp = require('test/rules/helpers/setupApp');
const instantiateProbotContext = require('test/rules/helpers/instantiateProbotContext');

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
    let pepegaContext = null;

    beforeEach(() => {
        pepegaContext = setupApp();
    });

    afterEach(() => {
        nock.cleanAll();

        nock.enableNetConnect();
    });

    it('returns null when rule workflow is empty', () => {
        const strictWorkflowRule = new StrictWorkflowRule(
            pepegaContext,
            {
                ...validConfig,
                workflow: []
            },
            null
        );

        const result = strictWorkflowRule.invoke();

        expect(result).toEqual(null);
    });

    it('returns null when workflow is valid', () => {
        instantiateProbotContext(pepegaContext, {
            payload: {
                pull_request: {
                    head: {
                        ref: 'feature/do-something-1'
                    },
                    base: {
                        ref: 'develop'
                    }
                }
            }
        });

        const strictWorkflowRule = new StrictWorkflowRule(
            pepegaContext,
            validConfig,
            null
        );

        const result = strictWorkflowRule.invoke();

        expect(result).toEqual(null);
    });

    it('returns object when flow is invalid (wrong head prefix)', () => {
        instantiateProbotContext(pepegaContext, {
            payload: {
                pull_request: {
                    head: {
                        ref: 'not/do-something-1'
                    },
                    base: {
                        ref: 'develop'
                    }
                }
            }
        });

        const strictWorkflowRule = new StrictWorkflowRule(
            pepegaContext,
            validConfig,
            null
        );

        const result = strictWorkflowRule.invoke();

        expect(result).toHaveProperty('body');
    });

    it('returns object when flow is invalid (valid head prefix)', () => {
        instantiateProbotContext(pepegaContext, {
            payload: {
                pull_request: {
                    head: {
                        ref: 'feature/do-something-1'
                    },
                    base: {
                        ref: 'master'
                    }
                }
            }
        });

        const strictWorkflowRule = new StrictWorkflowRule(
            pepegaContext,
            validConfig,
            null
        );

        const result = strictWorkflowRule.invoke();

        expect(result).toHaveProperty('body');
    });
});
