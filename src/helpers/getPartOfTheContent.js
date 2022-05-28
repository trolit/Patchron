/**
 * attempts to extract specified part of data which can be either string or array of objects
 *
 * @param {Array<{index: number, content: string}> | string} data content
 * @param {object} restriction
 * @param {string|number} restriction.from start of the substring
 * @param {string|number} restriction.to end of the substring
 *
 * @returns {string} part of the content (or unchanged if indexes were not found)
 */
module.exports = (data, restriction) => {
    const { fromIndex, toIndex } = getIndexes(data, restriction);

    if (fromIndex === -1 || toIndex === -1) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.slice(fromIndex, toIndex);
    } else if (typeof data === 'string') {
        return data.substring(fromIndex, toIndex);
    }

    return data;
};

function getIndexes(data, restriction) {
    let toIndex = -1;
    let fromIndex = -1;

    const { from, to } = restriction;

    if (typeof from === 'string') {
        fromIndex = data.indexOf(from);
    } else if (typeof from === 'number') {
        fromIndex = from;
    }

    if (typeof to === 'string') {
        toIndex = data.indexOf(to) + to.length;
    } else if (typeof to === 'number') {
        toIndex = to;
    }

    return {
        fromIndex,
        toIndex
    };
}
