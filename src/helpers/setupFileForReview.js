/**
 * expands file object with following properties:
 * ```js
 * { commit_id, extension, split_patch }
 * ```
 *
 * @param {object} file
 *
 * {@link https://docs.github.com/en/rest/reference/pulls#list-pull-requests-files}
 *
 * @returns {void}
 */
module.exports = (file) => {
    const { filename, contents_url, patch } = file;

    const commitId = contents_url.split('ref=').pop();

    const splitPatch = patch.split('\n');

    const extension = filename.split('.').pop();

    file.commitId = commitId;
    file.extension = extension;
    file.splitPatch = splitPatch;
};
