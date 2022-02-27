const BaseRule = require('../Base');
const removeWhitespaces = require('../../helpers/removeWhitespaces');
const getNearestHunkHeader = require('../../helpers/getNearestHunkHeader');

const merge = '<<< merge >>>';
const newLine = '<<< new line >>>';
const customLines = [newLine, merge];

class PositionedKeywordsRule extends BaseRule {
    /**
     * @param {object} config
     * @param {Array<{name: string, regex: object, position: { regex: object, direction: 'below'|'above' }, BOF: boolean,
     * EOF: boolean, ignoreNewline: boolean, enforced: boolean }>} config.keywords
     * @param {string} config.keywords[].name - readable name
     * @param {object} config.keywords[].regex - matches line(s) that should be validated against rule
     * ---------------------
     * #### Defining position
     * Configure each keyword with **only** one way of finding position (custom regex, BOF or EOF).
     * @param {object} config.keywords[].position - **[option 1]**
     * defines keyword expected position via custom regex and direction (below/above)
     * @param {object} config.keywords[].position.regex - matches position via regex
     * @param {object} config.keywords[].position.direction - whether lines should be positioned above or below position matched
     * via regex
     * @param {boolean} config.keywords[].BOF - **[option 2]**
     * when set to true, beginning of file is claimed position
     * @param {boolean} config.keywords[].EOF - **[option 3]**
     * when set to true, end of file is keyword's position
     * ---------------------
     * #### Flags
     *
     * @param {number} config.keywords[].maxLineBreaks - when 0, spaces between matched line(s) are counted as rule break
     * @param {boolean} config.keywords[].enforced - when true, if file's patch contains matched keyword but does not
     * include position, most upper keyword that was matched will act as position
     * @param {boolean} config.keywords[].breakOnFirstOccurence - when true, stops keyword review on first wrong occurence
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

            if (keyword.position !== null) {
                const indexOfCustomPosition = this._findIndexOfCustomPosition(
                    splitPatch,
                    keyword
                );

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
                        indexOfCustomPosition
                    )
                );
            }

            if (keyword.BOF) {
                const keywordsWithBOF = keywords.filter(
                    (element) => element.BOF && element.regex !== keyword.regex
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

            if (keyword.EOF) {
                const keywordsWithEOF = keywords.filter(
                    (element) => element.EOF && element.regex !== keyword.regex
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
        const isPositionSet = !!keyword.position;

        const { BOF, EOF } = keyword;

        return [isPositionSet, BOF, EOF].filter((value) => value).length === 1;
    }

    _findIndexOfCustomPosition(splitPatch, keyword) {
        let rowIndex = -1;
        let matchResult = null;

        matchResult = splitPatch.find((row) =>
            row.match(keyword.position.regex)
        );

        if (!matchResult && keyword.enforced) {
            matchResult = splitPatch.find((row) => row.match(keyword.regex));
        }

        if (matchResult) {
            rowIndex = splitPatch.indexOf(matchResult);
        }

        return rowIndex;
    }

    _reviewKeywordWithCustomPosition(
        file,
        matchedRows,
        keyword,
        indexOfCustomPosition
    ) {
        const reviewComments = this._reviewCustomPosition(
            file,
            matchedRows,
            keyword,
            indexOfCustomPosition
        );

        return reviewComments;
    }

    _reviewCustomPosition(file, matchedRows, keyword, indexOfCustomPosition) {
        const { direction } = keyword.position;
        const { maxLineBreaks } = keyword;
        const reviewComments = [];
        let lineBreakCounter = 0;

        if (direction === 'above') {
            matchedRows.reverse();
        }

        // above: let index = indexOfCustomPosition - 1; index > 0; index--
        // below: let index = indexOfCustomPosition + 1; index < matchedRows.length; index++

        const { split_patch: splitPatch } = file;
        let matchedRowIndex = 0;

        matchedRows = matchedRows.filter(
            (matchedRow) => !customLines.includes(matchedRow.content)
        );

        let index =
            direction === 'above'
                ? indexOfCustomPosition - 1
                : indexOfCustomPosition + 1;

        let wasAnyRowAtDifferentDirection = false;

        for (
            ;
            direction === 'above' ? index >= 0 : index < splitPatch.length;
            direction === 'above' ? index-- : index++
        ) {
            if (matchedRowIndex >= matchedRows.length) {
                break;
            }

            const row = splitPatch[index];
            const matchedRow = matchedRows[matchedRowIndex];

            if (
                direction === 'below' &&
                matchedRow.index < indexOfCustomPosition
            ) {
                reviewComments.push(
                    this.getSingleLineComment(
                        file,
                        this._getCommentBody(keyword),
                        matchedRow.index
                    )
                );

                matchedRowIndex++;

                wasAnyRowAtDifferentDirection = true;

                continue;
            } else if (
                direction === 'above' &&
                matchedRow.index > indexOfCustomPosition
            ) {
                reviewComments.push(
                    this.getSingleLineComment(
                        file,
                        this._getCommentBody(keyword),
                        matchedRow.index
                    )
                );

                matchedRowIndex++;

                wasAnyRowAtDifferentDirection = true;

                continue;
            }

            if (wasAnyRowAtDifferentDirection) {
                break;
            }

            if (lineBreakCounter > maxLineBreaks) {
                reviewComments.push(
                    this.getSingleLineComment(
                        file,
                        this._getCommentBody(keyword),
                        index
                    )
                );

                lineBreakCounter = 0;
                matchedRowIndex++;

                if (keyword.breakOnFirstOccurence) {
                    break;
                }

                continue;
            }

            if (maxLineBreaks && (row.trim().length === 0 || row === '+')) {
                lineBreakCounter++;

                continue;
            }

            if (!row.includes(matchedRow.content)) {
                reviewComments.push(
                    this.getSingleLineComment(
                        file,
                        this._getCommentBody(keyword),
                        matchedRow.index
                    )
                );

                if (keyword.breakOnFirstOccurence) {
                    break;
                }
            }

            lineBreakCounter = 0;
            matchedRowIndex++;
        }

        if (
            matchedRowIndex < matchedRows.length &&
            !wasAnyRowAtDifferentDirection
        ) {
            while (matchedRowIndex < matchedRows.length) {
                reviewComments.push(
                    this.getSingleLineComment(
                        file,
                        this._getCommentBody(keyword),
                        matchedRows[matchedRowIndex].index
                    )
                );

                matchedRowIndex++;
            }
        }

        return reviewComments;
    }

    _reviewKeywordWithBOF(file, matchedRows, keyword, keywordsWithBOF) {
        const { split_patch: splitPatch } = file;

        const topHunkHeader = getNearestHunkHeader(splitPatch, 0);
        const { line } = topHunkHeader.modifiedFile;
        let BOFIndex = line === 1 ? 0 : -1;
        const { maxLineBreaks } = keyword;
        let wasPositionEnforced = false;
        let lineBreakCounter = 0;
        let reviewComments = [];

        if (BOFIndex === -1 && keyword.enforced) {
            const row = matchedRows.find(
                (row) => !customLines.includes(row.content)
            );

            BOFIndex = row ? row.index + 1 : -1;

            wasPositionEnforced = true;
        }

        if (BOFIndex === -1) {
            return reviewComments;
        }

        if (!wasPositionEnforced && keywordsWithBOF.length) {
            BOFIndex = this._correctBOFIndexPosition(
                BOFIndex,
                splitPatch,
                keywordsWithBOF
            );
        }

        let recentRow = null;

        for (let index = 0; index < matchedRows.length; index++) {
            const row = matchedRows[index];

            if (row.content !== newLine) {
                recentRow = row;
            }

            if (lineBreakCounter > maxLineBreaks) {
                reviewComments.push(
                    this.getSingleLineComment(
                        file,
                        this._getCommentBody(keyword),
                        recentRow.index
                    )
                );

                if (keyword.breakOnFirstOccurence) {
                    break;
                }

                lineBreakCounter = 0;

                continue;
            }

            if (row.content === newLine) {
                lineBreakCounter++;

                continue;
            }

            if (row.index !== BOFIndex) {
                BOFIndex++;

                lineBreakCounter++;

                lineBreakCounter = 0;

                reviewComments.push(
                    this.getSingleLineComment(
                        file,
                        this._getCommentBody(keyword),
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

    _correctBOFIndexPosition(BOFIndex, splitPatch, keywordsWithBOF) {
        let counter = 0;

        for (let index = 1; index < splitPatch.length; index++) {
            const row = splitPatch[index];
            const isNewLine = removeWhitespaces(row) === '+';
            const isMatched = keywordsWithBOF.some((keywordWithBOF) =>
                row.match(keywordWithBOF.regex)
            );

            if (isNewLine || isMatched) {
                counter++;

                continue;
            }

            break;
        }

        return BOFIndex + counter;
    }

    _reviewKeywordWithEOF(file, matchedRows, keyword, keywordsWithEOF) {
        const { split_patch: splitPatch } = file;
        matchedRows.reverse();

        const topHunkHeader = getNearestHunkHeader(splitPatch, 0);
        const { length } = topHunkHeader.modifiedFile;
        let EOFIndex = length === splitPatch.length - 1 ? length : -1;
        const { maxLineBreaks } = keyword;
        let wasPositionEnforced = false;
        let lineBreakCounter = 0;
        let reviewComments = [];

        if (EOFIndex === -1 && keyword.enforced) {
            const row = matchedRows.find(
                (row) => !customLines.includes(row.content)
            );

            EOFIndex = row ? row.index - 1 : -1;

            wasPositionEnforced = true;
        }

        if (EOFIndex === -1) {
            return reviewComments;
        }

        if (!wasPositionEnforced && keywordsWithEOF.length) {
            EOFIndex = this._correctEOFIndexPosition(
                EOFIndex,
                splitPatch,
                keywordsWithEOF
            );
        }

        let recentRow = null;

        for (let index = 0; index < matchedRows.length; index++) {
            const row = matchedRows[index];

            if (row.content !== newLine) {
                recentRow = row;
            }

            if (lineBreakCounter > maxLineBreaks) {
                reviewComments.push(
                    this.getSingleLineComment(
                        file,
                        this._getCommentBody(keyword),
                        recentRow.index
                    )
                );

                if (keyword.breakOnFirstOccurence) {
                    break;
                }

                lineBreakCounter = 0;

                continue;
            }

            if (row.content === newLine) {
                lineBreakCounter++;

                continue;
            }

            if (row.index !== EOFIndex) {
                EOFIndex--;

                lineBreakCounter++;

                lineBreakCounter = 0;

                reviewComments.push(
                    this.getSingleLineComment(
                        file,
                        this._getCommentBody(keyword),
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

    _correctEOFIndexPosition(EOFIndex, splitPatch, keywordsWithEOF) {
        for (let index = EOFIndex; index >= 0; index--) {
            const row = splitPatch[index];

            const isNewLine = removeWhitespaces(row) === '+';

            const isMatched = keywordsWithEOF.some((keywordWithEOF) =>
                row.match(keywordWithEOF.regex)
            );

            if (isNewLine || isMatched) {
                EOFIndex--;

                continue;
            }

            break;
        }

        return EOFIndex;
    }

    _initializeRegexBasedData(splitPatch, keyword) {
        let matchedRows = [];
        let unchangedRows = [];

        for (let index = 0; index < splitPatch.length; index++) {
            const row = splitPatch[index];

            if (matchedRows.length && removeWhitespaces(row) === '+') {
                matchedRows.push({
                    index,
                    content: newLine,
                });

                continue;
            } else if (matchedRows.length && row.startsWith('-')) {
                matchedRows.push({
                    index,
                    content: merge,
                });

                continue;
            } else if (matchedRows.length && row.startsWith(' ')) {
                unchangedRows.push(index);
            }

            const matchResult = row.match(keyword.regex);

            if (!matchResult) {
                continue;
            }

            matchedRows.push({
                index,
                content: matchResult[0].trim(),
            });
        }

        return {
            matchedRows,
            unchangedRows,
        };
    }

    _getCommentBody(keyword) {
        // TODO:
    }
}

module.exports = PositionedKeywordsRule;
