const dedent = require('dedent-js');
const BaseRule = require('../Base');
const removeWhitespaces = require('../../helpers/removeWhitespaces');
const getNearestHunkHeader = require('../../helpers/getNearestHunkHeader');

class PositionedKeywordsRule extends BaseRule {
    /**
     * @param {object} config
     * @param {Array<{name: string, regex: object, position: { custom: { name: string, expression: string|object, direction: string, }, BOF: boolean, EOF:boolean }, ignoreNewline: boolean, enforced: boolean }>} config.keywords
     * @param {string} config.keywords[].name - readable name
     * @param {object} config.keywords[].regex - matches line(s) that should be validated against rule
     * @param {Array<string>} config.keywords[].multilineOptions - if none of them will be included in matched line, line will be treated as multiline.
     * @param {object} config.keywords[].position - defines keyword expected position (custom, BOF or EOF). Configure each keyword with **only** one way of determining position.
     * @param {number} config.keywords[].maxLineBreaks - defines maximum allowed line breaks between each keyword. When 0, spaces between matched line(s) are counted as rule break
     * @param {boolean} config.keywords[].enforced - if **true**, forces to count first matched keyword occurence as expected position when primary one was not found in given file's patch
     * @param {boolean} config.keywords[].breakOnFirstOccurence - when **true**, stops keyword review on first invalid occurence
     */
    constructor(config) {
        super();

        const { keywords } = config;

        this.keywords = keywords;
    }

    invoke(file) {
        const keywords = this.keywords;

        if (!keywords.length) {
            probotInstance.log.error(
                `Couldn't run rule ${__filename} on ${file.filename}. No keywords defined.`
            );

            return [];
        }

        const { split_patch: splitPatch } = file;

        let reviewComments = [];

        for (const keyword of keywords) {
            if (!this._hasKeywordValidConfig(keyword)) {
                probotInstance.log.warn(
                    `${__filename}\nKeyword review skipped due to invalid config (one position config per keyword).`
                );

                continue;
            }

            const { matchedRows } = this._initializeRegexBasedData(
                splitPatch,
                keyword
            );

            if (matchedRows.length <= 1) {
                continue;
            }

            const { position } = keyword;

            if (position.custom !== null) {
                const { indexOfCustomPosition, wasPositionEnforced } =
                    this._findIndexOfCustomPosition(splitPatch, keyword);

                if (indexOfCustomPosition < 0) {
                    probotInstance.log.warn(
                        `${__filename}\nKeyword review skipped due to undefined position.`
                    );

                    continue;
                }

                reviewComments.push(
                    ...this._reviewKeywordWithCustomPosition(
                        file,
                        matchedRows,
                        keyword,
                        indexOfCustomPosition,
                        wasPositionEnforced
                    )
                );
            }

            if (position.BOF) {
                const keywordsWithBOF = keywords.filter(
                    (element) =>
                        element.position.BOF && element.regex !== keyword.regex
                );

                reviewComments.push(
                    ...this._reviewKeywordWithBOF(
                        file,
                        matchedRows,
                        keyword,
                        keywordsWithBOF
                    )
                );
            }

            if (position.EOF) {
                const keywordsWithEOF = keywords.filter(
                    (element) =>
                        element.position.EOF && element.regex !== keyword.regex
                );

                reviewComments.push(
                    ...this._reviewKeywordWithEOF(
                        file,
                        matchedRows,
                        keyword,
                        keywordsWithEOF
                    )
                );
            }
        }

        return reviewComments;
    }

    _hasKeywordValidConfig(keyword) {
        const isCustomPosition = !!keyword.position.custom;
        const { BOF, EOF } = keyword.position;

        return (
            [isCustomPosition, BOF, EOF].filter((value) => value).length === 1
        );
    }

    _findIndexOfCustomPosition(splitPatch, keyword) {
        let wasPositionEnforced = false;
        let indexOfCustomPosition = -1;
        let matchResult = null;

        const { expression } = keyword.position.custom;

        matchResult = splitPatch.find((row) =>
            typeof expression === 'object'
                ? row.match(expression)
                : row.includes(expression)
        );

        if (!matchResult && keyword.enforced) {
            matchResult = splitPatch.find((row) => row.match(keyword.regex));

            wasPositionEnforced = true;
        }

        if (matchResult) {
            indexOfCustomPosition = splitPatch.indexOf(matchResult);
        }

        return {
            indexOfCustomPosition,
            wasPositionEnforced,
        };
    }

    _reviewKeywordWithCustomPosition(
        file,
        matchedRows,
        keyword,
        indexOfCustomPosition,
        wasPositionEnforced
    ) {
        const reviewComments = this._reviewCustomPosition(
            file,
            matchedRows,
            keyword,
            indexOfCustomPosition,
            wasPositionEnforced
        );

        return reviewComments;
    }

    _reviewCustomPosition(
        file,
        matchedRows,
        keyword,
        indexOfCustomPosition,
        wasPositionEnforced
    ) {
        const { direction } = keyword.position.custom;
        const { maxLineBreaks } = keyword;
        const reviewComments = [];
        let lineBreakCounter = 0;

        if (direction === 'above') {
            matchedRows.reverse();
        }

        matchedRows = matchedRows.filter(
            (matchedRow) => matchedRow.index !== indexOfCustomPosition
        );

        indexOfCustomPosition =
            direction === 'above'
                ? indexOfCustomPosition - 1
                : indexOfCustomPosition + 1;

        let currentCustomPosition = indexOfCustomPosition;
        let lastRowWithCode = null;

        for (
            let index = 0;
            index < matchedRows.length;
            index++, currentCustomPosition++
        ) {
            const matchedRow = matchedRows[index];

            if (this.customLines.includes(matchedRow.content)) {
                lineBreakCounter++;

                continue;
            }

            if (matchedRow?.length) {
                direction === 'above'
                    ? (currentCustomPosition += matchedRow.length)
                    : (currentCustomPosition -= matchedRow.length);
            }

            if (
                (direction === 'below' &&
                    matchedRow.index < indexOfCustomPosition) ||
                (direction === 'above' &&
                    matchedRow.index > indexOfCustomPosition)
            ) {
                reviewComments.push(
                    this.getSingleLineComment(
                        file,
                        this._getCommentBody(keyword, {
                            source: matchedRow,
                            cause: 'wrongDirection',
                            position: matchedRow.index,
                            enforced: wasPositionEnforced,
                        }),
                        matchedRow.index
                    )
                );

                if (keyword.breakOnFirstOccurence) {
                    break;
                }

                continue;
            }

            if (maxLineBreaks && lineBreakCounter > maxLineBreaks) {
                reviewComments.push(
                    this.getSingleLineComment(
                        file,
                        this._getCommentBody(keyword, {
                            source: matchedRow,
                            cause: 'maxLineBreaks',
                            position: lastRowWithCode.index,
                            enforced: wasPositionEnforced,
                        }),
                        matchedRow.index
                    )
                );

                if (keyword.breakOnFirstOccurence) {
                    break;
                }

                lineBreakCounter = 0;

                lastRowWithCode = matchedRow;

                continue;
            }

            if (!maxLineBreaks && lineBreakCounter) {
                reviewComments.push(
                    this.getSingleLineComment(
                        file,
                        this._getCommentBody(keyword, {
                            source: matchedRow,
                            cause: 'maxLineBreaks',
                            position: lastRowWithCode.index,
                            enforced: wasPositionEnforced,
                        }),
                        matchedRow.index
                    )
                );

                if (keyword.breakOnFirstOccurence) {
                    break;
                }

                lineBreakCounter = 0;

                lastRowWithCode = matchedRow;

                continue;
            }

            const isInValidPosition =
                lastRowWithCode &&
                (direction === 'below'
                    ? matchedRow.index - 1 - lineBreakCounter
                    : matchedRow.index + 1 + lineBreakCounter) ===
                    lastRowWithCode.index;

            if (
                (index === 0 && currentCustomPosition !== matchedRow.index) ||
                (lastRowWithCode && !isInValidPosition)
            ) {
                reviewComments.push(
                    this.getSingleLineComment(
                        file,
                        this._getCommentBody(keyword, {
                            source: matchedRow,
                            cause: 'position',
                            position: matchedRow.index,
                            enforced: wasPositionEnforced,
                        }),
                        matchedRow.index
                    )
                );

                if (keyword.breakOnFirstOccurence) {
                    break;
                }
            }

            if (!this.customLines.includes(matchedRow.content)) {
                lastRowWithCode = matchedRow;
            }

            lineBreakCounter = 0;
        }

        return reviewComments;
    }

    _reviewKeywordWithBOF(file, matchedRows, keyword, keywordsWithBOF) {
        const { split_patch: splitPatch } = file;

        const topHunkHeader = getNearestHunkHeader(splitPatch, 0);
        const { line } = topHunkHeader.modifiedFile;
        let BOFIndex = line === 1 ? 0 : -1;
        let wasPositionEnforced = false;
        let reviewComments = [];

        if (BOFIndex === -1 && keyword.enforced) {
            const row = matchedRows.find(
                (row) => !this.customLines.includes(row.content)
            );

            BOFIndex = row ? row.index + 1 : -1;

            wasPositionEnforced = true;
        }

        if (BOFIndex === -1) {
            return reviewComments;
        }

        if (!wasPositionEnforced && keywordsWithBOF.length) {
            BOFIndex = this._correctPositionIndex(
                BOFIndex,
                keyword,
                splitPatch,
                keywordsWithBOF
            );
        }

        reviewComments = this._reviewExactPosition(
            file,
            keyword,
            matchedRows,
            BOFIndex,
            wasPositionEnforced
        );

        return reviewComments;
    }

    _reviewKeywordWithEOF(file, matchedRows, keyword, keywordsWithEOF) {
        const { split_patch: splitPatch } = file;
        matchedRows.reverse();

        const topHunkHeader = getNearestHunkHeader(splitPatch, 0);
        const { length } = topHunkHeader.modifiedFile;
        let EOFIndex = length === splitPatch.length - 1 ? length : -1;

        let wasPositionEnforced = false;
        let reviewComments = [];

        if (EOFIndex === -1 && keyword.enforced) {
            const row = matchedRows.find(
                (row) => !this.customLines.includes(row.content)
            );

            EOFIndex = row ? row.index - 1 : -1;

            wasPositionEnforced = true;
        }

        if (EOFIndex === -1) {
            return reviewComments;
        }

        if (!wasPositionEnforced && keywordsWithEOF.length) {
            EOFIndex = this._correctPositionIndex(
                EOFIndex,
                keyword,
                splitPatch,
                keywordsWithEOF
            );
        }

        reviewComments = this._reviewExactPosition(
            file,
            keyword,
            matchedRows,
            EOFIndex,
            wasPositionEnforced
        );

        return reviewComments;
    }

    _correctPositionIndex(indexOfPosition, keyword, splitPatch, otherKeywords) {
        const { BOF } = keyword.position;

        for (
            let index = indexOfPosition;
            BOF ? index < splitPatch.length : index >= 0;
            BOF ? index++ : index--
        ) {
            const row = splitPatch[index];

            const isNewLine = removeWhitespaces(row) === '+';

            const isMatched = otherKeywords.some((otherKeyword) =>
                row.match(otherKeyword.regex)
            );

            if (isNewLine || isMatched) {
                BOF ? indexOfPosition++ : indexOfPosition--;

                continue;
            }

            break;
        }

        return indexOfPosition;
    }

    _reviewExactPosition(
        file,
        keyword,
        matchedRows,
        positionIndex,
        wasPositionEnforced
    ) {
        const initialIndexPosition = positionIndex;
        const { maxLineBreaks } = keyword;
        let lineBreakCounter = 0;
        let reviewComments = [];
        let recentRow = null;

        for (let index = 0; index < matchedRows.length; index++) {
            const row = matchedRows[index];

            if (row.content !== this.newLine) {
                recentRow = row;
            }

            if (row?.length) {
                keyword.position.BOF
                    ? (positionIndex += row.length)
                    : (positionIndex -= row.length);
            }

            if (lineBreakCounter > maxLineBreaks) {
                reviewComments.push(
                    this.getSingleLineComment(
                        file,
                        this._getCommentBody(keyword, {
                            source: recentRow,
                            cause: 'maxLineBreaks',
                            position: initialIndexPosition,
                            enforced: wasPositionEnforced,
                        }),
                        recentRow.index
                    )
                );

                if (keyword.breakOnFirstOccurence) {
                    break;
                }

                lineBreakCounter = 0;

                continue;
            }

            if (maxLineBreaks && row.content === this.newLine) {
                lineBreakCounter++;

                continue;
            }

            if (row.index !== positionIndex) {
                keyword.position.BOF ? positionIndex++ : positionIndex--;

                lineBreakCounter++;

                lineBreakCounter = 0;

                reviewComments.push(
                    this.getSingleLineComment(
                        file,
                        this._getCommentBody(keyword, {
                            source: row,
                            cause: 'position',
                            position: initialIndexPosition,
                            enforced: wasPositionEnforced,
                        }),
                        row.index
                    )
                );

                if (keyword.breakOnFirstOccurence) {
                    break;
                }

                continue;
            }
        }

        return reviewComments;
    }

    _initializeRegexBasedData(splitPatch, keyword) {
        let matchedRows = [];
        let unchangedRows = [];

        for (let index = 0; index < splitPatch.length; index++) {
            const row = splitPatch[index];

            if (matchedRows.length && removeWhitespaces(row) === '+') {
                matchedRows.push({
                    index,
                    content: this.newLine,
                });

                continue;
            } else if (matchedRows.length && row.startsWith('-')) {
                matchedRows.push({
                    index,
                    content: this.merge,
                });

                continue;
            } else if (matchedRows.length && row.startsWith(' ')) {
                unchangedRows.push(index);
            }

            const matchResult = row.match(keyword.regex);

            if (!matchResult) {
                continue;
            }

            const content = matchResult[0].trim();

            if (
                keyword.multilineOptions?.length &&
                this._isMultiline(keyword, content)
            ) {
                const multilineEndIndex = this._resolveMultilineMatch(
                    keyword,
                    splitPatch,
                    index
                );

                matchedRows.push({
                    index,
                    content: splitPatch[multilineEndIndex].trim(),
                    length: multilineEndIndex - index,
                });

                index = index + multilineEndIndex - 1;

                continue;
            }

            matchedRows.push({
                index,
                content,
            });
        }

        return {
            matchedRows,
            unchangedRows,
        };
    }

    _isMultiline(keyword, line) {
        const { multilineOptions } = keyword;

        return !multilineOptions.some((option) => line.includes(option));
    }

    _getEndOfMultiline(keyword, splitPatch, currentIndex) {
        let multilineEndIndex = -1;

        for (let index = currentIndex + 1; index < splitPatch.length; index++) {
            const row = splitPatch[index];

            if (
                !row.startsWith('-') &&
                removeWhitespaces(row) !== '+' &&
                !this._isMultiline(keyword, row)
            ) {
                multilineEndIndex = index;

                break;
            }
        }

        return multilineEndIndex;
    }

    _getCommentBody(keyword, data) {
        const { cause, position: lineNumber, enforced } = data;

        const {
            name: keywordName,
            position: keywordPosition,
            maxLineBreaks,
        } = keyword;

        let reason = '++ undefined ++';

        switch (cause) {
            case 'maxLineBreaks':
                if (maxLineBreaks) {
                    reason = `\`${keywordName}\` exceeded allowed spacing (${maxLineBreaks}) in relation to line: \`${lineNumber}\` ${
                        enforced ? `(enforced)` : ``
                    }`;
                } else {
                    reason = `No spacing allowed between \`${keywordName}\` and line: \`${lineNumber}\` ${
                        enforced ? `(enforced)` : ``
                    }`;
                }

                break;

            case 'position':
            case 'wrongDirection':
                if (keywordPosition.custom) {
                    const customKeyword = keywordPosition.custom;

                    const expectedPosition = customKeyword.name?.length
                        ? customKeyword.name
                        : customKeyword.expression;

                    reason = `\`${keywordName}\` should appear \`${
                        customKeyword.direction
                    }\` ${
                        enforced
                            ? `line:\`${lineNumber}\` (enforced)`
                            : `\`${expectedPosition}\` (line:\`${lineNumber}\`)`
                    }`;
                } else {
                    reason = `\`${keywordName}\` should appear ${
                        enforced
                            ? `below line:\`${lineNumber}\` (enforced)`
                            : `at ${
                                  keywordPosition.BOF
                                      ? `beginning (below line:\`${lineNumber}\`)`
                                      : `end (under line:\`${lineNumber}\`)`
                              } of file`
                    }`;
                }

                break;
        }

        const commentBodyWithExplanation = `${reason} 
         
        <details>
            <summary> What enforced means? </summary> \n\n<em>When keyword has \`enforced\` flag enabled, it basically means that when pull requested file does not have expected position that was provided within configuration, but it has at least two keywords, first occurence will be counted as expected position, which means, remaining ones must be positioned in relation to first one.</em> 
        </details>`;

        return enforced ? dedent(commentBodyWithExplanation) : dedent(reason);
    }
}

module.exports = PositionedKeywordsRule;
