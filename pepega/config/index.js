const js = require('./jsRules');
const vue = require('./vueRules');
const strictWorkflow = require('../rules/pull/StrictWorkflow');

require('dotenv').config({
    path: '../../.env',
});

module.exports = {
    env: {},
    settings: {
        isGetFilesRequestPaginated: false,
        delayBetweenCommentRequestsInSeconds: 3,
        isOwnerAssigningEnabled: false,
        isReviewSummaryEnabled: false,
        maxCommentsPerReview: 50,
        senders: [],
        // TODO: move these to rule?
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
            // TODO: applied across all files
            common: [],
            js,
            vue,
        },
    },
};
