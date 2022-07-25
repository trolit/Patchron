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
                    order: 'ascending',
                    ignoreNewline: false,
                    multiLineOptions: [
                        {
                            indicator: {
                                notIncludes: 'from'
                            },
                            limiter: {
                                startsWith: '} = from'
                            }
                        }
                    ]
                },
                {
                    name: 'import (components)',
                    regex: /import.*@\/components.*/,
                    order: 'ascending',
                    ignoreNewline: false,
                    multiLineOptions: [
                        {
                            indicator: {
                                notIncludes: 'from'
                            },
                            limiter: {
                                startsWith: '} = from'
                            }
                        }
                    ]
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
                    name: 'require',
                    regex: /(.*require\(|^(const|let|var)(\s+)?{$)/,
                    position: {
                        custom: null,
                        BOF: true
                    },
                    maxLineBreaks: 1,
                    enforced: true,
                    breakOnFirstOccurence: false,
                    countDifferentCodeAsLineBreak: false,
                    multiLineOptions: [
                        {
                            indicator: {
                                expression: /^(const|let|var)(\s+)?{$/
                            },
                            limiter: {
                                startsWith: '} = require'
                            }
                        }
                    ]
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
