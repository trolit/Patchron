/* eslint-disable no-inline-comments */

const js = require('./jsRules');
const vue = require('./vueRules');
const pull = require('./pullRules');

require('dotenv').config({
    path: '@root/.env'
});

const senders = process.env.SENDERS;
const maxCommentsPerReview = process.env.MAX_COMMENTS_PER_REVIEW;

module.exports = {
    nodeEnvironment: process.env.NODE_ENV,
    settings: {
        isGetFilesRequestPaginated: false,
        delayBetweenCommentRequestsInSeconds: 3,
        isOwnerAssigningEnabled: true,
        isReviewSummaryEnabled: true,
        isStoringLogsEnabled: true,
        maxCommentsPerReview: maxCommentsPerReview
            ? parseInt(maxCommentsPerReview)
            : 25,
        senders: senders ? senders.split(',') : []
    },
    rules: {
        pull,
        files: {
            js,
            vue
        }
    }
};
