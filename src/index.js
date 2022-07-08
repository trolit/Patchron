// ***********************************************************************
// *
// * Patchron 18.01.2022 (made with Probot)
// * https://github.com/trolit/Patchron/
// *
// ***********************************************************************

require('module-alias/register');
const cloneDeep = require('lodash/cloneDeep');

const {
    settings: { senders, isOwnerAssigningEnabled, isReviewSummaryEnabled }
} = require('./config');
const addAssignees = require('./github/addAssignees');
const postSummary = require('./pull-request/postSummary');
const reviewFiles = require('./pull-request/reviewFiles');
const postComments = require('./pull-request/postComments');
const PatchronContext = require('./builders/PatchronContext');
const reviewContext = require('./pull-request/reviewContext');

/**
 * @param {ProbotApp} app
 */
module.exports = (app) => {
    const patchronContext = new PatchronContext(app);

    app.on(
        ['pull_request.opened', 'pull_request.synchronize'],
        async (context) => {
            patchronContext.initializePullRequestData(context);

            const {
                pullRequest: { owner }
            } = context;

            if (isOwnerAssigningEnabled) {
                await addAssignees(patchronContext, [owner]);
            }

            if (senders?.length && !senders.includes(owner)) {
                return;
            }

            const reviewComments = cloneDeep(reviewContext(patchronContext));

            if (!isReviewAborted(reviewComments)) {
                reviewComments.push(...reviewFiles(patchronContext));

                const numberOfPostedComments = postComments(
                    patchronContext,
                    reviewComments
                );

                if (isReviewSummaryEnabled) {
                    await postSummary(
                        patchronContext,
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
