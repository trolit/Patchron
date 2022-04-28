const {
    common: {
        SingleLineBlockRule,
        PositionedKeywordsRule,
        NoUnmarkedCommentsRule,
        KeywordsOrderedByLengthRule
    }
} = require('../rules');

module.exports = [
    {
        enabled: false,
        instance: new NoUnmarkedCommentsRule({
            prefixes: [
                {
                    value: 'TODO:',
                    meaning: 'needs to be implemented'
                },
                {
                    value: '*:',
                    meaning: 'important note'
                },
                {
                    value: '!:',
                    meaning: 'to be removed'
                },
                {
                    value: '?:',
                    meaning: 'suggestion'
                },
                {
                    value: 'TMP:',
                    meaning: 'temporary solution'
                }
            ],
            isAppliedToSingleLineComments: true,
            isAppliedToMultiLineComments: true,
            isAppliedToInlineComments: true
        })
    },
    {
        enabled: false,
        instance: new KeywordsOrderedByLengthRule({
            keywords: [
                {
                    name: 'import (packages)',
                    regex: /import(?!.*@).*/,
                    multilineOptions: ['from'],
                    order: 'ascending',
                    ignoreNewline: false
                },
                {
                    name: 'import (components)',
                    regex: /import.*@\/components.*/,
                    multilineOptions: ['from'],
                    order: 'ascending',
                    ignoreNewline: false
                }
            ]
        })
    },
    {
        enabled: false,
        instance: new PositionedKeywordsRule({
            keywords: [
                {
                    name: 'const',
                    regex: /const.*require.*/,
                    multilineOptions: ['require'],
                    position: {
                        custom: null,
                        BOF: true,
                        EOF: false
                    },
                    maxLineBreaks: 1,
                    enforced: true,
                    breakOnFirstOccurence: false
                }
            ]
        })
    },
    {
        enabled: false,
        instance: new SingleLineBlockRule({
            blocks: [
                {
                    name: 'if',
                    expression: /^[\s]*(?:if).*[(].*[)].*/
                },
                {
                    name: 'else if',
                    expression: /^[{]?[\s]*(?:else if).*[(].*[)].*/
                },
                {
                    name: 'else',
                    expression: /^(?:[{].*(?:else)).*|^(?:else).*/
                },
                {
                    name: 'for',
                    expression: /^[\s]*(?:for).*[(].*[)].*/
                },
                {
                    name: 'do..while',
                    expression: /^[\s]*(?:do).*/,
                    endIndicator: /while/
                },
                {
                    name: 'while',
                    expression: /^[\s]*(?:while).*[(].*[)].*/
                }
            ],
            curlyBraces: true
        })
    }
];
