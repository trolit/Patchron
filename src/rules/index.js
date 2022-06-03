const StrictWorkflowRule = require('./pull/StrictWorkflow');

const MarkedCommentsRule = require('./common/MarkedComments');
const SingleLineBlockRule = require('./common/SingleLineBlock');
const PositionedKeywordsRule = require('./common/PositionedKeywords');
const LineBreakBeforeReturnRule = require('./common/LineBreakBeforeReturn');
const ValueComparisionStyleRule = require('./common/ValueComparisionStyle');
const KeywordsOrderedByLengthRule = require('./common/KeywordsOrderedByLength');

const DirectImportRule = require('./js/DirectImport');

module.exports = {
    common: {
        MarkedCommentsRule,
        SingleLineBlockRule,
        PositionedKeywordsRule,
        LineBreakBeforeReturnRule,
        ValueComparisionStyleRule,
        KeywordsOrderedByLengthRule
    },
    pull: {
        StrictWorkflowRule
    },
    js: {
        DirectImportRule
    }
};
