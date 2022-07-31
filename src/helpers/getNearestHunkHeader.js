const isArray = require('lodash/isArray');
const isInteger = require('lodash/isInteger');
const { HUNK_HEADER_INDICATOR } = require('src/config/constants');

/**
 * returns nearest **hunk**
 *
 * @param {Array<string>} splitPatch file content split by \n
 * @param {number} rowIndex index of row (in respect to local array)
 *
 * {@link https://www.edureka.co/community/7949/what-are-these-in-github}
 *
 * @example (a) = @
 * ┌─────────┬───────────────────────────────┐
 * │ (index) │            Values             │
 * ├─────────┼───────────────────────────────┤
 * │    0    │  '(a)(a) -0,0 +1,33 (a)(a)'   │
 * │    1    │ '+// SIMPLE "FLAVOUR" TESTS'  │
 * │    2    │              '+'              │
 * └─────────┴───────────────────────────────┘
 * {
 * | index: 0,
 * | sourceFile: { line: '0', length: '0' },
 * | modifiedFile: { line: '1', length: '33' }
 * }
 *
 * @returns {object}
 */
module.exports = (splitPatch, rowIndex) => {
    let result = null;

    if (
        !isArray(splitPatch) ||
        !isInteger(rowIndex) ||
        rowIndex >= splitPatch.length
    ) {
        return result;
    }

    for (let i = rowIndex; i >= 0; i--) {
        const rowContent = splitPatch[i];

        if (rowContent.startsWith(HUNK_HEADER_INDICATOR)) {
            const splitRowContent = rowContent.split(' ');

            if (splitRowContent.length < 3) {
                return result;
            }

            const sourceFile = splitRowContent[1].split(/[-,]/);
            const modifiedFile = splitRowContent[2].split(/[+,]/);

            result = {
                index: i,
                sourceFile: {
                    line: parseInt(sourceFile[1]),
                    length: parseInt(sourceFile[2])
                },
                modifiedFile: {
                    line: parseInt(modifiedFile[1]),
                    length: parseInt(modifiedFile[2])
                }
            };

            break;
        }
    }

    return result;
};
