const {
    settings: { isGetFilesRequestPaginated }
} = require('../config');
const { logFatal } = require('../utilities/EventLog');

/**
 * fetches files from pull request. Unpaginated response includes a maximum of 3000 files
 * so **it's not recommended** to overload GitHub API by multiple small requests in 99% cases.
 * @param {WebhookEvent<EventPayloads.WebhookPayloadPullRequest>} context WebhookEvent instance.
 * @param {object} payload repository data.
 * @param {string} payload.owner repository owner's name
 * @param {string} payload.repo repository name
 * @param {string} payload.pull_number pull request Id
 * @param {string} [payload.per_page = 30] results per page (max 100)
 * @param {string} [payload.page] page number of the results to fetch.
 *
 * @link
 * https://octokit.github.io/rest.js/v18#pulls-list-files
 *
 * @returns {Promise<Array<object>>}
 */
module.exports = async (context, payload) => {
    let files = [];

    try {
        if (isGetFilesRequestPaginated) {
            files = await context.octokit.paginate(
                context.octokit.pulls.listFiles,
                payload,
                (response) => response.data
            );
        } else {
            const { data } = await context.octokit.pulls.listFiles(payload);

            files = data;
        }

        return Promise.resolve(files);
    } catch (error) {
        logFatal(__filename, error);

        return Promise.reject();
    }
};
