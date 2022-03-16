const timer = require('../helpers/loopTimer');
const addMultiLineReviewComment = require('../github/addMultiLineReviewComment');
const addSingleLineReviewComment = require('../github/addSingleLineReviewComment');

/**
 * **POST** review comments to GitHub
 * @param {WebhookEvent<EventPayloads.WebhookPayloadPullRequest>} context WebhookEvent instance.
 * @param {Array<object>} reviewComments
 * @param {number} delayBetweenCommentRequestsInSeconds
 * @param {number} maxCommentsPerReview
 * @returns {number} number of comments successfully posted to the GitHub
 */
module.exports = async (
    context,
    reviewComments,
    delayBetweenCommentRequestsInSeconds,
    maxCommentsPerReview
) => {
    let numberOfPostedComments = 0;

    if (maxCommentsPerReview <= 0) {
        probotInstance.log.warn(
            'Invalid value set on maxCommentsPerReview setting. No comments posted.'
        );

        return numberOfPostedComments;
    }

    for (let i = 0; i < reviewComments.length; i++) {
        if (numberOfPostedComments >= maxCommentsPerReview) {
            probotInstance.log.warn(
                `Did not post more comments due to limit reach (${maxCommentsPerReview}).`
            );

            break;
        }

        const reviewComment = reviewComments[i];

        if (reviewComment.start_line) {
            try {
                await addMultiLineReviewComment(context, {
                    ...reviewComment,
                });

                numberOfPostedComments++;
            } catch (error) {
                probotInstance.log.error(error);
            }
        } else if (reviewComment.line) {
            try {
                await addSingleLineReviewComment(context, {
                    ...reviewComment,
                });

                numberOfPostedComments++;
            } catch (error) {
                probotInstance.log.error(error);
            }
        }

        await timer(delayBetweenCommentRequestsInSeconds * 1000);
    }

    return numberOfPostedComments;
};
