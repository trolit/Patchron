const {
    common: { PositionedKeywordsRule },
} = require('../rules');

module.exports = [
    {
        enabled: true,
        instance: new PositionedKeywordsRule({
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
