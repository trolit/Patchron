/**
 * creates comment under PR
 *
 * @param {PatchronContext} patchronContext
 * @param {string} body text of the comment.
 *
 * {@link https://octokit.github.io/rest.js/v18#issues-create-comment}
 */
module.exports = async (patchronContext, body) => {
    const { pullRequest, log } = patchronContext;
    const { context } = pullRequest;

    const comment = context.issue({
        body
    });

    try {
        await context.octokit.issues.createComment(comment);
    } catch (error) {
        log.fatal(error);
    }
};
