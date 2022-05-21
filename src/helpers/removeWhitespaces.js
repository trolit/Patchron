/**
 * minifies row content so it's easier to compare if line starts with something particular
 *
 * @param {string} content
 *
 * @returns {string}
 */
module.exports = (content) => {
    if (content.length) {
        return content.replace(/\s/g, '');
    }

    return content;
};
