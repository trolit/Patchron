/**
 * minifies row content so it's easier to compare if line starts with something particular
 * @param {string} content file content
 * @returns {string}
 */
module.exports = (rowContent) => {
    if (rowContent.length) {
        return rowContent.replace(/\s/g, '');
    }

    return rowContent;
};
