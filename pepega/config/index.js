const js = require('./jsRules');
const vue = require('./vueRules');

const {
    pull: { StrictWorkflowRule }
} = require('../rules');

require('dotenv').config({
    path: '../../.env'
});

module.exports = {
    env: {},
    settings: {
        isGetFilesRequestPaginated: false,
        delayBetweenCommentRequestsInSeconds: 3,
        isOwnerAssigningEnabled: false,
        isReviewSummaryEnabled: false,
        isStoringLogsEnabled: true,
        maxCommentsPerReview: 50,
        senders: []
    },
    rules: {
        pull: {
            strictWorkflow: new StrictWorkflowRule({
                enabled: false,
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
                abortReviewOnInvalidBranchPrefix: false,
                abortReviewOnInvalidFlow: true
            })
        },
        files: {
            // TODO: applied across all files
            common: [],
            js,
            vue
        }
    }
};
