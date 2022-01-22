/**
 * fetches files from specified pull request
 * @param {object} context WebhookEvent instance.
 * @param {object} payload repository data.
 * @param {string} payload.owner repository owner's name
 * @param {string} payload.repo repository name
 * @param {string} payload.pull_number pull request Id
 * @return {Array<object>} array of files.
 */
module.exports = async (context, payload) => {
    let files = [];

    try {
        files = await context.octokit.pulls.listFiles(payload);
    } catch (error) {
        probotInstance.log.error(
            `Failed to fetch files from PR:${payload.pull_number} of ${payload.repo} -> ${__filename}`
        );

        probotInstance.log.error(error);
    }

    return files;
};
