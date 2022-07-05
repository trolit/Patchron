const first = require('lodash/first');
const isString = require('lodash/isString');
const { CUSTOM_LINES } = require('src/config/constants');

/**
 * returns whether given line is beginning of multi-line (`indicator`) and (when it is) attempts to find in `data` line that is end of multi-line (`limiter`). if `limiter` is not found, `endIndex` equals `-1`.
 *
 * @param {Array<SplitPatchRow>} data received via `setupData`
 * @param {number} currentLineIndex
 * @param {Array<MultiLineOption>} multiLineOptions
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
    const propertyName = first(Object.getOwnPropertyNames(indicator));
    const propertyValue = indicator[propertyName];

    return _resolveProperty(propertyName, propertyValue, content);
}

function _findEndIndex(data, currentLineIndex, limiter) {
    const propertyName = isString(limiter)
        ? limiter
        : first(Object.getOwnPropertyNames(limiter));

    const propertyValue = limiter[propertyName];

    const slicedData = data.slice(currentLineIndex + 1);

    for (const row of slicedData) {
        const { trimmedContent, index } = row;

        if (CUSTOM_LINES.includes(trimmedContent)) {
            continue;
        }

        if (propertyName === 'nextLine') {
            return index;
        }

        const isEndLine = _resolveProperty(
            propertyName,
            propertyValue,
            trimmedContent
        );

        if (isEndLine) {
            return index;
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
