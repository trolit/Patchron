const MERGE = '<<< merge >>>';
const NEWLINE = '<<< newline >>>';
const CUSTOM_LINES = [MERGE, NEWLINE];

module.exports = Object.freeze({
    ADDED: '+',
    DELETED: '-',
    UNCHANGED: ' ',

    LEFT: 'LEFT',
    RIGHT: 'RIGHT',

    MERGE,
    NEWLINE,
    CUSTOM_LINES,
});
