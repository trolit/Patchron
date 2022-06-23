/**
 * sends request to add multi line review comment.
 *
 * @param {PatchronContext} patchronContext
 * @param {MultiLineComment} multiLineComment
 *
 * {@link https://octokit.github.io/rest.js/v18#pulls-create-review-comment}
 *
 * @returns {object} request response
 */
module.exports = async (patchronContext, multiLineComment) => {
    const { pullRequest, log } = patchronContext;
    const { context } = pullRequest;
    let result = null;

    try {
        result = await context.octokit.pulls.createReviewComment(
            multiLineComment
        );
    } catch (error) {
        log.fatal(error);
    }

    return result;
};
