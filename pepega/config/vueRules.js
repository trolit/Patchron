const PositionedKeywords = require('../rules/common/PositionedKeywords');

module.exports = [
    {
        enabled: true,
        instance: new PositionedKeywords({
            keywords: [
                {
                    name: 'import',
                    regex: /import.*/,
                    multilineOptions: ['from'],
                    position: {
                        custom: {
                            name: '<script>',
                            expression: /<script>/,
                        },
                        BOF: false,
                    },
                    maxLineBreaks: 0,
                    enforced: true,
                    breakOnFirstOccurence: false,
                    order: [
                        {
                            name: 'packages',
                            expression: /import(?!.*@).*/,
                        },
                        {
                            name: 'components',
                            expression: /import.*@\/components.*/,
                        },
                        {
                            name: 'helpers',
                            expression: /import.*@\/helpers.*/,
                        },
                    ],
                },
            ],
        }),
    },
];
