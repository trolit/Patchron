/**
 * extracts data from context
 * @param {WebhookEvent<EventPayloads.WebhookPayloadPullRequest>} context WebhookEvent instance.
 * @returns {object} { payload, repo }
 */
module.exports = (context) => {
    const payload = context.payload;

    const repo = context.repo();

    repo.pull_number = payload.number;

    return {
        payload,
        repo,
    };
};
