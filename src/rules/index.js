const StrictWorkflowRule = require('./pull/StrictWorkflow');

const MarkedCommentsRule = require('./common/MarkedComments');
const SingleLineBlockRule = require('./common/SingleLineBlock');
const PositionedKeywordsRule = require('./common/PositionedKeywords');
const ValueComparisionStyleRule = require('./common/ValueComparisionStyle');
const KeywordsOrderedByLengthRule = require('./common/KeywordsOrderedByLength');

module.exports = {
    common: {
        MarkedCommentsRule,
        SingleLineBlockRule,
        PositionedKeywordsRule,
        ValueComparisionStyleRule,
        KeywordsOrderedByLengthRule
    },
    pull: {
        StrictWorkflowRule
    }
};
