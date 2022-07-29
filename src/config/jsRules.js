const {
    common: {
        MarkedCommentsRule,
        PositionedKeywordsRule,
        PredefinedFilenamesRule,
        LineBreakBeforeReturnRule,
        IndividualMethodImportRule,
        SingleLineBlockPatternRule,
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
        enabled: true,
        reference: MarkedCommentsRule,
        config: {
            prefixes: [
                {
                    value: '@TODO:',
                    meaning: 'not implemented feature'
                },
                {
                    value: '@TMP:',
                    meaning: 'temporary solution'
                },
                {
                    value: '@NOTE:',
                    meaning: 'information about package/code'
                }
            ],
            isAppliedToSingleLineComments: true,
            isAppliedToMultiLineComments: true,
            isAppliedToInlineComments: true
        }
    },

    {
        enabled: true,
        reference: PositionedKeywordsRule,
        config: {
            keywords: [
                {
                    name: 'require',
                    regex: /const.*(?:require|{)/,
                    position: {
                        BOF: true,
                        custom: null
                    },
                    enforced: true,
                    maxLineBreaks: 0,
                    breakOnFirstOccurence: false,
                    countDifferentCodeAsLineBreak: false,
                    multiLineOptions: [
                        {
                            indicator: {
                                notIncludes: 'require'
                            },
                            limiter: {
                                startsWith: '} = require',
                                indentation: 'eq-indicator'
                            }
                        }
                    ],
                    order: [
                        {
                            name: 'packages',
                            expression: /require(?!.*@).*/
                        },
                        {
                            name: 'other',
                            expression: /require.*/
                        }
                    ]
                }
            ]
        }
    },

    {
        enabled: true,
        reference: PredefinedFilenamesRule,
        config: {
            restrictions: [
                {
                    path: 'backend/src/controllers/*',
                    expectedName: /.*Controller.js/
                }
            ]
        }
    },

    {
        enabled: true,
        reference: LineBreakBeforeReturnRule
    },

    {
        enabled: true,
        reference: IndividualMethodImportRule,
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
        enabled: true,
        reference: SingleLineBlockPatternRule,
        config: {
            blocks: [
                {
                    name: 'for',
                    expression: /for.*\(.*\)/,
                    countAsSingleLineBlockWhenNoBraces: true
                },
                {
                    name: 'for',
                    expression: /^for(\s)+\($/,
                    multiLineOptions: [
                        {
                            limiter: {
                                startsWith: ')',
                                indentation: 'le-indicator'
                            }
                        }
                    ]
                },
                {
                    name: 'do..while',
                    expression: /^[\s]*(?:do).*/,
                    multiLineOptions: [
                        {
                            limiter: {
                                includes: 'while',
                                indentation: 'le-indicator',
                                testInIndicator: true
                            }
                        }
                    ]
                },
                {
                    name: 'if',
                    expression: /if.*\(.*\)/,
                    countAsSingleLineBlockWhenNoBraces: true
                },
                {
                    name: 'if',
                    expression: /^if(\s)+\($/,
                    multiLineOptions: [
                        {
                            limiter: {
                                startsWith: ')',
                                indentation: 'le-indicator'
                            }
                        }
                    ]
                },
                {
                    name: 'else if',
                    expression: /(?:else if).*\(.*\)/,
                    countAsSingleLineBlockWhenNoBraces: true
                },
                {
                    name: 'else if',
                    expression: /^(?:else if)(\s)+\($/,
                    multiLineOptions: [
                        {
                            limiter: {
                                startsWith: ')',
                                indentation: 'le-indicator'
                            }
                        }
                    ]
                },
                {
                    name: 'else',
                    expression: /^else.*/,
                    countAsSingleLineBlockWhenNoBraces: true
                },
                {
                    name: 'while',
                    expression: /while.*\(.*\)/,
                    countAsSingleLineBlockWhenNoBraces: true
                },
                {
                    name: 'while',
                    expression: /^while(\s)+\($/,
                    multiLineOptions: [
                        {
                            limiter: {
                                startsWith: ')',
                                indentation: 'le-indicator'
                            }
                        }
                    ]
                }
            ],
            curlyBraces: true
        }
    },

    {
        enabled: true,
        reference: KeywordsOrderedByLengthRule,
        config: {
            keywords: [
                {
                    name: 'require (packages)',
                    regex: /require(?!.*@).*/,
                    order: 'ascending',
                    ignoreNewline: false
                },
                {
                    name: 'require (other)',
                    regex: /require.*@.*/,
                    order: 'ascending',
                    ignoreNewline: false
                }
            ]
        }
    },

    {
        enabled: true,
        reference: ComparisionOperatorLevelRule,
        config: {
            allowedLevels: [1, 2]
        }
    },

    {
        enabled: true,
        reference: FixedLoopLengthConditionRule,
        config: {
            expression: /(\w+).length/
        }
    },

    {
        enabled: true,
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
    },

    {
        enabled: true,
        reference: AsynchronousPatternRule,
        config: {
            pattern: 'await'
        }
    },

    {
        enabled: true,
        reference: ImportWithoutExtensionRule,
        config: {
            type: 'commonjs'
        }
    },

    {
        enabled: true,
        reference: ImplicitIndexFileImportRule,
        config: {
            type: 'commonjs'
        }
    },

    {
        enabled: true,
        reference: SimplePropertyAssignmentRule
    }
];
