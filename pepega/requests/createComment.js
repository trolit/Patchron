/**
 * creates comment under PR
 * @param {object} context WebhookEvent instance.
 * @param {string} body text.
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
