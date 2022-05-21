/**
 * returns nearest **hunk**
 *
 * @param {Array<string>} splitPatch - array including code
 * @param {number} startIndex - index of splitPatch row indicating where to start from
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
module.exports = (splitPatch, startIndex) => {
    let result = null;

    if (!Array.isArray(splitPatch) || !Number.isInteger(startIndex)) {
        return result;
    }

    for (let i = startIndex; i >= 0; i--) {
        const rowContent = splitPatch[i];

        if (rowContent.startsWith('@@')) {
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
