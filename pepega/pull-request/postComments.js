const timer = require('../helpers/loopTimer');
const addMultiLineReviewComment = require('../requests/addMultiLineReviewComment');
const addSingleLineReviewComment = require('../requests/addSingleLineReviewComment');

/**
 * **POST** review comments
 * @param {WebhookEvent<EventPayloads.WebhookPayloadPullRequest>} context WebhookEvent instance.
 * @param {Array<object>} reviewComments
 * @param {number} delayBetweenCommentRequestsInSeconds
 */
module.exports = async (
    context,
    reviewComments,
    delayBetweenCommentRequestsInSeconds
) => {
    for (let i = 0; i < reviewComments.length; i++) {
        const reviewComment = reviewComments[i];

        if (reviewComment.start_line) {
            try {
                await addMultiLineReviewComment(context, {
                    ...reviewComment,
                });
            } catch (error) {
                probotInstance.log.error(error);
            }
        } else if (reviewComment.line) {
            try {
                await addSingleLineReviewComment(context, {
                    ...reviewComment,
                });
            } catch (error) {
                probotInstance.log.error(error);
            }
        }

        await timer(delayBetweenCommentRequestsInSeconds * 1000);
    }
};
