const { logFatal } = require('../utilities/EventLog');

/**
 * adds assignees to pull request
 * @param {WebhookEvent<EventPayloads.WebhookPayloadPullRequest>} context WebhookEvent instance.
 * @param {Array<string>} assignees usernames of people to assign
 *
 * @link
 * https://octokit.github.io/rest.js/v18#issues-add-assignees
 */
module.exports = async (context, assignees) => {
    const repo = context.repo();

    try {
        await context.octokit.issues.addAssignees({
            ...repo,
            assignees,
            issue_number: repo.pull_number
        });
    } catch (error) {
        logFatal(__filename, error);
    }
};
