/* eslint-disable no-console */

const StrictWorkflowRule = require('../rules/pull/StrictWorkflow');
const PositionedKeywordsRule = require('../rules/common/PositionedKeywords');
const NoUnmarkedCommentsRule = require('../rules/common/NoUnmarkedComments');
const KeywordsOrderedByLengthRule = require('../rules/common/KeywordsOrderedByLength');

const rules = {
    StrictWorkflowRule,
    NoUnmarkedCommentsRule,
    PositionedKeywordsRule,
    KeywordsOrderedByLengthRule,
};

/**
 * Import that method into core **index.js** file to easily debug particular rule with particular state.
 * @param {string} ruleName - file name of rule
 * @param {object} config - rule config
 * @param {object} file - provide all elements that are required by given rules
 */
module.exports = (ruleName, config, file) => {
    const Rule = rules[ruleName];

    const rule = new Rule(config);

    console.log(`***************************************************`);
    console.log(`${ruleName} rule result`);
    console.log(`***************************************************`);

    const result = rule.invoke(file);

    console.log(result);
};
