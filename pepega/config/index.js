/* eslint-disable no-inline-comments */

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
        isGetFilesRequestPaginated: false, // when `false`, getFiles can receive up to 3000 files
        delayBetweenCommentRequestsInSeconds: 3,
        isOwnerAssigningEnabled: false,
        isReviewSummaryEnabled: false,
        isStoringLogsEnabled: false,
        maxCommentsPerReview: 50, // limit number of comments that can be added per single review
        senders: [] // (optional) limit people whose pull requests will be reviewed (pass GitHub usernames)
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
            js,
            vue
        }
    }
};
