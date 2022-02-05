// **************************************************
// *: Pepega-The-Detective
// *: made with Probot framework
// *: https://github.com/trolit/Pepega
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
 * ?: GitHub API - best practices
 * https://docs.github.com/en/rest/guides/best-practices-for-integrators
 *
 */

const { rules } = require('./pepega/config');
const Pepega = require('./pepega/Pepega');
const getFiles = require('./pepega/requests/getFiles');
const printBotName = require('./pepega/helpers/printBotName');
const addMultiLineReviewComment = require('./pepega/requests/addMultiLineReviewComment');
const addSingleLineReviewComment = require('./pepega/requests/addSingleLineReviewComment');

/**
 * This is the main entrypoint of Pepega Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
    printBotName();

    global.probotInstance = app;

    app.on(
        ['pull_request.opened', 'pull_request.synchronize'],
        async (context) => {
            const payload = context.payload;

            const repo = context.repo();

            repo.pull_number = payload.number;

            let files = null;

            try {
                files = await getFiles(context, repo);
            } catch (error) {
                app.log.error(error);
            }

            let reviewComments = [];

            for (let i = 0; i < files.length; i++) {
                const file = { ...files[i], ...repo };

                const comments = Pepega.investigate(file).against(rules);

                reviewComments = [...reviewComments, ...comments];
            }

            for (let i = 0; i < reviewComments.length; i++) {
                const reviewComment = reviewComments[i];

                if (reviewComment.start_line) {
                    try {
                        await addMultiLineReviewComment(context, {
                            ...reviewComment,
                        });
                    } catch (error) {
                        app.log.error(error);
                    }
                } else if (reviewComment.line) {
                    try {
                        await addSingleLineReviewComment(context, {
                            ...reviewComment,
                        });
                    } catch (error) {
                        app.log.error(error);
                    }
                }
            }
        }
    );
};
