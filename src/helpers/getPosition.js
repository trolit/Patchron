const getNearestHunkHeader = require('./getNearestHunkHeader');

/**
 * translates row index of local array into respective position in GitHub. Note that `position` is required to mark end of multi-line comment.
 *
 * @param {Array<string>} splitPatch file content split by \n
 * @param {number} rowIndex index of row (in respect to local array)
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
    const nearestHunkHeader = getNearestHunkHeader(splitPatch, rowIndex);

    if (!nearestHunkHeader || rowIndex >= splitPatch.length) {
        return -1;
    }

    let counter = 0;
    const splitPatchLength = splitPatch.length;
    const ignoreCharacter = side === 'RIGHT' ? '-' : '+';

    for (
        let index = nearestHunkHeader.index;
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
