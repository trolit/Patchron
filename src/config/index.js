/* eslint-disable no-inline-comments */

const js = require('./jsRules');
const vue = require('./vueRules');
const pull = require('./pullRules');

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
        isStoringLogsEnabled: true,
        maxCommentsPerReview: 50, // limit number of comments that can be added per single review
        senders: [] // limit people whose pull requests will be reviewed (pass GitHub usernames)
    },
    rules: {
        pull,
        files: {
            js,
            vue
        }
    }
};
