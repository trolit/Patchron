/* eslint-disable no-console */

const {
    common: {
        MarkedCommentsRule,
        SingleLineBlockRule,
        PositionedKeywordsRule,
        ValueComparisionStyleRule,
        KeywordsOrderedByLengthRule
    },
    pull: { StrictWorkflowRule }
} = require('../rules');

const rules = {
    MarkedCommentsRule,
    StrictWorkflowRule,
    SingleLineBlockRule,
    PositionedKeywordsRule,
    ValueComparisionStyleRule,
    KeywordsOrderedByLengthRule
};

/**
 * Import that method into core **index.js** file to easily debug particular rule with particular state.
 *
 * @param {string} ruleName - file name of rule
 * @param {object} config - rule config
 * @param {object} file - provide all elements that are required by passed rule
 * @param {PepegaContext} pepegaContext
 */
module.exports = (ruleName, config, file, pepegaContext) => {
    const Rule = rules[ruleName];

    const rule = new Rule(pepegaContext, config);

    const result = rule.invoke(file);

    console.log(`***************************************************`);
    console.log(`${ruleName} rule result`);
    console.log(`***************************************************`);

    console.log(result);
};
