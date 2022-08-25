// *: ---             ---               ---             ---               ---             ---               ---
// *: --- ONLY FOR DEVELOPMENT PURPOSES --- ONLY FOR DEVELOPMENT PURPOSES --- ONLY FOR DEVELOPMENT PURPOSES ---
// *: ---             ---               ---             ---               ---             ---               ---

/* eslint-disable no-console */

/**
 * Import that method into core **index.js** file to easily debug particular rule with particular state.
 *
 * @param {string} ruleName - `<version><category><name>` e.g. `v1/common/LineBreakBeforeReturn`
 * @param {object} config - rule config
 * @param {object} file - provide all elements that are required by passed rule
 * @param {PatchronContext} patchronContext
 */
module.exports = (ruleName, config, file, patchronContext) => {
    const Rule = require(`src/rules/${ruleName}`);

    const rule = new Rule(patchronContext, config, file);

    const result = rule.invoke();

    console.log(`***************************************************`);
    console.log(`${ruleName} rule result`);
    console.log(`***************************************************`);

    console.log(result);
};
