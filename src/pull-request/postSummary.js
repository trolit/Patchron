const dedent = require('dedent-js');
const {
    settings: { maxCommentsPerReview }
} = require('src/config');
const addComment = require('src/github/addComment');

/**
 * **POST** pull request review summary
 *
 * @param {PatchronContext} patchronContext
 * @param {Array<object>} reviewComments
 * @param {number} successfullyPostedComments number of comments posted to the GitHub
 * @param {boolean} isReviewAborted
 */
module.exports = async (
    patchronContext,
    reviewComments,
    successfullyPostedComments,
    isReviewAborted
) => {
    const { pullRequest, log } = patchronContext;
    const { pull_request } = pullRequest.context.payload;
    const { commits, additions, deletions, changed_files } = pull_request;

    const unpostedComments = reviewComments.length - successfullyPostedComments;
    const unpostedCommentsStatus = `⚠️ ${unpostedComments} comment(s) were not posted. (Limit per PR: ${maxCommentsPerReview})`;

    const title = `pull request review ${
        isReviewAborted ? 'aborted 😥' : 'completed ✅'
    }`;

    const commentBody = `<em>${title}</em>

    ${unpostedComments > 0 ? unpostedCommentsStatus : ' '}
    :speech_balloon: ${
        reviewComments.length
            ? `${reviewComments.length} comment(s) require attention.`
            : `0 comments added :star: :star:`
    }
    🔨 ${commits} commit(s)
    ➕ ${additions} additions
    ➖ ${deletions} deletions
    ➗ ${changed_files} changed files
    `;

    try {
        await addComment(patchronContext, dedent(commentBody));
    } catch (error) {
        log.fatal(error);
    }
};
