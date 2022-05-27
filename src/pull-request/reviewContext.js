const { rules } = require('src/config');
const review = require('src/rules/review');

/**
 * triggers `Pepega.js` to review files against configured rules
 *
 * @param {PepegaContext} pepegaContext
 *
 * @returns {Array<object>} review comments
 */
module.exports = (pepegaContext) => {
    const reviewComments = review(pepegaContext, rules.pull);

    return reviewComments;
};
