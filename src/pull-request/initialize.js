const setGlobalVariable = require('../helpers/setGlobalVariable');

/**
 * extracts data from context
 * @param {WebhookEvent<EventPayloads.WebhookPayloadPullRequest>} context WebhookEvent instance.
 * @returns {object} { pullRequestOwner, payload, repo }
 */
module.exports = (context) => {
    const payload = context.payload;

    const repo = context.repo();

    repo.pull_number = payload.number;

    setGlobalVariable('pullNumber', payload.number || undefined);

    const { login: pullRequestOwner } = payload.sender;

    return {
        pullRequestOwner,
        payload,
        repo
    };
};
