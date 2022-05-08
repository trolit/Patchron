const { CUSTOM_LINES } = require('../../config/constants');

/**
 * extends `setupData` collection with information about multi line strings, built with backticks that can contain interpolated fragments. Note that received patch can contain part of multi line string. In such case line won't be considered as multi line string. Lines that contain multi line strings will be expanded with following properties:
 *
 * ```js
 *  {
 *      multiLineString: {
 *          startsAt: number, // index of line of multi line string in respect to `data` array
 *          endsAt: number,
 *          thisRow: {
 *              firstBacktickAt: number, // -1 if none found
 *              lastBacktickAt: number, // -1 if none found,
 *              count: number
 *          }
 *      }
 *  }
 * ```
 *
 * @param {Array<object>} data
 * @returns {Array<object>}
 */
module.exports = (data) => {
    const extendedData = [];
    const dataLength = data.length;

    for (let index = 0; index < dataLength; index++) {
        const { trimmedContent } = data[index];

        const trimmedContentBackticksCount = _countBackticks(trimmedContent);

        if (
            trimmedContentBackticksCount % 2 !== 0 &&
            !CUSTOM_LINES.includes(trimmedContent)
        ) {
            const startsAt = index;

            const { index: nextUnevenBackticksCount } =
                _findUnevenBackticksCount(data, index);

            if (nextUnevenBackticksCount) {
                for (; index <= nextUnevenBackticksCount; index++) {
                    const { trimmedContent: line } = data[index];

                    extendedData.push({
                        ...data[index],
                        multiLineString: {
                            startsAt,
                            endsAt: nextUnevenBackticksCount,
                            thisRow: {
                                firstBacktickAt: line.indexOf('`'),
                                lastBacktickAt: line.lastIndexOf('`'),
                                totalBackticks: _countBackticks(line)
                            }
                        }
                    });
                }

                continue;
            }
        }

        extendedData.push({
            ...data[index],
            multiLineString: null
        });
    }

    return extendedData;
};

/**
 * counts template literals (`) occurences in given line
 * @param {string} line
 * @returns {number}
 */
function _countBackticks(line) {
    let counter = line.split('`').length - 1;

    return line.includes('`') ? counter : 0;
}

/**
 * @param {Array<object>} data
 * @param {number} startIndex - index of row where `countBackticks` returned un
 * @returns {object}
 */
function _findUnevenBackticksCount(data, startIndex) {
    const partOfData = data.slice(startIndex + 1);

    return partOfData.find(
        ({ trimmedContent }) => _countBackticks(trimmedContent) % 2 !== 0
    );
}
