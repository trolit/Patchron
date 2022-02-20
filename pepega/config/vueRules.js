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
                        direction: 'below',
                    },
                    BOF: false,
                    EOF: false,
                    allowNewline: false,
                    enforced: false,
                    breakOnFirstOccurence: false,
                },
            ],
        }),
    },
];
