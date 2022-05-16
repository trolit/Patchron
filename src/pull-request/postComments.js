const {
    settings: { maxCommentsPerReview, delayBetweenCommentRequestsInSeconds }
} = require('../config');

const timer = require('../helpers/loopTimer');
const addComment = require('../github/addComment');
const addMultiLineReviewComment = require('../github/addMultiLineReviewComment');
const addSingleLineReviewComment = require('../github/addSingleLineReviewComment');

/**
 * **POST** review comments to GitHub.
 * When `reviewComment:`
 * - has `body`, it indicates that review comes from Pull Request Rule,
 * - has `start_line`, it indicates that it's file's multi-line comment,
 * - has `line`, it indicates that it's file's single-line comment.
 *
 * @param {import('../builders/PepegaContext')} pepegaContext
 * @param {Array<object>} reviewComments
 * @returns {number} number of comments successfully posted to the GitHub
 */
module.exports = async (pepegaContext, reviewComments) => {
    const { log } = pepegaContext;
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
            if (reviewComment?.body) {
                const { body } = reviewComment;

                await addComment(pepegaContext, body);
            } else if (reviewComment?.start_line) {
                await addMultiLineReviewComment(pepegaContext, reviewComment);
            } else if (reviewComment?.line) {
                await addSingleLineReviewComment(pepegaContext, reviewComment);
            }

            numberOfPostedComments++;
        } catch (error) {
            log.fatal(error);
        }

        await timer(delayBetweenCommentRequestsInSeconds * 1000);
    }

    return numberOfPostedComments;
};
