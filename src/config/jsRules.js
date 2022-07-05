const {
    common: {
        DirectImportRule,
        MarkedCommentRule,
        SingleLineBlockRule,
        PositionedKeywordsRule,
        PredefinedFilenameRule,
        LineBreakBeforeReturnRule,
        KeywordsOrderedByLengthRule,
        ComparisionOperatorLevelRule,
        FixedLoopLengthConditionRule
    },
    js: {
        SimpleComparisionRule,
        AsynchronousPatternRule,
        ImportWithoutExtensionRule,
        ImplicitIndexFileImportRule,
        SimplePropertyAssignmentRule
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
                    expression: /[(|'|"|`]lodash[)|'|"|`]/
                }
            ]
        }
    },
    {
        enabled: false,
        reference: FixedLoopLengthConditionRule,
        config: {
            expression: /(\w+).length/
        }
    },
    {
        enabled: false,
        reference: MarkedCommentRule,
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
        reference: ComparisionOperatorLevelRule,
        config: {
            allowedLevels: [2]
        }
    },
    {
        enabled: false,
        reference: LineBreakBeforeReturnRule
    },
    {
        enabled: false,
        reference: ImportWithoutExtensionRule,
        config: {
            type: 'commonjs'
        }
    },
    {
        enabled: false,
        reference: ImplicitIndexFileImportRule,
        config: {
            type: 'commonjs'
        }
    },
    {
        enabled: false,
        reference: AsynchronousPatternRule,
        config: {
            pattern: 'await'
        }
    },
    {
        enabled: false,
        reference: SimplePropertyAssignmentRule,
        config: {}
    },
    {
        enabled: false,
        reference: PredefinedFilenameRule,
        config: {
            restrictions: [
                {
                    path: 'backend/controllers/*',
                    expectedName: /.*Controller.js/
                }
            ]
        }
    },
    {
        enabled: false,
        reference: SimpleComparisionRule,
        config: {
            patterns: [
                {
                    name: 'eq/ne (true, false)',
                    expression: /(!={1,2}|={2,3})(\s)*?(true|false)/,
                    comment: `
                    \`value === true\`, \`value !== false\` -> \`value\`
                    \`value === false\`, \`value !== true\` -> \`!value\`
                    `,
                    multiLineOptions: [
                        {
                            indicator: {
                                endsWith: '='
                            },
                            limiter: 'nextLine'
                        }
                    ]
                },
                {
                    name: 'eq/ne (null, undefined)',
                    expression: /(!={1,2}|={2,3})(\s)*?(null|undefined)/,
                    comment: `
                    \`value === null/undefined\` -> \`!value\`
                    \`value !== null/undefined\` -> \`!!value\`, \`value\`
                    `,
                    multiLineOptions: [
                        {
                            indicator: {
                                endsWith: '='
                            },
                            limiter: 'nextLine'
                        }
                    ]
                },
                {
                    name: 'ne (-1)',
                    expression: /!={1,2}(\s)*?-1/,
                    comment: `
                    \`value !== -1\` -> \`~value\`
                    `
                }
            ]
        }
    }
];
