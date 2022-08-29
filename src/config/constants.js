const MERGE = '<<< merge >>>';
const NEWLINE = '<<< newline >>>';
const COMMENTED_LINE = '<<< commented >>>';
const CUSTOM_LINES = [MERGE, NEWLINE, COMMENTED_LINE];

module.exports = Object.freeze({
    ADDED: '+',
    DELETED: '-',
    UNCHANGED: ' ',

    LEFT: 'LEFT',
    RIGHT: 'RIGHT',

    MERGE,
    NEWLINE,
    CUSTOM_LINES,
    COMMENTED_LINE,

    EMPTY: '',
    BLOCK_END: '}',
    BLOCK_START: '{',
    HUNK_HEADER_INDICATOR: '@@',

    TEST_ENVIRONMENT: 'test',
    PRODUCTION_ENVIRONMENT: 'production',

    DEFAULT_SENDERS: [],
    DEFAULT_IS_STORING_LOGS_ENABLED: false,
    DEFAULT_MAX_COMMENTS_PER_REVIEW: 25,
    DEFAULT_RULES_CONFIGURATION_URL: '',
    DEFAULT_RULES_CONFIGURATION_PATH: 'src/config/rules',
    DEFAULT_IS_REVIEW_SUMMARY_ENABLED: false,
    DEFAULT_IS_OWNER_ASSIGNING_ENABLED: true,
    DEFAULT_IS_GET_FILES_REQUEST_PAGINATED: false,
    DEFAULT_APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS: true,
    DEFAULT_DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS: 3,

    // @NOTE ⚠️ update it manually, in case of adding rules to not yet existing extensions (do not assign `common` here) ⚠️
    SUPPORTED_EXTENSIONS: ['html', 'vue', 'js']
});
