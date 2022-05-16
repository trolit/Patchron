const { rules } = require('../config');
const review = require('../rules/review');

/**
 * triggers `Pepega.js` to review files against configured rules
 * @param {object} repo basic repo data (including pull number)
 * @returns {Array<object>} review comments
 */
module.exports = (pepegaContext) => {
    const reviewComments = review(pepegaContext, rules.pull);

    return reviewComments;
};
