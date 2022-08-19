/* eslint-disable no-inline-comments */

const fs = require('fs');
const fetch = require('node-fetch');
const jsonpath = require('jsonpath');
const isPlainObject = require('lodash/isPlainObject');
const dotenvParseVariables = require('dotenv-parse-variables');

const { TEST_ENVIRONMENT } = require('src/config/constants');

const nodeEnvironment = process.env.NODE_ENV;

const env = _getEnvironmentVariables();

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

module.exports = {
    nodeEnvironment,
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
    rules: _getRulesConfig()
};

function _getEnvironmentVariables() {
    const prefix = '.env';
    let path = `${prefix}.default`;

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

async function _getRulesConfig() {
    let rulesConfig = {};

    if (RULES_CONFIGURATION_URL && nodeEnvironment !== TEST_ENVIRONMENT) {
        try {
            const response = await fetch(RULES_CONFIGURATION_URL);

            rulesConfig = await response.json();
        } catch (error) {
            throw new Error(error);
        }
    } else {
        rulesConfig = require(RULES_CONFIGURATION_PATH);
    }

    return _adjustRulesConfig(rulesConfig);
}

function _adjustRulesConfig(config) {
    for (const categoryKey in config) {
        const category = config[categoryKey];

        if (isPlainObject(category)) {
            for (const subCategoryKey in category) {
                _setupRules(category[subCategoryKey]);
            }
        } else {
            _setupRules(category);
        }
    }

    return config;
}

function _setupRules(arrayOfRules) {
    for (const rule of arrayOfRules) {
        const { rulename, config } = rule;

        rule.reference = require(`src/rules/${rulename}`);

        delete rule.rulename;

        jsonpath.apply(config, '$..regex', (value) => {
            return new RegExp(value);
        });
    }
}
