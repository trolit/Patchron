const first = require('lodash/first');

/**
 * tests if given line is beginning of multi-line according to multi-line options and when it is, to returns multi-line structure.
 *
 * @param {Array<SplitPatchRow>} data
 * @param {number} currentLineIndex when true blocks that aren't completed will be included in result
 * @param {object} multiLineOptions
 *
 * @returns {object}
 */
module.exports = (data, currentLineIndex, multiLineOptions) => {
    const { trimmedContent } = data[currentLineIndex];
    const result = { isMultiLine: false };

    for (const options of multiLineOptions) {
        if (!options?.indicator || !options?.limiter) {
            continue;
        }

        const { indicator } = options;

        if (!_isMultiLine(indicator, trimmedContent)) {
            continue;
        }

        result.isMultiLine = true;

        const { limiter } = options;

        result.endIndex = _findEndIndex(data, currentLineIndex, limiter);

        break;
    }

    return result;
};

function _isMultiLine(indicator, content) {
    const propertyName = first(Object.keys(indicator));
    const propertyValue = indicator[propertyName];

    return _resolveProperty(propertyName, propertyValue, content);
}

function _findEndIndex(data, currentLineIndex, limiter) {
    const propertyName = first(Object.keys(limiter));
    const propertyValue = limiter[propertyName];

    const slicedData = data.slice(currentLineIndex + 1);
    const slicedDataLength = slicedData.length;

    for (let index = 0; index < slicedDataLength; index++) {
        const { trimmedContent, index: rowIndex } = data[index];

        if (propertyName === 'nextLine') {
            return rowIndex;
        }

        const isEndLine = _resolveProperty(
            propertyName,
            propertyValue,
            trimmedContent
        );

        if (isEndLine) {
            return rowIndex;
        }
    }

    return -1;
}

function _resolveProperty(propertyName, propertyValue, content) {
    switch (propertyName) {
        case 'startsWith':
            return content.startsWith(propertyValue);

        case 'endsWith':
            return content.endsWith(propertyValue);

        case 'expression':
            return content.match(propertyValue);

        default:
            return false;
    }
}
