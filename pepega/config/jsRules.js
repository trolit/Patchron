const PositionedKeywords = require('../rules/common/PositionedKeywords');
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
        enabled: false,
        instance: new keywordsOrderedByLength({
            keywords: [
                {
                    name: 'import',
                    regex: /import.*/,
                    multilineOptions: ['from'],
                    order: 'ascending',
                    ignoreNewline: false,
                },
            ],
        }),
    },
    {
        enabled: false,
        instance: new PositionedKeywords({
            keywords: [
                {
                    name: 'const',
                    regex: /const.*require.*/,
                    multilineOptions: ['require'],
                    position: {
                        custom: null,
                        BOF: true,
                        EOF: false,
                    },
                    maxLineBreaks: 1,
                    enforced: true,
                    breakOnFirstOccurence: false,
                },
            ],
        }),
    },
];
