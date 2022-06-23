// *: ---             ---               ---             ---               ---             ---               ---
// *: --- ONLY FOR DEVELOPMENT PURPOSES --- ONLY FOR DEVELOPMENT PURPOSES --- ONLY FOR DEVELOPMENT PURPOSES ---
// *: ---             ---               ---             ---               ---             ---               ---

/* eslint-disable no-console */

const { pull, common, js, vue } = require('src/rules');

const rules = {
    ...js,
    ...vue,
    ...pull,
    ...common
};

/**
 * Import that method into core **index.js** file to easily debug particular rule with particular state.
 *
 * @param {string} ruleName - file name of rule
 * @param {object} config - rule config
 * @param {object} file - provide all elements that are required by passed rule
 * @param {PatchronContext} patchronContext
 */
module.exports = (ruleName, config, file, patchronContext) => {
    const Rule = rules[ruleName];

    const rule = new Rule(patchronContext, config, file);

    const result = rule.invoke();

    console.log(`***************************************************`);
    console.log(`${ruleName} rule result`);
    console.log(`***************************************************`);

    console.log(result);
};
