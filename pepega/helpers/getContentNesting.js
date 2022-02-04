const getPartOfTheContent = require('./getPartOfTheContent');

/**
 * returns array that gives information about content structure **(based on curly brackets)**
 * @param {string} content decoded file content
 * @param {object} restriction optional param that allows to focus only on given fragment
 * @param {string} restriction.from
 * @param {string} restriction.to
 * @example
 * 0 | 'module.exports = () => {'
 * 1 | 'if (condition1) {'
 * 2 | 'if (condition2) {'
 * 3 | 'console.log(\'log\');'
 * 4 | '}'
 * 5 | '}'
 * 6 | '}'
 *
 * // yields
 * [
 *  { from: 0, to: 6 },
 *  { from: 1, to: 5 },
 *  { from: 2, to: 4 }
 *  ...,
 * ]
 *
 * @returns {Array<{from, to}>}
 */
module.exports = (content, restriction = null) => {
    let splitContent = content.split('\n');

    if (restriction) {
        splitContent = getPartOfTheContent(content, restriction);
    }

    let contentNests = [];

    for (let row = 0; row < splitContent.length; row++) {
        const rowContent = splitContent[row];

        for (let charIndex = 0; charIndex < rowContent.length; charIndex++) {
            const char = rowContent[charIndex];

            if (char === '{') {
                contentNests.push({
                    from: row,
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
