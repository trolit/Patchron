const MERGE = '<<< merge >>>';
const NEWLINE = '<<< newline >>>';
const COMMENTED_LINE = '<<< commented >>>';
const CUSTOM_LINES = [MERGE, NEWLINE, COMMENTED_LINE];

module.exports = Object.freeze({
    ADDED: '+',
    DELETED: '-',
    UNCHANGED: ' ',

    LEFT: 'LEFT',
    RIGHT: 'RIGHT',

    MERGE,
    NEWLINE,
    CUSTOM_LINES,
    COMMENTED_LINE,

    EMPTY: ''
});
