const StrictWorkflowRule = require('./pull/StrictWorkflow');

const SingleLineBlockRule = require('./common/SingleLineBlock');
const PositionedKeywordsRule = require('./common/PositionedKeywords');
const NoUnmarkedCommentsRule = require('./common/NoUnmarkedComments');
const ValueComparisionStyleRule = require('./common/ValueComparisionStyle');
const KeywordsOrderedByLengthRule = require('./common/KeywordsOrderedByLength');

module.exports = {
    common: {
        SingleLineBlockRule,
        NoUnmarkedCommentsRule,
        PositionedKeywordsRule,
        ValueComparisionStyleRule,
        KeywordsOrderedByLengthRule
    },
    pull: {
        StrictWorkflowRule
    }
};
