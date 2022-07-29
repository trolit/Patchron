const {
    settings: { maxCommentsPerReview, delayBetweenCommentRequestsInSeconds }
} = require('src/config');
const timer = require('src/helpers/loopTimer');
const addComment = require('src/github/addComment');
const addMultiLineReviewComment = require('src/github/addMultiLineReviewComment');
const addSingleLineReviewComment = require('src/github/addSingleLineReviewComment');

/**
 * **POST** review comments to GitHub.
 * When `reviewComment:`
 * - has `body`, it indicates that review comes from Pull Request Rule,
 * - has `start_line`, it indicates that it's file's multi-line comment,
 * - has `line`, it indicates that it's file's single-line comment.
 *
 * @param {PatchronContext} patchronContext
 * @param {Array<object>} reviewComments
 *
 * @returns {number} number of comments successfully posted to the GitHub
 */
module.exports = async (patchronContext, reviewComments) => {
    const { log } = patchronContext;
    let numberOfPostedComments = 0;

    if (maxCommentsPerReview <= 0) {
        log.warning(
            __filename,
            'Invalid value set on maxCommentsPerReview setting. No comments posted.'
        );

        return numberOfPostedComments;
    }

    const reviewCommentsLength = reviewComments.length;

    for (let i = 0; i < reviewCommentsLength; i++) {
        if (numberOfPostedComments >= maxCommentsPerReview) {
            log.information(
                __filename,
                `Did not post more comments due to limit reach (${maxCommentsPerReview}).`
            );

            break;
        }

        const reviewComment = reviewComments[i];

        try {
            if (reviewComment?.start_line) {
                await addMultiLineReviewComment(patchronContext, reviewComment);
            } else if (reviewComment?.line) {
                await addSingleLineReviewComment(
                    patchronContext,
                    reviewComment
                );
            } else if (reviewComment?.body) {
                const { body } = reviewComment;

                await addComment(patchronContext, body);
            }

            numberOfPostedComments++;
        } catch (error) {
            log.fatal(error);
        }

        await timer(delayBetweenCommentRequestsInSeconds * 1000);
    }

    return Promise.resolve(numberOfPostedComments);
};
