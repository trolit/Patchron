const addComment = require('../github/addComment');

/**
 * validates pull requested branch against strict workflow rule and posts comment (if needed).
 * @param {WebhookEvent<EventPayloads.WebhookPayloadPullRequest>} context WebhookEvent instance.
 * @param {object} payload hooked PR data
 * @param {object} rules config rules object
 * @returns {boolean} flag if review should be continued or not
 */
module.exports = async (context, payload, rules) => {
    const strictWorkflowRule = rules.pull['strictWorkflow'];

    if (!strictWorkflowRule) {
        return false;
    }

    const result = strictWorkflowRule.invoke(payload);

    if (!result) {
        return false;
    }

    const { body, isReviewAborted } = result;

    try {
        await addComment(context, body);
    } catch (error) {
        probotInstance.log.error(error);
    }

    return isReviewAborted;
};
