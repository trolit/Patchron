// *: ---             ---               ---             ---               ---             ---               ---
// *: --- ONLY FOR DEVELOPMENT PURPOSES --- ONLY FOR DEVELOPMENT PURPOSES --- ONLY FOR DEVELOPMENT PURPOSES ---
// *: ---             ---               ---             ---               ---             ---               ---

/* eslint-disable no-console */

const { pull, common } = require('src/rules');

const rules = {
    ...pull,
    ...common
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
