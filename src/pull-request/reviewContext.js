const { rules } = require('src/config');
const review = require('src/rules/review');

/**
 * triggers `Patchron` to review files against configured rules
 *
 * @param {PatchronContext} patchronContext
 *
 * @returns {Array<object>} review comments
 */
module.exports = (patchronContext) => {
    const reviewComments = review(patchronContext, rules.pull);

    return reviewComments;
};
