/**
 * returns array that gives information about content structure **(based on curly brackets)**
 * @param {Array<index: number, content: string>} data
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
module.exports = (data) => {
    let contentNests = [];
    const dataLength = data.length;

    for (let row = 0; row < dataLength; row++) {
        const { content: rowContent } = data[row];

        for (let charIndex = 0; charIndex < rowContent.length; charIndex++) {
            const char = rowContent[charIndex];

            if (char === '{') {
                contentNests.push({
                    from: row
                });
            } else if (char === '}') {
                for (let i = contentNests.length - 1; i >= 0; i--) {
                    if (contentNests[i].to) {
                        continue;
                    }

                    contentNests[i].to = row;

                    break;
                }
            }
        }
    }

    return contentNests;
};
