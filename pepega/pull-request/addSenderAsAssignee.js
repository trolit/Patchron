const addAssignees = require('../github/addAssignees');

/**
 * adds pull request sender as assignee
 * @param {WebhookEvent<EventPayloads.WebhookPayloadPullRequest>} context WebhookEvent instance.
 * @param {object} repo
 * @param {string} repo.owner repository owner's name
 * @param {string} repo.repo repository name
 * @param {number} repo.pull_number pull request Id
 * @param {object} payload
 * @param {string} payload.sender login of user who created pull request
 */
module.exports = async (context, repo, payload) => {
    const { login: pullRequestOwner } = payload.sender;

    try {
        await addAssignees(context, repo, [pullRequestOwner]);
    } catch (error) {
        probotInstance.log.error(error);
    }
};
