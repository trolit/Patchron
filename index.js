// **************************************************
// *: Pepega.js (2022)
// *: made with Probot
// *: my heart: https://github.com/trolit/Pepega
// **************************************************

/**
 *
 * ?: Deployments API example (learn more)
 * https://developer.github.com/v3/repos/deployments/
 *
 * ?: For more information on building apps:
 * https://probot.github.io/docs/
 *
 * ?: To get your app running against GitHub, see:
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

const getFiles = require('./pepega/github/getFiles');
const { rules, settings } = require('./pepega/config');
const printBotName = require('./pepega/helpers/printBotName');
const postSummary = require('./pepega/pull-request/postSummary');
const reviewPullRequest = require('./pepega/pull-request/review');
const postComments = require('./pepega/pull-request/postComments');
const initializeData = require('./pepega/pull-request/initialize');
const resolveStrictWorkflow = require('./pepega/pull-request/resolveStrictWorkflow');
const addPullSenderAsAssignee = require('./pepega/pull-request/addSenderAsAssignee');

/**
 * This is the main entrypoint of Pepega Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
    printBotName();

    const {
        isOwnerAssigningEnabled,
        isReviewSummaryEnabled,
        strictWorkflow,
        delayBetweenCommentRequestsInSeconds,
    } = settings;

    global.probotInstance = app;

    app.on(
        ['pull_request.opened', 'pull_request.synchronize'],
        async (context) => {
            const { payload, repo } = initializeData(context);

            if (strictWorkflow.enabled) {
                const isReviewAborted = resolveStrictWorkflow(
                    context,
                    payload,
                    rules,
                    strictWorkflow
                );

                if (isReviewAborted) {
                    return;
                }
            }

            if (isOwnerAssigningEnabled) {
                addPullSenderAsAssignee(context, repo, payload);
            }

            let files = null;

            try {
                files = await getFiles(context, repo);

                const reviewComments = reviewPullRequest(repo, files);

                if (reviewComments.length) {
                    postComments(
                        context,
                        reviewComments,
                        delayBetweenCommentRequestsInSeconds
                    );
                }

                if (isReviewSummaryEnabled) {
                    postSummary(context, reviewComments, payload);
                }
            } catch (error) {
                app.log.error(error);
            }
        }
    );
};
