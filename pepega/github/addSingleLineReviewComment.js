/**
 * sends request to add single line review comment.
 * @param {object} context WebhookEvent instance.
 * @param {object} payload review details.
 * @param {string} payload.owner repository owner's name
 * @param {string} payload.repo repository name
 * @param {string} payload.pull_number pull request Id
 * @param {string} payload.body review comment
 * @param {string} payload.line line number (counted from the start of the file)
 * @param {string} payload.side which side line refers to (LEFT=deletion, RIGHT=addition)
 * @param {string} payload.path relative path to the file (tl;dr; - filename)
 * @param {string} payload.commit_id
 *
 * @link
 * https://octokit.github.io/rest.js/v18#pulls-create-review-comment
 *
 * @returns {object} request response
 */
module.exports = async (context, payload) => {
    let result = null;

    try {
        result = await context.octokit.pulls.createReviewComment(payload);
    } catch (error) {
        probotInstance.log.error(
            `Failed to create single line review -> ${__filename}\npayload:\n${payload}`
        );

        probotInstance.log.error(error);
    }

    return result;
};
