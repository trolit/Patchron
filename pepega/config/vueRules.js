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
                        after: /<script>/,
                        before: /export default {/,
                        BOF: false,
                        EOF: false,
                    },
                    allowLineBreaks: false,
                },
            ],
        }),
    },
];
