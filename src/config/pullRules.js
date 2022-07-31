const {
    pull: { StrictWorkflowRule }
} = require('src/rules');

module.exports = [
    {
        enabled: true,
        reference: StrictWorkflowRule,
        config: {
            workflow: [
                {
                    base: 'master',
                    head: 'release'
                },
                {
                    base: 'develop',
                    head: 'release'
                },
                {
                    base: 'develop',
                    head: 'feature'
                },
                {
                    base: 'master',
                    head: 'hotfix'
                },
                {
                    base: 'develop',
                    head: 'hotfix'
                }
            ],
            abortReviewOnInvalidFlow: false,
            abortReviewOnInvalidBranchPrefix: false
        }
    }
];
