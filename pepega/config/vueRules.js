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
                        direction: 'down',
                    },
                    BOF: false,
                    EOF: false,
                    ignoreNewline: false,
                },
            ],
        }),
    },
];
