const getNearestHunkHeader = require('./getNearestHunkHeader');

/**
 * translates row index of array split in Pepega.js into GitHub line number
 * @param {Array<string>} content file content split by \n
 * @param {string} side left | right
 * @param {number} rowIndex index of row to get GitHub line number
 *
 * @example
 *  * getPosition(content, 2) => 2
 * ┌─────────┬─────────────────────────┐
 * │ (index) │          Values         │
 * ├─────────┼─────────────────────────┤
 * │    0    │  '@@ -26,15 +26,16...'  │
 * │    1    │         '+...'          │
 * │    2    │         '+...'          │
 * │    3    │         '-...'          │
 * └─────────┴─────────────────────────┘
 *
 * @returns {number}
 */
module.exports = (content, rowIndex) => {
    const { index: nearestHunkHeaderIndex } = getNearestHunkHeader(
        content,
        rowIndex
    );

    // TODO: REFACTOR!!

    let counter = 0;

    for (let index = nearestHunkHeaderIndex; index < content.length; index++) {
        if (index == rowIndex) {
            break;
        }

        counter++;
    }

    return counter;
};
