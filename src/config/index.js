/* eslint-disable no-inline-comments */

const fs = require('fs');
const dotenvParseVariables = require('dotenv-parse-variables');

const js = require('./jsRules');
const vue = require('./vueRules');
const pull = require('./pullRules');

const env = '.env';
const defaultEnv = '.env.default';

const dotenv = require('dotenv').config({
    path: fs.existsSync(env) ? env : defaultEnv
});

const parsedEnv = dotenvParseVariables(dotenv.parsed);

const {
    SENDERS,
    IS_STORING_LOGS_ENABLED,
    MAX_COMMENTS_PER_REVIEW,
    IS_REVIEW_SUMMARY_ENABLED,
    IS_OWNER_ASSIGNING_ENABLED,
    IS_GET_FILES_REQUEST_PAGINATED,
    APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS,
    DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS
} = parsedEnv;

module.exports = {
    settings: {
        senders: SENDERS,
        isStoringLogsEnabled: IS_STORING_LOGS_ENABLED,
        maxCommentsPerReview: MAX_COMMENTS_PER_REVIEW,
        delayBetweenCommentRequestsInSeconds:
            DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS,
        isReviewSummaryEnabled: IS_REVIEW_SUMMARY_ENABLED,
        isOwnerAssigningEnabled: IS_OWNER_ASSIGNING_ENABLED,
        isGetFilesRequestPaginated: IS_GET_FILES_REQUEST_PAGINATED,
        approvePullOnEmptyReviewComments: APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS
    },
    nodeEnvironment: process.env.NODE_ENV,
    rules: {
        pull,
        files: {
            js,
            vue
        }
    }
};
