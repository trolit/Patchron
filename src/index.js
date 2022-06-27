// ***********************************************************************
// *
// * Patchron 2022 (made with Probot)
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
const debugRule = require('./helpers/debugRule');

/**
 * @param {ProbotApp} app
 */
module.exports = (app) => {
    const patchronContext = new PatchronContext(app);

    debugRule(
        'SimplePropertyAssignmentRule',
        {},
        {
            splitPatch: [
                `@@ -10,13 +10,5 @@`,
                `+const objectA = { filter0, filter1: filter1 };`,
                `+const objectB = { filter0: filter0, filter1 };`,
                `+const objectC = {`,
                `+    filter1,`,
                `+    filter2: filter2,`,
                `+    rules: result.filter(element => element.type === 'result')`,
                `+};`,
                `+`,
                ` const objectD = {`,
                `     property1: property1,`,
                `     property2: 'hello',`,
                `     property3,`,
                ` };`,
                `-`,
                `-const objectE = {`,
                `-    property1: property1,`,
                `-    property2: property2,`,
                `-    property3: property3,`,
                `-};`
            ]
        },
        patchronContext
    );

    app.on(
        ['pull_request.opened', 'pull_request.synchronize'],
        async (context) => {
            patchronContext.initializePullRequestData(context);

            const {
                pullRequest: { owner }
            } = patchronContext;

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
