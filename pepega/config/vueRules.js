const PositionedKeywords = require('../rules/common/PositionedKeywords');

module.exports = [
    {
        enabled: true,
        instance: new PositionedKeywords({
            keywords: [
                // {
                //     name: 'import',
                //     regex: /import.*/,
                //     position: null,
                //     BOF: false,
                //     EOF: true,
                //     maxLineBreaks: 2,
                //     enforced: false,
                //     breakOnFirstOccurence: false,
                // },
                {
                    name: 'import',
                    regex: /import.*/,
                    position: {
                        name: '<script>',
                        regex: /<script>/,
                        direction: 'below',
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
