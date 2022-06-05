const removeWhitespaces = require('./removeWhitespaces');
const getNearestHunkHeader = require('./getNearestHunkHeader');

/**
 * translates row index into GitHub line number
 *
 * @param {Array<string>} splitPatch file content split by \n
 * @param {string} side left | right
 * @param {number} rowIndex index of row (in respect to local array)
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
module.exports = (splitPatch, side = 'RIGHT', rowIndex) => {
    const nearestHunkHeader = getNearestHunkHeader(splitPatch, rowIndex);

    if (!nearestHunkHeader) {
        return -1;
    }

    const {
        index: nearestHunkHeaderIndex,
        modifiedFile,
        sourceFile
    } = nearestHunkHeader;

    let counter = side === 'RIGHT' ? modifiedFile.line : sourceFile.line;

    if (nearestHunkHeaderIndex === rowIndex) {
        return counter;
    }

    const contentLength = splitPatch.length;
    const prefixToIgnore = side === 'RIGHT' ? '-' : '+';

    for (
        let index = nearestHunkHeaderIndex + 1;
        index < contentLength;
        index++
    ) {
        if (index == rowIndex) {
            break;
        }

        const minifiedRow = removeWhitespaces(splitPatch[index]);

        if (!minifiedRow.startsWith(prefixToIgnore)) {
            counter++;
        }
    }

    return counter;
};
