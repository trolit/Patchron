const { rules } = require('src/config');
const review = require('src/rules/review');

/**
 * triggers `Pepega.js` to review files against configured rules
 *
 * @param {PepegaContext} pepegaContext
 * @param {object} file
 *
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
                `File with extension .${file?.extension} skipped`
            );

            break;
    }

    return comments;
};

/**
 * expands file object with following properties:
 * ```js
 * { commit_id, extension, splitPatch }
 * ```
 *
 * @param {object} file
 *
 * {@link https://docs.github.com/en/rest/reference/pulls#list-pull-requests-files}
 *
 * @returns {void}
 */
function setupFileForReview(file) {
    const { filename, contents_url, patch } = file;

    const commitId = contents_url.split('ref=').pop();

    const splitPatch = patch.split('\n');

    const extension = filename.split('.').pop();

    file.commitId = commitId;
    file.extension = extension;
    file.splitPatch = splitPatch;
}
