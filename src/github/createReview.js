/**
 * @param {PatchronContext} patchronContext
 * @param {object} review
 *
 * {@link https://octokit.github.io/rest.js/v18#pulls-create-review-comment}
 */
module.exports = async (patchronContext, review) => {
    const { pullRequest, log, repo } = patchronContext;
    const { context } = pullRequest;

    try {
        await context.octokit.pulls.createReview({
            ...repo,
            ...review,
            pull_number: pullRequest.id
        });
    } catch (error) {
        log.fatal(error);
    }
};
