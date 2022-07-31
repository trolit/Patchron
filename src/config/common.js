module.exports = {
    js: {
        MarkedCommentsRuleConfig: {
            prefixes: [
                {
                    value: '@TODO',
                    meaning: 'not implemented feature'
                },
                {
                    value: '@TMP',
                    meaning: 'temporary solution'
                },
                {
                    value: '@NOTE',
                    meaning: 'information about package/code'
                }
            ],
            isAppliedToSingleLineComments: true,
            isAppliedToMultiLineComments: true,
            isAppliedToInlineComments: true
        },

        IndividualMethodImportRuleConfig: {
            packages: [
                {
                    name: 'lodash',
                    expression: /[(|'|"|`]lodash[)|'|"|`]/
                }
            ]
        },

        SingleLineBlockPatternRuleConfig: {
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
        },

        SimpleComparisionRuleConfig: {
            patterns: [
                {
                    name: 'eq/ne (true, false)',
                    expression: /(!={1,2}|={2,3})(\s)*?(true|false)/,
                    comment: `\`value === true\`, \`value !== false\` -> \`value\`
                    \`value === false\`, \`value !== true\` -> \`!value\``,
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
                    comment: `\`value === null/undefined\` -> \`!value\`
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
                    comment: `\`value !== -1\` -> \`~value\``
                }
            ]
        }
    }
};
