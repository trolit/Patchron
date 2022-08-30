const {
    SUPPORTED_EXTENSIONS,
    HUNK_HEADER_INDICATOR
} = require('src/config/constants');
const config = require('src/config');
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

        const { filename, extension } = file;

        const relatedRules = _getRelatedRules(filename, extension);

        if (!relatedRules) {
            log.information(
                __filename,
                `File with extension .${extension} skipped`
            );

            continue;
        }

        const { patch } = file;

        if (!patch) {
            continue;
        }

        const chunks = _splitPatchByHunkHeader(patch);

        for (const chunk of chunks) {
            const fileChunkReviewComments = review(
                patchronContext,
                relatedRules,
                {
                    ...file,
                    splitPatch: chunk
                }
            );

            if (fileChunkReviewComments?.length) {
                comments.push(...fileChunkReviewComments);
            }
        }
    }

    return comments;
};

/**
 * expands file object with following properties:
 * ```js
 * { commit_id, extension }
 * ```
 *
 * @param {object} file
 *
 * {@link https://docs.github.com/en/rest/reference/pulls#list-pull-requests-files}
 *
 * @returns {void}
 */
function _setupFileForReview(file) {
    const { filename, contents_url } = file;

    const commitId = contents_url.split('ref=').pop();

    const extension = filename.split('.').pop();

    file.commitId = commitId;
    file.extension = extension;
}

function _splitPatchByHunkHeader(patch) {
    const splitPatch = patch.split('\n');

    let lastHunkHeaderPosition = 0;

    const chunks = splitPatch.reduce(
        (accumulator, line, index) => {
            if (line.startsWith(HUNK_HEADER_INDICATOR) && index !== 0) {
                lastHunkHeaderPosition++;

                accumulator.push([line]);
            } else {
                accumulator[lastHunkHeaderPosition].push(line);
            }

            return accumulator;
        },
        [[]]
    );

    return chunks;
}

/**
 * attempts to return rules from expected "bucket"
 */
function _getRelatedRules(filename, extension) {
    const { rules } = config;
    const filePath = filename.substring(0, filename.lastIndexOf('/'));

    for (const key in rules.files) {
        let isPathMatched = false;
        const isPathWithAsterisk = key.endsWith('*');

        if (SUPPORTED_EXTENSIONS.includes(key)) {
            return rules.files[extension];
        }

        if (isPathWithAsterisk) {
            const fixedPath = key.slice(0, -1);

            isPathMatched = filename.startsWith(fixedPath);
        } else {
            const fixedKey = key.endsWith('/')
                ? key.substring(0, key.lastIndexOf('/'))
                : key;

            isPathMatched = filePath === fixedKey;
        }

        if (isPathMatched) {
            return rules.files[key][extension];
        }
    }

    return null;
}
