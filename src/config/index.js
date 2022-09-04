/* eslint-disable no-inline-comments */

const configureRules = require('src/utilities/configureRules');
const dotenvParseVariables = require('dotenv-parse-variables');

const {
    DEFAULT_SENDERS,
    TEST_ENVIRONMENT,
    GITHUB_ACTION_ENVIRONMENT,
    DEFAULT_IS_STORING_LOGS_ENABLED,
    DEFAULT_MAX_COMMENTS_PER_REVIEW,
    DEFAULT_RULES_CONFIGURATION_URL,
    DEFAULT_RULES_CONFIGURATION_PATH,
    DEFAULT_IS_REVIEW_SUMMARY_ENABLED,
    DEFAULT_IS_OWNER_ASSIGNING_ENABLED,
    DEFAULT_IS_GET_FILES_REQUEST_PAGINATED,
    DEFAULT_APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS,
    DEFAULT_DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS
} = require('src/config/constants');

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
    let parsed = {
        SENDERS: DEFAULT_SENDERS,
        APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS:
            DEFAULT_APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS,
        DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS:
            DEFAULT_DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS,
        IS_STORING_LOGS_ENABLED: DEFAULT_IS_STORING_LOGS_ENABLED,
        RULES_CONFIGURATION_URL: DEFAULT_RULES_CONFIGURATION_URL,
        MAX_COMMENTS_PER_REVIEWS: DEFAULT_MAX_COMMENTS_PER_REVIEW,
        RULES_CONFIGURATION_PATH: DEFAULT_RULES_CONFIGURATION_PATH,
        IS_REVIEW_SUMMARY_ENABLED: DEFAULT_IS_REVIEW_SUMMARY_ENABLED,
        IS_OWNER_ASSIGNING_ENABLED: DEFAULT_IS_OWNER_ASSIGNING_ENABLED,
        IS_GET_FILES_REQUEST_PAGINATED: DEFAULT_IS_GET_FILES_REQUEST_PAGINATED
    };

    if (nodeEnvironment === GITHUB_ACTION_ENVIRONMENT) {
        const githubEnv = {
            SENDERS: process.env.SENDERS,
            IS_GET_FILES_REQUEST_PAGINATED:
                process.env.IS_GET_FILES_REQUEST_PAGINATED,
            APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS:
                process.env.APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS,
            DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS:
                process.env.DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS,
            RULES_CONFIGURATION_URL: process.env.RULES_CONFIGURATION_URL,
            MAX_COMMENTS_PER_REVIEWS: process.env.MAX_COMMENTS_PER_REVIEW,
            RULES_CONFIGURATION_PATH: process.env.RULES_CONFIGURATION_PATH,
            IS_REVIEW_SUMMARY_ENABLED: process.env.IS_REVIEW_SUMMARY_ENABLED,
            IS_OWNER_ASSIGNING_ENABLED: process.env.IS_OWNER_ASSIGNING_ENABLED
        };

        Object.keys(githubEnv).forEach((key) => {
            if (githubEnv[key] === undefined) {
                delete githubEnv[key];
            }
        });

        parsed = {
            ...parsed,
            ...githubEnv
        };
    } else {
        const dotenv = require('dotenv').config({
            path: nodeEnvironment === TEST_ENVIRONMENT ? '.env.test' : '.env'
        });

        if (!dotenv) {
            throw new Error('Failed to load env');
        }

        parsed = dotenv.parsed;
    }

    return dotenvParseVariables(parsed);
}
