/* eslint-disable no-inline-comments */

const fs = require('fs');
const jsonpath = require('jsonpath');
const dotenvParseVariables = require('dotenv-parse-variables');

const env = '.env';
const defaultEnv = '.env.default';

const dotenv = require('dotenv').config({
    path: fs.existsSync(env) ? env : defaultEnv
});

const parsedEnv = dotenvParseVariables(dotenv.parsed);

const rulesConfig = require('src/config/rules');

for (const category in rulesConfig) {
    const rules = rulesConfig[category];

    for (const rule of rules) {
        const { rulename, config } = rule;

        rule.reference = require(`src/rules/${rulename}`);

        delete rule.rulename;

        jsonpath.apply(config, '$..regex', (value) => {
            return new RegExp(value);
        });
    }
}

const {
    SENDERS,
    IS_STORING_LOGS_ENABLED,
    MAX_COMMENTS_PER_REVIEW,
    RULES_CONFIGURATION_URL,
    IS_REVIEW_SUMMARY_ENABLED,
    IS_OWNER_ASSIGNING_ENABLED,
    IS_GET_FILES_REQUEST_PAGINATED,
    APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS,
    DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS
} = parsedEnv;

if (RULES_CONFIGURATION_URL) {
    // attempt to fetch config from URL
} else {
    // attempt to fetch config from app
}

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
    rules: rulesConfig
};
