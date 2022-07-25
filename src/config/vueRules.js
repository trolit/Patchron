const {
    common: { SelfClosingTagRule, PositionedKeywordsRule },
    js: { ImportWithoutExtensionRule },
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
                            name: 'components',
                            expression: /import.*@\/components.*/
                        },
                        {
                            name: 'helpers',
                            expression: /import.*@\/helpers.*/
                        }
                    ]
                }
            ]
        }
    },
    {
        enabled: false,
        reference: ImportWithoutExtensionRule,
        config: {
            type: 'module'
        }
    },
    {
        enabled: false,
        reference: NormalizedEventHandlerRule,
        config: {
            prefix: 'on',
            noUnnecessaryBraces: true
        }
    }
];
