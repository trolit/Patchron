const noUnmarkedComments = require('../rules/common/NoUnmarkedComments');
const keywordsOrderedByLength = require('../rules/common/KeywordsOrderedByLength');

module.exports = [
    {
        enabled: false,
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
    {
        enabled: true,
        instance: new keywordsOrderedByLength({
            keywords: [
                {
                    name: 'import',
                    regex: /import.*/,
                    order: 'ascending',
                    ignoreNewline: false,
                },
                {
                    name: 'const',
                    regex: /const.*/,
                    order: 'ascending',
                    ignoreNewline: false,
                },
            ],
        }),
    },
];
