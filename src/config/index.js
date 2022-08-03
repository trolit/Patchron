/* eslint-disable no-inline-comments */

const js = require('./jsRules');
const vue = require('./vueRules');
const pull = require('./pullRules');

const dotenv = require('dotenv').config();
const dotenvParseVariables = require('dotenv-parse-variables');

let settings = {
    senders: [],
    maxCommentsPerReview: 25,
    isStoringLogsEnabled: true,
    isOwnerAssigningEnabled: true,
    isReviewSummaryEnabled: false,
    isGetFilesRequestPaginated: false,
    approvePullOnEmptyReviewComments: true,
    delayBetweenCommentRequestsInSeconds: 3
};

const NODE_ENV = process.env.NODE_ENV;

if (process.env.NODE_ENV !== 'test') {
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

    settings = {
        senders: SENDERS,
        isStoringLogsEnabled: IS_STORING_LOGS_ENABLED,
        maxCommentsPerReview: MAX_COMMENTS_PER_REVIEW,
        delayBetweenCommentRequestsInSeconds:
            DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS,
        isReviewSummaryEnabled: IS_REVIEW_SUMMARY_ENABLED,
        isOwnerAssigningEnabled: IS_OWNER_ASSIGNING_ENABLED,
        isGetFilesRequestPaginated: IS_GET_FILES_REQUEST_PAGINATED,
        approvePullOnEmptyReviewComments: APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS
    };
}

module.exports = {
    settings,
    nodeEnvironment: NODE_ENV,
    rules: {
        pull,
        files: {
            js,
            vue
        }
    }
};
