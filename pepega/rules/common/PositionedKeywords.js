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
     * @param {{ file: object, keyword: object, matchedRows: Array<object>, indexOfCustomPosition: number, wasPositionEnforced: boolean }} data
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

            if (matchedRow.content === this.newLine) {
                lineBreakCounter++;

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

            if (matchedRow.index !== expectedIndex) {
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
        const { file, matchedRows, keyword, keywordsWithBOF } = data;

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

        reviewComments = this._reviewExactPosition({
            ...data,
            positionIndex: BOFIndex,
            wasPositionEnforced,
        });

        return reviewComments;
    }

    /**
     * @param {{ file: object, keyword: object, matchedRows: Array<object>, keywordsWithBOF: Array<object> }} data
     */
    _reviewKeywordWithEOF(data) {
        const { file, matchedRows, keyword, keywordsWithEOF } = data;

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

        reviewComments = this._reviewExactPosition({
            ...data,
            positionIndex: EOFIndex,
            wasPositionEnforced,
        });

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

    /**
     * @param {{ file: object, keyword: object, matchedRows: Array<object>, positionIndex: number, wasPositionEnforced: boolean }} data
     */
    _reviewExactPosition(data) {
        const { keyword, matchedRows, positionIndex, wasPositionEnforced } =
            data;

        let currentPositionIndex = positionIndex;

        const { maxLineBreaks } = keyword;
        let lineBreakCounter = 0;
        let reviewComments = [];
        let recentRow = null;

        for (let index = 0; index < matchedRows.length; index++) {
            const row = matchedRows[index];

            if (row.content !== this.newLine) {
                recentRow = row;
            }

            if (lineBreakCounter > maxLineBreaks) {
                reviewComments.push(
                    this.getSingleLineComment({
                        ...data,
                        body: this._getCommentBody(keyword, {
                            source: recentRow,
                            cause: 'maxLineBreaks',
                            position: positionIndex,
                            enforced: wasPositionEnforced,
                        }),
                        index: recentRow.index,
                    })
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

            if (
                row.index !== currentPositionIndex &&
                row.content !== this.newLine
            ) {
                keyword.position.BOF
                    ? currentPositionIndex++
                    : currentPositionIndex--;

                lineBreakCounter++;

                lineBreakCounter = 0;

                reviewComments.push(
                    this.getSingleLineComment({
                        ...data,
                        body: this._getCommentBody(keyword, {
                            source: row,
                            cause: 'position',
                            position: positionIndex,
                            enforced: wasPositionEnforced,
                        }),
                        index: row.index,
                    })
                );

                if (keyword.breakOnFirstOccurence) {
                    break;
                }

                continue;
            }
        }

        return reviewComments;
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
