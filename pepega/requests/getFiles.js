/**
 * fetches files from specified pull request
 * @param {object} context WebhookEvent instance.
 * @param {object} repo repository data.
 * @param {string} repo.owner repository owner's name
 * @param {string} repo.repo repository name
 * @param {string} repo.pull_number pull request Id
 * @return {Array<object>} array of files.
 */
module.exports = async (context, repo) => {
    let files = [];

    try {
        files = await context.octokit.pulls.listFiles(repo);
    } catch (error) {
        probotInstance.log.error(
            `Failed to fetch files from PR:${repo.pull_number} of ${repo.repo} -> ${__filename}`
        );
    }

    return files;
};
