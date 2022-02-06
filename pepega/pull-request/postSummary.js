const dedent = require('dedent-js');
const addComment = require('../requests/addComment');

/**
 * **POST** pull request review summary
 * @param {WebhookEvent<EventPayloads.WebhookPayloadPullRequest>} context WebhookEvent instance.
 * @param {Array<object>} reviewComments
 * @param {object} payload
 */
module.exports = async (context, reviewComments, payload) => {
    const { commits, additions, deletions, changed_files } =
        payload.pull_request;

    const commentBody = `<em>pull request review completed</em>

    :speech_balloon: ${
        reviewComments.length
            ? `${reviewComments.length} comment(s) require attention.`
            : `0 comments added :star: :star:`
    } 
    :hammer: ${commits} commit(s)
    :heavy_plus_sign: ${additions} additions
    :heavy_minus_sign: ${deletions} deletions
    :heavy_division_sign: ${changed_files} changed files
    `;

    try {
        await addComment(context, dedent(commentBody));
    } catch (error) {
        probotInstance.log.error(error);
    }
};
