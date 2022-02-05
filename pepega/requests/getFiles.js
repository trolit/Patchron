/**
 * fetches files from specified pull request
 * @param {object} context WebhookEvent instance.
 * @param {object} payload repository data.
 * @param {string} payload.owner repository owner's name
 * @param {string} payload.repo repository name
 * @param {string} payload.pull_number pull request Id
 *
 * @description
 * Unpaginated response include a maximum of 3000 files. The paginated response returns
 * 30 files per page by default. **Octokit paginate** allows to get accumulated results.
 *
 * @link
 * https://octokit.github.io/rest.js/v18#pulls-list-files
 *
 * @returns {Promise<Array<object>>}
 */
module.exports = async (context, payload) => {
    let files = [];

    try {
        files = await context.octokit.paginate(
            context.octokit.pulls.listFiles,
            payload,
            (response) => response.data
        );

        return Promise.resolve(files);
    } catch (error) {
        probotInstance.log.error(
            `Failed to fetch files from PR:${payload.pull_number} of ${payload.repo} -> ${__filename}`
        );

        probotInstance.log.error(error);

        return Promise.reject();
    }
};
