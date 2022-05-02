const { logFatal } = require('../utilities/EventLog');

/**
 * creates comment under PR
 * @param {WebhookEvent<EventPayloads.WebhookPayloadPullRequest>} context WebhookEvent instance.
 * @param {string} body text of the comment.
 *
 * @link
 * https://octokit.github.io/rest.js/v18#issues-create-comment
 */
module.exports = async (context, body) => {
    const comment = context.issue({
        body
    });

    try {
        await context.octokit.issues.createComment(comment);
    } catch (error) {
        logFatal(__filename, error);
    }
};
