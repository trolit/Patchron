/**
 * sends request to add single line review comment.
 *
 * @param {PatchronContext} patchronContext
 * @param {SingleLineComment} singleLineComment
 *
 * {@link https://octokit.github.io/rest.js/v18#pulls-create-review-comment}
 *
 * @returns {object} request response
 */
module.exports = async (patchronContext, singleLineComment) => {
    const { pullRequest, log } = patchronContext;
    const { context } = pullRequest;
    let result = null;

    try {
        result = await context.octokit.pulls.createReviewComment(
            singleLineComment
        );
    } catch (error) {
        log.fatal(error);
    }

    return result;
};
