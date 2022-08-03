/* eslint-disable no-inline-comments */

const path = require('path');

const js = require('./jsRules');
const vue = require('./vueRules');
const pull = require('./pullRules');

const dotenv = require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

if (dotenv.error) {
    throw dotenv.error;
}

const dotenvParseVariables = require('dotenv-parse-variables');

const env = dotenvParseVariables(dotenv.parsed);

const {
    SENDERS,
    IS_STORING_LOGS_ENABLED,
    MAX_COMMENTS_PER_REVIEW,
    IS_REVIEW_SUMMARY_ENABLED,
    IS_OWNER_ASSIGNING_ENABLED,
    IS_GET_FILES_REQUEST_PAGINATED,
    APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS,
    DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS
} = env;

module.exports = {
    nodeEnvironment: process.env.NODE_ENV,
    settings: {
        isGetFilesRequestPaginated: IS_GET_FILES_REQUEST_PAGINATED,
        delayBetweenCommentRequestsInSeconds:
            DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS,
        isOwnerAssigningEnabled: IS_OWNER_ASSIGNING_ENABLED,
        isReviewSummaryEnabled: IS_REVIEW_SUMMARY_ENABLED,
        isStoringLogsEnabled: IS_STORING_LOGS_ENABLED,
        approvePullOnEmptyReviewComments: APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS,
        maxCommentsPerReview: MAX_COMMENTS_PER_REVIEW,
        senders: SENDERS
    },
    rules: {
        pull,
        files: {
            js,
            vue
        }
    }
};
