const PositionedKeywords = require('../rules/common/PositionedKeywords');

module.exports = [
    {
        enabled: true,
        instance: new PositionedKeywords({
            keywords: [
                {
                    name: 'import',
                    regex: /import.*/,
                    position: {
                        regex: /<script>/,
                        direction: 'above',
                    },
                    BOF: false,
                    EOF: false,
                    maxLineBreaks: 2,
                    enforced: false,
                    breakOnFirstOccurence: false,
                },
            ],
        }),
    },
];
