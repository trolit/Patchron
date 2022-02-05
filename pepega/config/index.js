const noUnmarkedComments = require('../rules/common/NoUnmarkedComments');

require('dotenv').config({
    path: '../../.env',
});

module.exports = {
    settings: {
        isGetFilesRequestPaginated: false,
        delayBetweenCommentRequestsInSeconds: 3,
        isOwnerAssigningEnabled: true,
        isReviewSummaryEnabled: true,
    },
    env: {},
    rules: {
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
};
