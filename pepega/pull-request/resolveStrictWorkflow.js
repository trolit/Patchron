const addComment = require('../github/addComment');

/**
 * validates pull requested branch against strict workflow rule and posts comment (if needed).
 * @param {WebhookEvent<EventPayloads.WebhookPayloadPullRequest>} context WebhookEvent instance.
 * @param {object} payload hooked PR data
 * @param {object} rules config rules object
 * @param {object} strictWorkflow strict workflow config
 * @returns {boolean} flag if review should be continued or not
 */
module.exports = async (context, payload, rules, strictWorkflow) => {
    const comment = rules.pull['strictWorkflow'].invoke(payload);

    let isReviewAborted = false;

    if (comment.reason === 'prefix') {
        isReviewAborted = strictWorkflow.abortReviewOnInvalidBranchPrefix;
    } else if (comment.reason === 'flow') {
        isReviewAborted = strictWorkflow.abortReviewOnInvalidFlow;
    }

    try {
        await addComment(context, comment.body);
    } catch (error) {
        probotInstance.log.error(error);
    }

    return isReviewAborted;
};
