const strictWorkflow = require('../rules/pull/StrictWorkflow');
const noUnmarkedComments = require('../rules/common/NoUnmarkedComments');

require('dotenv').config({
    path: '../../.env',
});

module.exports = {
    env: {},
    settings: {
        isGetFilesRequestPaginated: false,
        delayBetweenCommentRequestsInSeconds: 3,
        isOwnerAssigningEnabled: true,
        isReviewSummaryEnabled: true,
        strictWorkflow: {
            enabled: true,
            abortReviewOnInvalidBranchPrefix: false,
            abortReviewOnInvalidFlow: true,
        },
    },
    rules: {
        pull: {
            strictWorkflow: new strictWorkflow({
                workflow: [
                    {
                        base: 'master',
                        head: 'release',
                    },
                    {
                        base: 'develop',
                        head: 'release',
                    },
                    {
                        base: 'develop',
                        head: 'feature',
                    },
                    {
                        base: 'master',
                        head: 'develop',
                    },
                    {
                        base: 'master',
                        head: 'hotfix',
                    },
                    {
                        base: 'develop',
                        head: 'hotfix',
                    },
                ],
            }),
        },
        files: {
            common: [],
            js: [
                {
                    instance: new noUnmarkedComments({
                        prefixes: [
                            {
                                value: 'TODO:',
                                meaning: 'needs to be implemented',
                            },
                            {
                                value: '*:',
                                meaning: 'important note',
                            },
                            {
                                value: '!:',
                                meaning: 'to be removed',
                            },
                            {
                                value: '?:',
                                meaning: 'suggestion',
                            },
                            {
                                value: 'TMP:',
                                meaning: 'temporary solution',
                            },
                        ],
                        isAppliedToSingleLineComments: true,
                        isAppliedToMultiLineComments: true,
                        isAppliedToInlineComments: true,
                    }),
                },
            ],
        },
    },
};
