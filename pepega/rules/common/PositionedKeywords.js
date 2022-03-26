const dedent = require('dedent-js');
const BaseRule = require('../Base');
const getLineNumber = require('../../helpers/getLineNumber');
const removeWhitespaces = require('../../helpers/removeWhitespaces');
const getNearestHunkHeader = require('../../helpers/getNearestHunkHeader');

class PositionedKeywordsRule extends BaseRule {
    /**
     * @param {object} config
     * @param {Array<{name: string, regex: object, position: { custom: { name: string, expression: string|object }, BOF: boolean, EOF:boolean }, ignoreNewline: boolean, enforced: boolean }>} config.keywords
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

            const { matchedRows } = this.initializeRegexBasedData(
                splitPatch,
                keyword
            );

            if (matchedRows.length <= 1) {
                continue;
            }

            const { position } = keyword;

            if (position.custom !== null) {
                const { customPositionIndex, wasPositionEnforced } =
                    this._findIndexOfCustomPosition(splitPatch, keyword);

                if (customPositionIndex < 0) {
                    probotInstance.log.warn(
                        `${__filename}\nKeyword review skipped due to undefined position.`
                    );

                    continue;
                }

                reviewComments.push(
                    ...this._reviewCustomPosition({
                        file,
                        matchedRows,
                        keyword,
                        customPositionIndex,
                        wasPositionEnforced,
                    })
                );
            }

            if (position.BOF) {
                const keywordsWithBOF = keywords.filter(
                    (element) =>
                        element.position.BOF && element.regex !== keyword.regex
                );

                reviewComments.push(
                    ...this._reviewKeywordWithBOF({
                        file,
                        matchedRows,
                        keyword,
                        keywordsWithBOF,
                    })
                );
            }

            if (position.EOF) {
                const keywordsWithEOF = keywords.filter(
                    (element) =>
                        element.position.EOF && element.regex !== keyword.regex
                );

                reviewComments.push(
                    ...this._reviewKeywordWithEOF({
                        file,
                        matchedRows,
                        keyword,
                        keywordsWithEOF,
                    })
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
        let customPositionIndex = -1;
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
            customPositionIndex = splitPatch.indexOf(matchResult);
        }

        return {
            customPositionIndex,
            wasPositionEnforced,
        };
    }

    /**
     * @param {{ file: object, keyword: object, matchedRows: Array<object>, customPositionIndex: number, wasPositionEnforced: boolean }} data
     */
    _reviewCustomPosition(data) {
        const {
            file,
            matchedRows,
            keyword,
            customPositionIndex,
            wasPositionEnforced,
        } = data;

        if (wasPositionEnforced) {
            matchedRows.splice(
                matchedRows.findIndex(
                    (matchedRow) => matchedRow.index === customPositionIndex
                ),
                1
            );
        }

        const reviewComments = [];
        const { EOF } = keyword.position;
        const { split_patch: splitPatch } = file;
        const { maxLineBreaks, breakOnFirstOccurence } = keyword;

        for (
            let index = 0,
                recentRow = null,
                lineBreakCounter = 0,
                expectedIndex = customPositionIndex + 1;
            index < matchedRows.length;
            index++, expectedIndex++
        ) {
            const matchedRow = matchedRows[index];

            if (matchedRow.index < expectedIndex) {
                reviewComments.push(
                    this.getSingleLineComment({
                        ...data,
                        body: this._getCommentBody(keyword, {
                            source: matchedRow,
                            cause: 'position',
                            position: getLineNumber(
                                splitPatch,
                                'RIGHT',
                                matchedRow.index
                            ),
                            enforced: wasPositionEnforced,
                        }),
                        index: matchedRow.index,
                    })
                );

                if (breakOnFirstOccurence) {
                    break;
                }

                continue;
            }

            if (maxLineBreaks && matchedRow.content === this.newLine) {
                lineBreakCounter++;

                continue;
            } else if (!maxLineBreaks && matchedRow.content === this.newLine) {
                const endIndex = this._getIndexOfLastLineBreak(
                    matchedRows,
                    index
                );

                if (endIndex === index) {
                    reviewComments.push(
                        this.getSingleLineComment({
                            ...data,
                            body: this._getCommentBody(keyword, {
                                source: matchedRow,
                                cause: 'noLineBreaks',
                            }),
                            index: matchedRow.index,
                        })
                    );
                } else {
                    reviewComments.push(
                        this.getMultiLineComment({
                            ...data,
                            body: this._getCommentBody(keyword, {
                                source: matchedRow,
                                cause: 'noLineBreaks',
                            }),
                            from: matchedRow.index,
                            to: matchedRows[endIndex].index,
                        })
                    );

                    index = endIndex;
                }

                if (breakOnFirstOccurence) {
                    break;
                }

                continue;
            }

            if (matchedRow.content === this.merge) {
                continue;
            }

            if (maxLineBreaks && lineBreakCounter > maxLineBreaks) {
                reviewComments.push(
                    this.getSingleLineComment({
                        ...data,
                        body: this._getCommentBody(keyword, {
                            source: matchedRow,
                            cause: 'maxLineBreaks',
                            position: getLineNumber(
                                splitPatch,
                                'RIGHT',
                                recentRow.index
                            ),
                            enforced: wasPositionEnforced,
                        }),
                        index: matchedRow.index,
                    })
                );

                lineBreakCounter = 0;

                if (breakOnFirstOccurence) {
                    break;
                }

                continue;
            }

            if (
                (!EOF && matchedRow.index !== expectedIndex) ||
                (EOF && index !== expectedIndex)
            ) {
                reviewComments.push(
                    this.getSingleLineComment({
                        ...data,
                        body: this._getCommentBody(keyword, {
                            source: matchedRow,
                            cause: 'position',
                            position: getLineNumber(
                                splitPatch,
                                'RIGHT',
                                recentRow.index
                            ),
                            enforced: wasPositionEnforced,
                        }),
                        index: matchedRow.index,
                    })
                );

                lineBreakCounter = 0;

                if (breakOnFirstOccurence) {
                    break;
                }
            }

            recentRow = matchedRow;
        }

        return reviewComments;
    }

    /**
     * @param {{ file: object, keyword: object, matchedRows: Array<object>, keywordsWithBOF: Array<object> }} data
     */
    _reviewKeywordWithBOF(data) {
        const { file, keyword, keywordsWithBOF } = data;

        const { split_patch: splitPatch } = file;
        let reviewComments = [];

        if (this._includesBOF(splitPatch)) {
            let BOFIndex = 1;

            if (keywordsWithBOF?.length) {
                BOFIndex = this._correctPositionIndex(
                    BOFIndex,
                    keyword,
                    splitPatch,
                    keywordsWithBOF
                );
            }

            reviewComments = this._reviewExactPosition({
                ...data,
                positionIndex: BOFIndex,
            });
        } else if (keyword.enforced) {
            const BOFIndex = splitPatch.findIndex((row) =>
                row.match(keyword.regex)
            );

            reviewComments = this._reviewCustomPosition({
                ...data,
                customPositionIndex: BOFIndex,
                wasPositionEnforced: true,
            });
        }

        return reviewComments;
    }

    /**
     * @param {{ file: object, keyword: object, matchedRows: Array<object>, keywordsWithEOF: Array<object> }} data
     */
    _reviewKeywordWithEOF(data) {
        const { file, matchedRows, keyword, keywordsWithEOF } = data;

        matchedRows.reverse();

        const { split_patch: splitPatch } = file;
        let reviewComments = [];

        if (this._includesEOF(splitPatch)) {
            let EOFIndex = splitPatch.length - 1;

            if (keywordsWithEOF?.length) {
                EOFIndex = this._correctPositionIndex(
                    EOFIndex,
                    keyword,
                    splitPatch,
                    keywordsWithEOF
                );
            }

            reviewComments = this._reviewExactPosition({
                ...data,
                positionIndex: EOFIndex,
            });
        } else if (keyword.enforced) {
            const EOFIndex = splitPatch.lastIndexOf((matchedRow) =>
                matchedRow.match(keyword.regex)
            );

            reviewComments = this._reviewCustomPosition({
                ...data,
                customPositionIndex: EOFIndex,
                wasPositionEnforced: true,
            });
        }

        return reviewComments;
    }

    /**
     * @param {{ file: object, keyword: object, matchedRows: Array<object>, positionIndex: number }} data
     */
    _reviewExactPosition(data) {
        const { keyword, matchedRows, positionIndex } = data;

        let reviewComments = [];
        const { BOF } = keyword.position;
        const { maxLineBreaks, breakOnFirstOccurence } = keyword;

        for (
            let index = 0,
                recentRow = null,
                lineBreakCounter = 0,
                expectedIndex = positionIndex;
            index < matchedRows.length;
            index++, BOF ? expectedIndex++ : expectedIndex--
        ) {
            const matchedRow = matchedRows[index];

            if (matchedRow.content === this.merge) {
                continue;
            }

            if (maxLineBreaks && lineBreakCounter > maxLineBreaks) {
                reviewComments.push(
                    this.getSingleLineComment({
                        ...data,
                        body: this._getCommentBody(keyword, {
                            source: recentRow,
                            cause: 'maxLineBreaks',
                            position: positionIndex,
                        }),
                        index: recentRow.index,
                    })
                );

                if (breakOnFirstOccurence) {
                    break;
                }

                lineBreakCounter = 0;

                continue;
            }

            if (maxLineBreaks && matchedRow.content === this.newLine) {
                lineBreakCounter++;

                continue;
            } else if (!maxLineBreaks && matchedRow.content === this.newLine) {
                const endIndex = this._getIndexOfLastLineBreak(
                    matchedRows,
                    index
                );

                if (endIndex === index) {
                    reviewComments.push(
                        this.getSingleLineComment({
                            ...data,
                            body: this._getCommentBody(keyword, {
                                source: matchedRow,
                                cause: 'noLineBreaks',
                            }),
                            index: matchedRow.index,
                        })
                    );
                } else {
                    reviewComments.push(
                        this.getMultiLineComment({
                            ...data,
                            body: this._getCommentBody(keyword, {
                                source: matchedRow,
                                cause: 'noLineBreaks',
                            }),
                            from: matchedRow.index,
                            to: matchedRows[endIndex].index,
                        })
                    );

                    index = endIndex;
                }

                if (breakOnFirstOccurence) {
                    break;
                }

                continue;
            }

            if (matchedRow.index !== expectedIndex) {
                reviewComments.push(
                    this.getSingleLineComment({
                        ...data,
                        body: this._getCommentBody(keyword, {
                            source: matchedRow,
                            cause: 'position',
                            position: positionIndex,
                        }),
                        index: matchedRow.index,
                    })
                );

                lineBreakCounter = 0;

                if (breakOnFirstOccurence) {
                    break;
                }

                continue;
            }

            recentRow = matchedRow;
        }

        return reviewComments;
    }

    _getIndexOfLastLineBreak(matchedRows, firstLineBreakIndex) {
        let endIndex = firstLineBreakIndex;

        for (
            let index = firstLineBreakIndex + 1;
            index < matchedRows.length;
            index++
        ) {
            if (matchedRows[index].content === this.newLine) {
                endIndex = index;

                continue;
            }

            break;
        }

        return endIndex;
    }

    _includesBOF(splitPatch) {
        const topHunkHeader = getNearestHunkHeader(splitPatch, 0);
        const { line } = topHunkHeader.modifiedFile;

        return line === 1;
    }

    _includesEOF(splitPatch) {
        const topHunkHeader = getNearestHunkHeader(splitPatch, 0);
        const { length } = topHunkHeader.modifiedFile;

        return length === splitPatch.length - 1;
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

    _getCommentBody(keyword, data) {
        const { cause, position: lineNumber, enforced } = data;

        const {
            name: keywordName,
            position: keywordPosition,
            maxLineBreaks,
        } = keyword;

        let reason = '++ undefined ++';

        switch (cause) {
            case 'noLineBreaks':
                reason = `There should not be any line breaks`;

                break;

            case 'maxLineBreaks':
                reason = `\`${keywordName}\` exceeded allowed spacing (${maxLineBreaks}) in relation to line: \`${lineNumber}\` ${
                    enforced ? `(enforced)` : ``
                }`;

                break;

            case 'position':
                if (keywordPosition.custom) {
                    reason = `\`${keywordName}\` should appear under line: \`${lineNumber}\` ${
                        enforced ? '(enforced)' : ''
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
