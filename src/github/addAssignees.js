/**
 * adds assignees to pull request
 *
 * @param {PepegaContext} pepegaContext
 * @param {Array<string>} assignees usernames of people to assign
 *
 * {@link https://octokit.github.io/rest.js/v18#issues-add-assignees}
 */
module.exports = async (pepegaContext, assignees) => {
    const { pullRequest, log, repo } = pepegaContext;
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
