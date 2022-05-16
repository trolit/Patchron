const {
    pull: { StrictWorkflowRule }
} = require('../rules');

module.exports = [
    {
        enabled: false,
        reference: StrictWorkflowRule,
        config: {
            enabled: false,
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
                    head: 'develop'
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
            abortReviewOnInvalidBranchPrefix: false,
            abortReviewOnInvalidFlow: true
        }
    }
];
