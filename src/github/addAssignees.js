/**
 * adds assignees to pull request
 *
 * @param {PatchronContext} patchronContext
 * @param {Array<string>} assignees usernames of people to assign
 *
 * {@link https://octokit.github.io/rest.js/v18#issues-add-assignees}
 */
module.exports = async (patchronContext, assignees) => {
    const { pullRequest, log, repo } = patchronContext;
    const { context } = pullRequest;

    try {
        await context.octokit.issues.addAssignees({
            ...repo,
            assignees,
            issue_number: pullRequest.id
        });
    } catch (error) {
        log.fatal(error);
    }
};
