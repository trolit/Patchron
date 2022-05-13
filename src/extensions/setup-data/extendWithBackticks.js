const { CUSTOM_LINES } = require('../../config/constants');

/**
 * extends `setupData` collection with information about strings built with backticks (which can contain interpolated fragments). Lines that contain backticks will be expanded with properties mentioned below.
 *
 * **Note** that when `data` comes from `patch`, it can contain only part of multi line string with backticks disturbing method's outcome. Adjust extension behaviour by passing second argument to the method - settings. 
 * 
 * ```js
 * // extension additional settings:
 * {
 *      resultOnAbort: any, // decide what to return if `abort` occurs (when null, returns passed data)
 *      abortOnUnevenBackticksCountInPatch: boolean, // if true (not enough backticks), resultOnAbort is returned
 *      abortOnMultiLineStringWithoutEndIndex: boolean // if true (part of multi line string), resultOnAbort is returned
 * }
 * ```
 * 
 * ```js
 * // rows with backticks are extended with following properties
 *  {
 *      backticks: {
 *          startLineIndex: number, // in respect to `data` array
 *          endLineIndex: number, // in respect to `data` array
 *          thisLine: {
 *              firstBacktickIndex: number, // -1 if none found
 *              lastBacktickIndex: number, // -1 if none found,
 *              total: number
 *          }
 *      }
 *  }
 * ```
 *

 *
 * @param {Array<object>} data
 * @returns {Array<object>}
 */
module.exports = (
    data,
    settings = {
        resultOnAbort: null,
        abortOnUnevenBackticksCountInPatch: false,
        abortOnMultiLineStringWithoutEndIndex: false
    }
) => {
    const {
        resultOnAbort,
        abortOnUnevenBackticksCountInPatch,
        abortOnMultiLineStringWithoutEndIndex
    } = settings;

    const extendedData = [];
    const dataLength = data.length;

    if (
        abortOnUnevenBackticksCountInPatch &&
        !_hasEvenAmountOfBackticks(data)
    ) {
        return resultOnAbort || data;
    }

    for (let index = 0; index < dataLength; index++) {
        const { trimmedContent } = data[index];
        const trimmedContentBackticksCount = _countBackticks(trimmedContent);

        if (
            trimmedContentBackticksCount &&
            !CUSTOM_LINES.includes(trimmedContent)
        ) {
            const startLineIndex = index;

            if (trimmedContentBackticksCount % 2 === 0) {
                extendedData.push({
                    ...data[index],
                    ..._createBackticksObject(
                        trimmedContent,
                        startLineIndex,
                        startLineIndex
                    )
                });

                continue;
            } else {
                const endLineRow = _findRowWithUnevenBackticks(data, index);

                if (endLineRow) {
                    const { index: endLineIndex } = endLineRow;

                    for (
                        let localIndex = index;
                        localIndex <= endLineIndex;
                        localIndex++
                    ) {
                        const row = data[localIndex];
                        const { trimmedContent: line } = row;

                        extendedData.push({
                            ...row,
                            ..._createBackticksObject(
                                line,
                                startLineIndex,
                                endLineIndex
                            )
                        });
                    }

                    index = endLineIndex;

                    continue;
                } else if (
                    !endLineRow &&
                    abortOnMultiLineStringWithoutEndIndex
                ) {
                    return resultOnAbort || data;
                }
            }
        }

        extendedData.push({
            ...data[index],
            backticks: null
        });
    }

    return extendedData;
};

function _countBackticks(line) {
    let counter = line.split('`').length - 1;

    return line.includes('`') ? counter : 0;
}

function _hasEvenAmountOfBackticks(data) {
    const sum = data.reduce(
        (partialSum, { trimmedContent }) =>
            partialSum + _countBackticks(trimmedContent),
        0
    );

    return sum % 2 === 0;
}

/**
 * attempts to find `data` row that has uneven amount of backticks, starting from `startIndex + 1`
 */
function _findRowWithUnevenBackticks(data, startIndex) {
    const partOfData = data.slice(startIndex + 1);

    return partOfData.find(
        ({ trimmedContent }) => _countBackticks(trimmedContent) % 2 !== 0
    );
}

function _createBackticksObject(line, startLineIndex, endLineIndex) {
    return {
        backticks: {
            startLineIndex,
            endLineIndex,
            thisLine: {
                firstBacktickIndex: line.indexOf('`'),
                lastBacktickIndex: line.lastIndexOf('`'),
                total: _countBackticks(line)
            }
        }
    };
}