const { rules } = require('src/config');
const review = require('src/rules/review');

/**
 * triggers `Patchron` to review files against configured rules
 *
 * @param {PatchronContext} patchronContext
 * @param {Array<object>} files
 *
 * @returns {Array<object>} review comments
 */
module.exports = (patchronContext, files) => {
    const comments = [];
    const { log } = patchronContext;

    if (!files?.length) {
        return comments;
    }

    for (const file of files) {
        _setupFileForReview(file);
        const { extension } = file;
        const relatedRules = rules.files[extension];

        if (!relatedRules) {
            log.information(
                __filename,
                `File with extension .${extension} skipped`
            );

            continue;
        }

        comments.push(...review(patchronContext, relatedRules, file));
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
function _setupFileForReview(file) {
    const { filename, contents_url, patch } = file;

    const commitId = contents_url.split('ref=').pop();

    const splitPatch = patch.split('\n');

    const extension = filename.split('.').pop();

    file.commitId = commitId;
    file.extension = extension;
    file.splitPatch = splitPatch;
}
