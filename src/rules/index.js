const StrictWorkflowRule = require('./pull/StrictWorkflow');

const MarkedCommentsRule = require('./common/MarkedComments');
const SingleLineBlockRule = require('./common/SingleLineBlock');
const PositionedKeywordsRule = require('./common/PositionedKeywords');
const LineBreakBeforeReturnRule = require('./common/LineBreakBeforeReturn');
const ValueComparisionStyleRule = require('./common/ValueComparisionStyle');
const KeywordsOrderedByLengthRule = require('./common/KeywordsOrderedByLength');
const FixedLoopLengthConditionRule = require('./common/FixedLoopLengthCondition');

const DirectImportRule = require('./js/DirectImport');

const ImportWithoutExtensionRule = require('./vue/ImportWithoutExtension');

module.exports = {
    common: {
        MarkedCommentsRule,
        SingleLineBlockRule,
        PositionedKeywordsRule,
        LineBreakBeforeReturnRule,
        ValueComparisionStyleRule,
        KeywordsOrderedByLengthRule,
        FixedLoopLengthConditionRule
    },

    pull: {
        StrictWorkflowRule
    },

    js: {
        DirectImportRule
    },

    vue: {
        ImportWithoutExtensionRule
    }
};
