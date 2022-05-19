/**
 * fetches specified file from pull request from particular commit, within it's content (encoded in base64).
 * @param {PepegaContext} pepegaContext
 * @param {string} contents_url path to file's content URL.
 * @param {Object} options pass payload optional params (or params to overwrite used ones)
 *
 * @link
 * https://octokit.github.io/rest.js/v18#custom-requests
 *
 * @example
 * contentsUrlPath = '/repos/<username>/<repoName>/contents/<filename>?ref=<commitId>'
 *
 * @returns {Object} file details and it's content encoded in base64.
 */
module.exports = async (pepegaContext, contents_url, options = {}) => {
    const { pullRequest, log, repo } = pepegaContext;
    const { context } = pullRequest;
    let result = null;

    const payload = {
        ...repo,
        pull_number: pullRequest.id,
        ...options
    };

    const contentsUrlPath = contents_url.replace('https://api.github.com', '');

    try {
        result = await context.octokit.request(
            `GET ${contentsUrlPath}`,
            payload
        );
    } catch (error) {
        log.fatal(error);
    }

    return result;
};
