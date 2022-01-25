/** Class representing basic intel that is given to all rules. */
class BasicDataBuilder {
    /**
     * @param {object} file
     * @param {string} file.owner repository owner's name
     * @param {string} file.repo repository name
     * @param {string} file.pull_number pull request Id
     * @param {string} file.patch changes made to file
     * @param {string} file.path relative path to the file
     * @param {string} file.commit_id
     */
    constructor(file) {
        const { filename, contents_url } = file;

        const commit_id = contents_url.split('ref=').pop();

        const path = filename;

        const content = {
            ...file,
            commit_id,
            path,
        };

        return content;
    }
}

module.exports = BasicDataBuilder;
