/* eslint-disable no-inline-comments */

const fs = require('fs');
const configureRules = require('src/utilities/configureRules');
const dotenvParseVariables = require('dotenv-parse-variables');

const { TEST_ENVIRONMENT } = require('src/config/constants');

const nodeEnvironment = process.env.NODE_ENV;

const env = _setupEnv();

const {
    SENDERS,
    IS_STORING_LOGS_ENABLED,
    MAX_COMMENTS_PER_REVIEW,
    RULES_CONFIGURATION_URL,
    RULES_CONFIGURATION_PATH,
    IS_REVIEW_SUMMARY_ENABLED,
    IS_OWNER_ASSIGNING_ENABLED,
    IS_GET_FILES_REQUEST_PAGINATED,
    APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS,
    DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS
} = env;

const rules = require(RULES_CONFIGURATION_PATH);

const configuredRules = configureRules(rules);

module.exports = {
    nodeEnvironment,
    rules: configuredRules,
    rulesConfigurationUrl: RULES_CONFIGURATION_URL,
    rulesConfigurationPath: RULES_CONFIGURATION_PATH,
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
    }
};

function _setupEnv() {
    const prefix = '.env';
    let path = `${prefix}.example`;

    if (nodeEnvironment === TEST_ENVIRONMENT) {
        path = `${prefix}.test`;
    } else if (fs.existsSync(prefix)) {
        path = prefix;
    }

    const dotenv = require('dotenv').config({
        path
    });

    if (!dotenv) {
        throw new Error('Failed to load env');
    }

    return dotenvParseVariables(dotenv.parsed);
}
