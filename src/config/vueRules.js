const {
    common: {
        SelfClosingTagRule,
        PositionedKeywordsRule,
        PredefinedFilenamesRule,
        KeywordsOrderedByLengthRule
    },

    js: {
        SimpleComparisionRule,
        AsynchronousPatternRule,
        ImportWithoutExtensionRule,
        ImplicitIndexFileImportRule,
        SimplePropertyAssignmentRule
    },

    vue: { NormalizedEventHandlerRule }
} = require('src/rules');

module.exports = [
    {
        enabled: true,
        reference: SelfClosingTagRule,
        config: {}
    },

    {
        enabled: true,
        reference: PositionedKeywordsRule,
        config: {
            keywords: [
                {
                    name: 'import',
                    regex: /import.*/,
                    multiLineOptions: ['from'],
                    position: {
                        custom: {
                            name: '<script>',
                            expression: /<script>/
                        },
                        BOF: false
                    },
                    maxLineBreaks: 0,
                    enforced: true,
                    breakOnFirstOccurence: false,
                    countDifferentCodeAsLineBreak: false,
                    order: [
                        {
                            name: 'packages',
                            expression: /import(?!.*@).*/
                        },
                        {
                            name: 'other',
                            expression: /import.*/
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
                    path: 'src/components/*',
                    expectedName: /[A-Z].*.vue/
                }
            ]
        }
    },

    {
        enabled: true,
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
    },

    {
        enabled: true,
        reference: NormalizedEventHandlerRule,
        config: {
            prefix: 'on',
            noUnnecessaryBraces: true
        }
    }
];
