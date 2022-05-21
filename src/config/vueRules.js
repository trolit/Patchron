const {
    common: { PositionedKeywordsRule }
} = require('../rules');

module.exports = [
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
    }
];
