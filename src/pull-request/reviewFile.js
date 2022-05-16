const { rules } = require('../config');
const review = require('../rules/review');
const setupFileForReview = require('../helpers/setupFileForReview');

/**
 * triggers `Pepega.js` to review files against configured rules
 * @param {import('../builders/PepegaContext')} pepegaContext
 * @param {object} file
 * @returns {Array<object>} review comments
 */
module.exports = (pepegaContext, file) => {
    const { log } = pepegaContext;

    setupFileForReview(file);
    let comments = [];

    switch (file.extension) {
        case 'vue':
            comments = review(pepegaContext, rules.files.vue, file);
            break;

        case 'js':
            comments = review(pepegaContext, rules.files.js, file);
            break;

        default:
            log.information(
                __filename,
                `Extension not supported (${file?.extension})`
            );

            break;
    }

    return comments;
};
