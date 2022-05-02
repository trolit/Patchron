const { logFatal } = require('../utilities/EventLog');

/**
 * fetches specified file from pull request within it's content encoded in base64.
 * @param {WebhookEvent<EventPayloads.WebhookPayloadPullRequest>} context WebhookEvent instance.
 * @param {string} contents_url path to file's content URL.
 * @param {object} payload repository details.
 * @param {string} payload.owner repository owner's name
 * @param {string} payload.repo repository name
 * @param {string} payload.pull_number pull request Id
 *
 * @link
 * https://octokit.github.io/rest.js/v18#custom-requests
 *
 * @example
 * contentsUrlPath = '/repos/<username>/<repoName>/contents/<filename>?ref=<commitId>'
 *
 * @returns {object} file details and it's content encoded in base64.
 */
module.exports = async (context, contents_url, payload) => {
    let result = null;

    const contentsUrlPath = contents_url.replace('https://api.github.com', '');

    try {
        result = await context.octokit.request(
            `GET ${contentsUrlPath}`,
            payload
        );
    } catch (error) {
        logFatal(__filename, error);
    }

    return result;
};
