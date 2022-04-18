const StrictWorkflowRule = require('./pull/StrictWorkflow');

const PositionedKeywordsRule = require('./common/PositionedKeywords');
const NoUnmarkedCommentsRule = require('./common/NoUnmarkedComments');
const KeywordsOrderedByLengthRule = require('./common/KeywordsOrderedByLength');

module.exports = {
    common: {
        NoUnmarkedCommentsRule,
        PositionedKeywordsRule,
        KeywordsOrderedByLengthRule,
    },
    pull: {
        StrictWorkflowRule,
    },
};
