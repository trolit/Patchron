const js = require('./jsRules');
const strictWorkflow = require('../rules/pull/StrictWorkflow');

require('dotenv').config({
    path: '../../.env',
});

module.exports = {
    env: {},
    settings: {
        isGetFilesRequestPaginated: false,
        delayBetweenCommentRequestsInSeconds: 3,
        isOwnerAssigningEnabled: true,
        isReviewSummaryEnabled: false,
        maxCommentsPerReview: 50,
        strictWorkflow: {
            enabled: false,
            abortReviewOnInvalidBranchPrefix: false,
            abortReviewOnInvalidFlow: true,
        },
    },
    rules: {
        pull: {
            strictWorkflow: new strictWorkflow({
                workflow: [
                    {
                        base: 'master',
                        head: 'release',
                    },
                    {
                        base: 'develop',
                        head: 'release',
                    },
                    {
                        base: 'develop',
                        head: 'feature',
                    },
                    {
                        base: 'master',
                        head: 'develop',
                    },
                    {
                        base: 'master',
                        head: 'hotfix',
                    },
                    {
                        base: 'develop',
                        head: 'hotfix',
                    },
                ],
            }),
        },
        files: {
            common: [],
            js,
        },
    },
};
