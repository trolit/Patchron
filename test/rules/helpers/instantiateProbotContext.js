const { Context } = require('probot');

module.exports = (
    patchronContext,
    event = {
        id: 0,
        name: '',
        payload: { pull_request: { head: { ref: '' }, base: { ref: '' } } }
    }
) => {
    const context = new Context({
        id: 123,
        name: 'push',
        ...event
    });

    patchronContext.pullRequest.context = context;
};
