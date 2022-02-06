/**
 * adds assignees to pull request
 * @param {object} context WebhookEvent instance.
 * @param {object} repo
 * @param {string} repo.owner repository owner's name
 * @param {object} repo.repo repository name
 * @param {Array<string>} assignees usernames of people to assign
 *
 * @link
 * https://octokit.github.io/rest.js/v18#issues-add-assignees
 */
module.exports = async (context, repo, assignees) => {
    try {
        await context.octokit.issues.addAssignees({
            ...repo,
            assignees,
            issue_number: repo.pull_number,
        });
    } catch (error) {
        probotInstance.log.error(
            `Failed to add assignee(s) to PR: ${__filename}`
        );

        probotInstance.log.error(error);
    }
};
