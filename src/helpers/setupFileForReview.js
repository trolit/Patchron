/**
 * expands file object with following properties:
 * ```js
 * { path, commit_id, extension, split_patch }
 * ```
 * @param {object} file
 *
 * @link file's response can be found here:
 * https://docs.github.com/en/rest/reference/pulls#list-pull-requests-files
 *
 * @returns {void}
 */
module.exports = (file) => {
    const { filename, contents_url, patch } = file;

    const commit_id = contents_url.split('ref=').pop();

    const path = filename;

    const split_patch = patch.split('\n');

    const extension = file.filename.split('.').pop();

    file.path = path;
    file.commit_id = commit_id;
    file.extension = extension;
    file.split_patch = split_patch;
};
