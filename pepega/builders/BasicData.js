/** Class representing basic intel that is given to all rules. */
class BasicDataBuilder {
    /**
     * @param {object} file
     * @param {string} file.owner repository owner's name
     * @param {string} file.repo repository name
     * @param {string} file.pull_number pull request Id
     * @param {string} file.patch changes made to file
     * @param {string} file.split_patch changes made to file (split by newline)
     * @param {string} file.path relative path to the file
     * @param {string} file.commit_id
     * @example
     * + other params returned by GitHub API (01.2022)
     * - sha,
     * - status,
     * - additions,
     * - deletions,
     * - changes,
     * - blob_url,
     * - raw_url,
     * - contents_url
     */
    constructor(file) {
        const { filename, contents_url, patch } = file;

        const commit_id = contents_url.split('ref=').pop();

        const path = filename;

        const split_patch = patch.split('\n');

        const content = {
            ...file,
            commit_id,
            path,
            split_patch,
        };

        return content;
    }
}

module.exports = BasicDataBuilder;
