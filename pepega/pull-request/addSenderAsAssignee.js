const addAssignees = require('../github/addAssignees');

/**
 * adds pull request sender as assignee
 * @param {WebhookEvent<EventPayloads.WebhookPayloadPullRequest>} context WebhookEvent instance.
 * @param {object} repo
 * @param {string} repo.owner repository owner's name
 * @param {string} repo.repo repository name
 * @param {number} repo.pull_number pull request Id
 * @param {string} pullRequestOwner login of PR owner
 */
module.exports = async (context, repo, pullRequestOwner) => {
    try {
        await addAssignees(context, repo, [pullRequestOwner]);
    } catch (error) {
        probotInstance.log.error(error);
    }
};
