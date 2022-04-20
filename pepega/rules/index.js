const StrictWorkflowRule = require('./pull/StrictWorkflow');

const PositionedKeywordsRule = require('./common/PositionedKeywords');
const NoUnmarkedCommentsRule = require('./common/NoUnmarkedComments');
const SingleLineBlockRule = require('./common/SingleLineBlockRule');
const KeywordsOrderedByLengthRule = require('./common/KeywordsOrderedByLength');

module.exports = {
    common: {
        SingleLineBlockRule,
        NoUnmarkedCommentsRule,
        PositionedKeywordsRule,
        KeywordsOrderedByLengthRule
    },
    pull: {
        StrictWorkflowRule
    }
};
