/** Class representing basic intel that will be used in all rules. */
class BasicDataBuilder {
    /**
     * @param {object} repo information provided via Probot's repo()
     * @param {string} repo.owner repository owner's name
     * @param {string} repo.repo repository name
     * @param {string} pull_number pull request Id
     * @param {string} patch changes made to file
     * @param {string} path relative path to the file
     * @param {string} commit_id
     */
    constructor(repo, pull_number, file) {
        const { filename, contents_url, patch } = file;

        const commit_id = contents_url.split('ref=').pop();

        const path = filename;

        const content = {
            ...repo,
            pull_number,
            commit_id,
            path,
            patch,
        };

        return content;
    }
}

module.exports = BasicDataBuilder;
