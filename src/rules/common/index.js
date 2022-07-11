const MarkedCommentRule = require('./MarkedComment');
const SingleLineBlockRule = require('./SingleLineBlock');
const PositionedKeywordsRule = require('./PositionedKeywords');
const PredefinedFilenameRule = require('./PredefinedFilename');
const LineBreakBeforeReturnRule = require('./LineBreakBeforeReturn');
const KeywordsOrderedByLengthRule = require('./KeywordsOrderedByLength');
const ComparisionOperatorLevelRule = require('./ComparisionOperatorLevel');
const FixedLoopLengthConditionRule = require('./FixedLoopLengthCondition');

module.exports = {
    MarkedCommentRule,
    SingleLineBlockRule,
    PositionedKeywordsRule,
    PredefinedFilenameRule,
    LineBreakBeforeReturnRule,
    KeywordsOrderedByLengthRule,
    ComparisionOperatorLevelRule,
    FixedLoopLengthConditionRule
};
