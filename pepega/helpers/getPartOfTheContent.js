/**
 * returns specified part from the content
 * @param {string} content decoded file content
 * @typedef {object} restriction
 * @param {string} restriction.from start of the substring
 * @param {string} restriction.to end of the substring
 * @returns {string|null} part of the content (if indexes were found)
 */
module.exports = (content, restriction) => {
    const { from, to } = restriction;

    const leftIndex = content.indexOf(from);
    const rightIndex = content.indexOf(to) + to.length;

    if (leftIndex && rightIndex) {
        return content.substring(leftIndex, rightIndex);
    }

    probotInstance.log.warn(
        `Couldn't extract | from: ${from}, to: ${to} | from given content -> ${__filename}`
    );

    return null;
};
