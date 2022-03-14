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
                            direction: 'below',
                        },
                        BOF: false,
                        EOF: false,
                    },
                    maxLineBreaks: 0,
                    enforced: true,
                    breakOnFirstOccurence: false,
                },
            ],
        }),
    },
];
