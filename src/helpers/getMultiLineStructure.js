const first = require('lodash/first');
const isArray = require('lodash/isArray');
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
 * @param {object} [matchRegex] regex that was used to match line for further processing. When provided, protects from case when multiLineStructure takes endIndex that belongs to next indicator.
 *
 * @returns {object}
 */
module.exports = (data, currentLineIndex, multiLineOptions, matchRegex) => {
    const result = { isMultiLine: false };

    for (const options of multiLineOptions) {
        if (!options?.limiter) {
            continue;
        }

        const indicator = options?.indicator;

        if (indicator && !_isMultiLine(indicator, data[currentLineIndex])) {
            continue;
        }

        result.isMultiLine = true;

        const { limiter } = options;

        if (isArray(limiter)) {
            for (const element of limiter) {
                const endIndex = _findEndIndex(
                    data,
                    currentLineIndex,
                    element,
                    matchRegex
                );

                if (~endIndex) {
                    result.endIndex = endIndex;

                    break;
                }
            }
        } else {
            result.endIndex = _findEndIndex(
                data,
                currentLineIndex,
                limiter,
                matchRegex
            );
        }

        break;
    }

    return result;
};

function _isMultiLine(indicator, row) {
    const [propertyName, propertyValue] = _destructureIndicator(indicator);

    return _resolveProperty(indicator, propertyName, propertyValue, row, null);
}

function _findEndIndex(data, currentLineIndex, limiter, matchRegex) {
    const [propertyName, propertyValue] = _destructureLimiter(limiter);

    const slicedData = data.slice(
        limiter?.testInIndicator ? currentLineIndex : currentLineIndex + 1
    );

    let wasFirstRowSkipped = false;

    for (const row of slicedData) {
        const { trimmedContent, index } = row;

        if (CUSTOM_LINES.includes(trimmedContent)) {
            continue;
        }

        if (propertyName === 'nextLine') {
            return index;
        }

        const isEndLine = _resolveProperty(
            limiter,
            propertyName,
            propertyValue,
            data[currentLineIndex],
            row
        );

        if (isEndLine) {
            return index;
        }

        if ((limiter?.testInIndicator && !wasFirstRowSkipped) || !matchRegex) {
            wasFirstRowSkipped = true;

            continue;
        }

        const isAnotherMultiLineCaseFound = trimmedContent.match(matchRegex);

        if (isAnotherMultiLineCaseFound) {
            return -1;
        }
    }

    return -1;
}

function _resolveProperty(
    source,
    propertyName,
    propertyValue,
    indicatorRow,
    limiterRow
) {
    const { trimmedContent } = limiterRow || indicatorRow;

    let fixedContent = cloneDeep(trimmedContent);

    if (source && source['indentation'] && limiterRow) {
        const indentation = source['indentation'];

        if (!_isIndentationValid(indentation, indicatorRow, limiterRow)) {
            return false;
        }
    }

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

        case 'regex':
            return fixedContent.match(propertyValue);
    }

    return false;
}

function _isIndentationValid(indentation, indicatorRow, limiterRow) {
    const { indentation: limiterRowIndentation } = limiterRow;

    let leftOperand = null;
    let operatorName = null;
    let rightOperand = null;

    if (isString(indentation)) {
        const [operator, value] = indentation.split('-');

        if (value !== 'indicator') {
            return false;
        }

        const { indentation: indicatorRowIndentation } = indicatorRow;

        operatorName = operator;
        leftOperand = limiterRowIndentation;
        rightOperand = indicatorRowIndentation;
    } else if (isArray(indentation)) {
        const [operator, value] = indentation;

        operatorName = operator;
        leftOperand = limiterRowIndentation;
        rightOperand = value;
    }

    switch (operatorName) {
        case 'eq':
            return leftOperand === rightOperand;

        case 'gt':
            return leftOperand > rightOperand;

        case 'ge':
            return leftOperand >= rightOperand;

        case 'lt':
            return leftOperand < rightOperand;

        case 'le':
            return leftOperand <= rightOperand;

        default:
            return false;
    }
}

function _destructureIndicator(indicator) {
    const propertyName = first(Object.getOwnPropertyNames(indicator));
    const propertyValue = indicator[propertyName];

    return [propertyName, propertyValue];
}

function _destructureLimiter(limiter) {
    const propertyName = isString(limiter)
        ? limiter
        : first(Object.getOwnPropertyNames(limiter));

    const propertyValue = limiter[propertyName];

    return [propertyName, propertyValue];
}
