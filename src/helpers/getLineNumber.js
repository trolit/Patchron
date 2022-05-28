const removeWhitespaces = require('./removeWhitespaces');
const getNearestHunkHeader = require('./getNearestHunkHeader');

/**
 * translates row index into GitHub line number
 *
 * @param {Array<string>} content file content split by \n
 * @param {string} side left | right
 * @param {number} rowIndex index of row to get GitHub line number
 *
 * @example
 *  getLineNumber(content, 'right', 5) => 29
 *  getLineNumber(content, 'left', 2) => 26
 * ┌─────────┬─────────────────────────┐
 * │ (index) │          Values         │
 * ├─────────┼─────────────────────────┤
 * │    0    │  '@@ -26,15 +26,16...'  │
 * │    1    │         '+...'          │
 * │    2    │         '-...'          │
 * │    3    │         ' ...'          │
 * │    4    │         ' ...'          │
 * │    5    │         '+...'          │
 * │    6    │         '-...'          │
 * └─────────┴─────────────────────────┘
 *
 * @returns {number}
 */
module.exports = (content, side = 'RIGHT', rowIndex) => {
    const {
        index: nearestHunkHeaderIndex,
        modifiedFile,
        sourceFile
    } = getNearestHunkHeader(content, rowIndex);

    let counter = side === 'RIGHT' ? modifiedFile.line : sourceFile.line;

    const prefixToIgnore = side === 'RIGHT' ? '-' : '+';

    if (nearestHunkHeaderIndex === rowIndex) {
        return counter;
    }

    const contentLength = content.length;

    for (
        let index = nearestHunkHeaderIndex + 1;
        index < contentLength;
        index++
    ) {
        if (index == rowIndex) {
            break;
        }

        const minifiedRow = removeWhitespaces(content[index]);

        if (!minifiedRow.startsWith(prefixToIgnore)) {
            counter++;
        }
    }

    return counter;
};
