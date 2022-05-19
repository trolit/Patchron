const dedent = require('dedent-js');
const addComment = require('../github/addComment');

/**
 * **POST** pull request review summary
 * @param {PepegaContext} pepegaContext
 * @param {number} successfullyPostedComments number of comments posted to the GitHub
 */
module.exports = async (
    pepegaContext,
    successfullyPostedComments,
    reviewComments
) => {
    const { pullRequest, log } = pepegaContext;
    const { pull_request } = pullRequest.context.payload;
    const { commits, additions, deletions, changed_files } = pull_request;

    const unpostedComments = reviewComments.length - successfullyPostedComments;
    const postedCommentsStatus = `:warning: ${unpostedComments} comments were not posted. Check logs for details.`;

    const commentBody = `<em>pull request review completed</em>

    ${unpostedComments > 0 ? postedCommentsStatus : ' '}
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
        await addComment(pepegaContext, dedent(commentBody));
    } catch (error) {
        log.fatal(error);
    }
};
