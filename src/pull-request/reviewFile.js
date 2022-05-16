const { rules } = require('../config');
const review = require('../rules/review');
const BasicDataBuilder = require('../builders/BasicData');

/**
 * triggers `Pepega.js` to review files against configured rules
 * @param {import('../builders/PepegaContext')} pepegaContext
 * @param {object} file
 * @returns {Array<object>} review comments
 */
module.exports = (pepegaContext, file) => {
    const { log } = pepegaContext;
    const basicData = new BasicDataBuilder(file);

    let comments = [];

    switch (file.extension) {
        case 'vue':
            comments = review(pepegaContext, rules.files.vue, basicData);
            break;

        case 'js':
            comments = review(pepegaContext, rules.files.js, basicData);
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
