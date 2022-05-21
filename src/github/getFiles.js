const {
    settings: { isGetFilesRequestPaginated }
} = require('../config');

/**
 * fetches files from pull request. Unpaginated response includes a maximum of 3000 files
 * so **it's not recommended** to overload GitHub API by multiple small requests in 99% cases.
 *
 * @param {PepegaContext} pepegaContext
 * @param {object} options pass payload optional params (or params to overwrite used ones)
 * @param {string} [options.per_page = 30] results per page (max 100)
 * @param {string} [options.page] page number of the results to fetch.
 *
 * {@link https://octokit.github.io/rest.js/v18#pulls-list-files}
 *
 * @returns {Promise<Array<object>>}
 */
module.exports = async (pepegaContext, options = {}) => {
    const { pullRequest, log, repo } = pepegaContext;
    const { context } = pullRequest;
    let files = [];

    const payload = {
        ...repo,
        pull_number: pullRequest.id,
        ...options
    };

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
        log.fatal(error);

        return Promise.reject();
    }
};
