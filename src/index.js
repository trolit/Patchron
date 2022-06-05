// ***********************************************************************
// *
// * Detective Pepega (made with Probot)
// * https://github.com/trolit/Pepega/
// *
// ***********************************************************************

require('module-alias/register');
const cloneDeep = require('lodash/cloneDeep');

const {
    settings: { senders, isOwnerAssigningEnabled, isReviewSummaryEnabled }
} = require('./config');
const addAssignees = require('./github/addAssignees');
const PepegaContext = require('./builders/PepegaContext');
const postSummary = require('./pull-request/postSummary');
const reviewFiles = require('./pull-request/reviewFiles');
const postComments = require('./pull-request/postComments');
const reviewContext = require('./pull-request/reviewContext');

/**
 * @param {ProbotApp} app
 */
module.exports = (app) => {
    const pepegaContext = new PepegaContext(app);

    app.on(
        ['pull_request.opened', 'pull_request.synchronize'],
        async (context) => {
            pepegaContext.initializePullRequestData(context);

            const {
                pullRequest: { owner }
            } = pepegaContext;

            if (isOwnerAssigningEnabled) {
                await addAssignees(pepegaContext, [owner]);
            }

            if (senders?.length && !senders.includes(owner)) {
                return;
            }

            const reviewComments = cloneDeep(reviewContext(pepegaContext));

            if (!isReviewAborted(reviewComments)) {
                reviewComments.push(...reviewFiles(pepegaContext));

                const numberOfPostedComments = postComments(
                    pepegaContext,
                    reviewComments
                );

                if (isReviewSummaryEnabled) {
                    await postSummary(
                        pepegaContext,
                        numberOfPostedComments,
                        reviewComments
                    );
                }
            }
        }
    );
};

function isReviewAborted(reviewComments) {
    return (
        reviewComments.length &&
        reviewComments.some((comment) => comment.isReviewAborted)
    );
}
