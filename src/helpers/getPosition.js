const getNearestHunkHeader = require('./getNearestHunkHeader');

/**
 * translates row index of array split in Pepega.js into GitHub line number
 *
 * @param {Array<string>} splitPatch file splitPatch split by \n
 * @param {number} rowIndex index of row to get GitHub line number
 * @param {string} side left | right
 *
 * @example
 * getPosition(splitPatch, 2) => 2
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
module.exports = (splitPatch, rowIndex, side = 'RIGHT') => {
    const { index: nearestHunkHeaderIndex } = getNearestHunkHeader(
        splitPatch,
        rowIndex
    );

    let counter = 0;
    const splitPatchLength = splitPatch.length;
    const ignoreCharacter = side === 'RIGHT' ? '-' : '+';

    for (
        let index = nearestHunkHeaderIndex;
        index < splitPatchLength;
        index++
    ) {
        if (splitPatch[index].startsWith(ignoreCharacter)) {
            continue;
        }

        if (index == rowIndex) {
            break;
        }

        counter++;
    }

    return counter;
};
