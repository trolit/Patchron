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
    },

    vue: { SelfClosingTagRule, NormalizedEventHandlerRule },

    html: { MarkedCommentsRule: MarkedCommentsHTMLRule }
} = require('src/rules');

const {
    js: {
        MarkedCommentsRuleConfig,
        SimpleComparisionRuleConfig,
        IndividualMethodImportRuleConfig,
        SingleLineBlockPatternRuleConfig
    }
} = require('./common');

module.exports = [
    {
        enabled: true,
        reference: MarkedCommentsRule,
        config: MarkedCommentsRuleConfig
    },

    {
        enabled: true,
        reference: MarkedCommentsHTMLRule,
        config: MarkedCommentsRuleConfig
    },

    {
        enabled: true,
        reference: SelfClosingTagRule
    },

    {
        enabled: true,
        reference: PositionedKeywordsRule,
        config: {
            keywords: [
                {
                    name: 'import',
                    regex: /import.*/,
                    position: {
                        custom: {
                            name: '<script>',
                            expression: /<script>/,
                            BOF: false
                        }
                    },
                    maxLineBreaks: 0,
                    enforced: true,
                    breakOnFirstOccurence: false,
                    countDifferentCodeAsLineBreak: false,
                    multiLineOptions: [
                        {
                            indicator: {
                                notIncludes: 'from'
                            },
                            limiter: {
                                startsWith: '} from'
                            }
                        }
                    ],
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
                },
                {
                    path: 'src/helpers/*',
                    expectedName: /[a-z].*.js/
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
        config: IndividualMethodImportRuleConfig
    },

    {
        enabled: true,
        reference: SingleLineBlockPatternRule,
        config: SingleLineBlockPatternRuleConfig
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
        config: SimpleComparisionRuleConfig
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
            type: 'module'
        }
    },

    {
        enabled: true,
        reference: ImplicitIndexFileImportRule,
        config: {
            type: 'module'
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
