/**
 * creates comment under PR
 * @param {object} context WebhookEvent instance.
 * @param {string} body text of the comment.
 *
 * @link
 * https://octokit.github.io/rest.js/v18#issues-create-comment
 */
module.exports = async (context, body) => {
    const comment = context.issue({
        body,
    });

    try {
        await context.octokit.issues.createComment(comment);
    } catch (error) {
        probotInstance.log.error(
            `Failed to add comment under PR -> ${__filename}`
        );

        probotInstance.log.error(error);
    }
};
