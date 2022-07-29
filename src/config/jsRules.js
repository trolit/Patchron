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
