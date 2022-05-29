const {
    common: {
        DirectImportRule,
        MarkedCommentsRule,
        SingleLineBlockRule,
        PositionedKeywordsRule,
        ValueComparisionStyleRule,
        KeywordsOrderedByLengthRule
    }
} = require('src/rules');

module.exports = [
    {
        enabled: false,
        reference: DirectImportRule,
        config: {
            packages: [
                {
                    name: 'lodash',
                    expression: /[(|']lodash.*/
                }
            ]
        }
    },
    {
        enabled: false,
        reference: MarkedCommentsRule,
        config: {
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
        }
    },
    {
        enabled: false,
        reference: KeywordsOrderedByLengthRule,
        config: {
            keywords: [
                {
                    name: 'import (packages)',
                    regex: /import(?!.*@).*/,
                    multiLineOptions: ['from'],
                    order: 'ascending',
                    ignoreNewline: false
                },
                {
                    name: 'import (components)',
                    regex: /import.*@\/components.*/,
                    multiLineOptions: ['from'],
                    order: 'ascending',
                    ignoreNewline: false
                }
            ]
        }
    },
    {
        enabled: false,
        reference: PositionedKeywordsRule,
        config: {
            keywords: [
                {
                    name: 'const',
                    regex: /const.*require.*/,
                    multiLineOptions: ['require'],
                    position: {
                        custom: null,
                        BOF: true
                    },
                    maxLineBreaks: 1,
                    enforced: true,
                    breakOnFirstOccurence: false,
                    countDifferentCodeAsLineBreak: false
                }
            ]
        }
    },
    {
        enabled: false,
        reference: SingleLineBlockRule,
        config: {
            blocks: [
                {
                    name: 'if',
                    expression: /^[\s]*(?:if).*[(].*[)].*/
                },
                {
                    name: 'else if',
                    expression: /^[{}]?[\s]*(?:else if).*[(].*[)].*/
                },
                {
                    name: 'else',
                    expression: /^(?:[{}].*(?:else)).*|^(?:else).*/
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
        }
    },
    {
        enabled: false,
        reference: ValueComparisionStyleRule,
        config: {
            allowedLevels: [2]
        }
    }
];
