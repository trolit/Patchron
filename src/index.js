// ***********************************************************************
// *
// * Patchron
// * 18.01.2022
// * v1.0.0 - 31.07.2022
// * https://github.com/trolit/Patchron/
// * -made with Probot
// *
// ***********************************************************************

require('module-alias/register');

const {
    rules: { pull: pullRules },
    settings: {
        senders,
        isReviewSummaryEnabled,
        isOwnerAssigningEnabled,
        approvePullOnEmptyReviewComments
    }
} = require('./config');

const review = require('./rules/review');
const getFiles = require('./github/getFiles');
const approvePull = require('./github/createReview');
const addAssignees = require('./github/addAssignees');
const postSummary = require('./pull-request/postSummary');
const reviewFiles = require('./pull-request/reviewFiles');
const postComments = require('./pull-request/postComments');
const PatchronContext = require('./builders/PatchronContext');

/**
 * @param {ProbotApp} app
 */
module.exports = (app) => {
    const patchronContext = new PatchronContext(app);

    app.on(['pull_request.opened'], async (context) => {
        patchronContext.initializePullRequestData(context);

        const { owner } = context.pullRequest();

        if (senders?.length && !senders.includes(owner)) {
            return;
        }

        if (isOwnerAssigningEnabled) {
            await addAssignees(patchronContext, [owner]);
        }

        const reviewComments = review(patchronContext, pullRules);
        const isReviewAborted = _isReviewAborted(reviewComments);

        if (!isReviewAborted) {
            const files = await getFiles(patchronContext);

            reviewComments.push(...reviewFiles(patchronContext, files));
        }

        const numberOfPostedComments = await postComments(
            patchronContext,
            reviewComments
        );

        if (isReviewSummaryEnabled) {
            await postSummary(
                patchronContext,
                reviewComments,
                numberOfPostedComments,
                isReviewAborted
            );
        }

        if (approvePullOnEmptyReviewComments && !reviewComments.length) {
            await approvePull(patchronContext, { event: 'APPROVE' });
        }
    });
};

function _isReviewAborted(reviewComments) {
    return (
        reviewComments.length &&
        reviewComments.some((comment) => comment.isReviewAborted)
    );
}
