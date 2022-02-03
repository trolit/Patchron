/**
 * returns nearest **hunk**
 * @param {Array<string>} splitContent array including code
 * @param {number} row index of current loop iteration.
 *
 * @link https://www.edureka.co/community/7949/what-are-these-in-github
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
module.exports = (splitContent, row) => {
    let result = null;

    if (!Array.isArray(splitContent) || !row) {
        probotInstance.log.warn(
            `Invalid data passed to the function -> ${__filename}`
        );

        return result;
    }

    for (let i = row; i >= 0; i--) {
        const rowContent = splitContent[i];

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
                    line: sourceFile[1],
                    length: sourceFile[2],
                },
                modifiedFile: {
                    line: modifiedFile[1],
                    length: modifiedFile[2],
                },
            };

            break;
        }
    }

    return result;
};
