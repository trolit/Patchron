const first = require('lodash/first');
const isEqual = require('lodash/isEqual');
const isString = require('lodash/isString');
const cloneDeep = require('lodash/cloneDeep');
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

    return _resolveProperty(propertyName, propertyValue, content, indicator);
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
            trimmedContent,
            limiter
        );

        if (isEndLine) {
            return index;
        }
    }

    return -1;
}

function _resolveProperty(propertyName, propertyValue, content, source = null) {
    let fixedContent = cloneDeep(content);

    if (source && source['until']) {
        const until = source['until'];

        fixedContent = fixedContent.split(until)[0];
    }

    switch (propertyName) {
        case 'startsWith':
            return fixedContent.startsWith(propertyValue);

        case 'notStartsWith':
            return !fixedContent.startsWith(propertyValue);

        case 'endsWith':
            return fixedContent.endsWith(propertyValue);

        case 'notEndsWith':
            return !fixedContent.endsWith(propertyValue);

        case 'includes':
            return fixedContent.includes(propertyValue);

        case 'notIncludes':
            return !fixedContent.includes(propertyValue);

        case 'equals':
            return isEqual(fixedContent, propertyValue);

        case 'notEquals':
            return !isEqual(fixedContent, propertyValue);

        case 'expression':
            return fixedContent.match(propertyValue);

        default:
            return false;
    }
}
