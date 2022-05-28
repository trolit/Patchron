// ***********************************************************************
// *
// * PROBOT
// * ██████  ███████ ██████  ███████  ██████   █████          ██ ███████
// * ██   ██ ██      ██   ██ ██      ██       ██   ██         ██ ██
// * ██████  █████   ██████  █████   ██   ███ ███████         ██ ███████
// * ██      ██      ██      ██      ██    ██ ██   ██    ██   ██      ██
// * ██      ███████ ██      ███████  ██████  ██   ██ ██  █████  ███████
// * https://github.com/trolit/Pepega/                    Y2022, @trolit
// *
// ***********************************************************************

/**
 *
 * ?: Deployments API example (learn more)
 * https://developer.github.com/v3/repos/deployments/
 *
 * ?: For more information on building apps:
 * https://probot.github.io/docs/
 *
 * ?: To get your app running, see:
 * https://probot.github.io/docs/development/
 *
 * ?: GitHub Rest API - best practices
 * https://docs.github.com/en/rest/guides/best-practices-for-integrators
 *
 * ?: GitHub Rest API - rate limits
 * https://docs.github.com/en/developers/apps/building-github-apps/rate-limits-for-github-apps
 *
 * ?: GitHub Rest API - pulls
 * https://docs.github.com/en/rest/reference/pulls
 *
 */

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
