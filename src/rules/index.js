const StrictWorkflowRule = require('./pull/StrictWorkflow');

const MarkedCommentRule = require('./common/MarkedComment');
const SingleLineBlockRule = require('./common/SingleLineBlock');
const PositionedKeywordsRule = require('./common/PositionedKeywords');
const PredefinedFilenameRule = require('./common/PredefinedFilename');
const LineBreakBeforeReturnRule = require('./common/LineBreakBeforeReturn');
const ValueComparisionStyleRule = require('./common/ValueComparisionStyle');
const KeywordsOrderedByLengthRule = require('./common/KeywordsOrderedByLength');
const FixedLoopLengthConditionRule = require('./common/FixedLoopLengthCondition');

const DirectImportRule = require('./js/DirectImport');
const OperatorStyleRule = require('./js/OperatorStyle');
const AsynchronousPatternRule = require('./js/AsynchronousPattern');
const ImportWithoutExtensionRule = require('./js/ImportWithoutExtension');
const ImplicitIndexFileImportRule = require('./js/ImplicitIndexFileImport');
const SimplePropertyAssignmentRule = require('./js/SimplePropertyAssignment');

const NormalizedEventHandlerRule = require('./vue/NormalizedEventHandler');

module.exports = {
    common: {
        MarkedCommentRule,
        SingleLineBlockRule,
        PositionedKeywordsRule,
        PredefinedFilenameRule,
        LineBreakBeforeReturnRule,
        ValueComparisionStyleRule,
        KeywordsOrderedByLengthRule,
        FixedLoopLengthConditionRule
    },

    pull: {
        StrictWorkflowRule
    },

    js: {
        DirectImportRule,
        OperatorStyleRule,
        AsynchronousPatternRule,
        ImportWithoutExtensionRule,
        ImplicitIndexFileImportRule,
        SimplePropertyAssignmentRule
    },

    vue: {
        NormalizedEventHandlerRule
    }
};
