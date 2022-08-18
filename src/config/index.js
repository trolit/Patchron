/* eslint-disable no-inline-comments */

const fs = require('fs');
const jsonpath = require('jsonpath');
const isPlainObject = require('lodash/isPlainObject');
const dotenvParseVariables = require('dotenv-parse-variables');

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
    RULES_CONFIGURATION_URL,
    IS_REVIEW_SUMMARY_ENABLED,
    IS_OWNER_ASSIGNING_ENABLED,
    IS_GET_FILES_REQUEST_PAGINATED,
    APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS,
    DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS
} = parsedEnv;

let rules = null;

if (RULES_CONFIGURATION_URL) {
    // attempt to fetch config from URL
} else {
    rules = require('src/config/rules');
}

if (!rules) {
    throw new Error(
        'Attempted to read > rules < configuration but it does not exist.'
    );
}

for (const categoryKey in rulesConfig) {
    const rules = rulesConfig[categoryKey];
    const element = rules[categoryKey];

    if (isPlainObject(rules)) {
        for (const subCategoryKey in rules) {
            _adjustRules(rules[subCategoryKey]);
            _adjustRules(element[subCategoryKey]);
        }
    } else {
        _adjustRules(element);
    }
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
    rules
};

function _adjustRules(rules) {
    for (const rule of rules) {
        const { rulename, config } = rule;

        rule.reference = require(`src/rules/${rulename}`);

        delete rule.rulename;

        jsonpath.apply(config, '$..regex', (value) => {
            return new RegExp(value);
        });
    }
}
