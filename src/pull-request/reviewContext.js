const { rules } = require('../config');
const review = require('../rules/review');

/**
 * triggers `Pepega.js` to review files against configured rules
 * @param {import('../builders/PepegaContext')} pepegaContext
 * @returns {Array<object>} review comments
 */
module.exports = (pepegaContext) => {
    const reviewComments = review(pepegaContext, rules.pull);

    return reviewComments;
};
