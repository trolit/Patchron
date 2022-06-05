/// <reference path="../config/type-definitions/common.js" />

/**
 * returns braces structure. **By default** does not return structures that are incomplete due to lack of information.
 *
 * @param {Array<SplitPatchRow>} data
 * @param {boolean} keepIncompleteBlocks when true blocks that aren't completed will be included in result
 * @example
 *
 * ```
 * 0 | 'module.exports = () => {'
 * 1 | 'if (condition1) {'
 * 2 | 'if (condition2) {'
 * 3 | 'console.log(\'log\');'
 * 4 | '}'
 * 5 | '}'
 * 6 | '}'
 *
 * // gives
 * const result = [
 *  { from: 0, to: 6 },
 *  { from: 1, to: 5 },
 *  { from: 2, to: 4 }
 * ]
 * ```
 *
 * @returns {Array<{from, to}>}
 */
module.exports = (data, keepIncompleteBlocks = false) => {
    const blocks = [];
    const dataLength = data.length;

    for (let index = 0; index < dataLength; index++) {
        const { trimmedContent } = data[index];
        const trimmedContentLength = trimmedContent.length;

        for (
            let characterIndex = 0;
            characterIndex < trimmedContentLength;
            characterIndex++
        ) {
            const character = trimmedContent[characterIndex];

            if (character === '{') {
                blocks.push({
                    from: index
                });
            } else if (character === '}') {
                for (let i = blocks.length - 1; i >= 0; i--) {
                    if (blocks[i].to) {
                        continue;
                    }

                    blocks[i].to = index;

                    break;
                }
            }
        }
    }

    return keepIncompleteBlocks
        ? blocks
        : blocks.filter(({ from, to }) => from && to);
};
