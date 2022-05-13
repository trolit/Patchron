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

const getFiles = require('./github/getFiles');
const { rules, settings } = require('./config');
const postSummary = require('./pull-request/postSummary');
const reviewPullRequest = require('./pull-request/review');
const postComments = require('./pull-request/postComments');
const initializeData = require('./pull-request/initialize');
const configureLogger = require('./utilities/configureLogger');
const resolveStrictWorkflow = require('./pull-request/resolveStrictWorkflow');
const addPullSenderAsAssignee = require('./pull-request/addSenderAsAssignee');

/**
 * This is the main entrypoint of Pepega Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
    const {
        senders,
        maxCommentsPerReview,
        isReviewSummaryEnabled,
        isOwnerAssigningEnabled,
        delayBetweenCommentRequestsInSeconds
    } = settings;

    configureLogger(app);

    app.on(
        ['pull_request.opened', 'pull_request.synchronize'],
        async (context) => {
            const { pullRequestOwner, payload, repo } = initializeData(context);

            if (senders?.length && !senders.includes(pullRequestOwner)) {
                return;
            }

            if (rules?.pull) {
                const isReviewAborted = resolveStrictWorkflow(
                    context,
                    payload,
                    rules
                );

                if (isReviewAborted) {
                    return;
                }
            }

            if (isOwnerAssigningEnabled) {
                addPullSenderAsAssignee(context, repo, pullRequestOwner);
            }

            try {
                const files = await getFiles(context, repo);

                const reviewComments = reviewPullRequest(repo, files, rules);

                let successfullyPostedComments = 0;

                if (reviewComments.length) {
                    successfullyPostedComments = await postComments(
                        context,
                        reviewComments,
                        delayBetweenCommentRequestsInSeconds,
                        maxCommentsPerReview
                    );
                }

                if (isReviewSummaryEnabled) {
                    postSummary(
                        context,
                        successfullyPostedComments,
                        reviewComments,
                        payload
                    );
                }
            } catch (error) {
                app.log.error(error);
            }
        }
    );
};