const dedent = require('dedent-js');
const getLineNumber = require('../../helpers/getLineNumber');
const removeWhitespaces = require('../../helpers/removeWhitespaces');
const ReviewCommentBuilder = require('../../builders/ReviewComment');
const getNearestHunkHeader = require('../../helpers/getNearestHunkHeader');

class KeywordsOrderedByLengthRule {
    /**
     * @param {object} config
     * @param {Array<{name: string, regex: object, order: 'ascending'|'descending', ignoreNewline: boolean }>} config.keywords
     * @param {string} config.keywords[].name - readable name
     * @param {object} config.keywords[].regex - regular expression to match keyword
     * @param {string} config.keywords[].order - ascending/descending
     * @param {string} config.keywords[].ignoreNewline - when set to 'true' **(not recommended)**, rule is tested against all keywords
     * matched in file and when 'false' **(recommended)**, only adjacent ones.
     *
     * e.g. when keywords are at lines: 0, 1, 2, 5, 6, 10, 'false' makes that rule apply only across group:
     * [0, 1, 2] and [5, 6]).
     */
    constructor(config) {
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
            let matchedRows = [];

            // match rows (unchanged/added) with keyword
            for (let rowIndex = 0; rowIndex < splitPatch.length; rowIndex++) {
                const rowContent = splitPatch[rowIndex];
                const minifiedRowContent = removeWhitespaces(rowContent);

                if (
                    !minifiedRowContent.startsWith('+') &&
                    !rowContent.startsWith(' ')
                ) {
                    continue;
                }

                const matchResult = rowContent.match(keyword.regex);

                if (!matchResult) {
                    continue;
                }

                matchedRows.push({
                    rowIndex,
                    matchedContent: matchResult[0].trim(),
                });
            }

            if (matchedRows.length <= 1) {
                continue;
            }

            if (keyword.ignoreNewline) {
                reviewComments.push(
                    ...this._reviewLinesOrderIgnoringNewline(
                        file,
                        keyword,
                        matchedRows
                    )
                );
            } else {
                reviewComments.push(
                    ...this._reviewLinesOrder(file, keyword, matchedRows)
                );
            }
        }

        return reviewComments;
    }

    _reviewLinesOrderIgnoringNewline(file, keyword, baseArray) {
        let reviewComments = [];

        const sortedArray = this._sortArray(keyword, baseArray);

        for (let index = 0; index < sortedArray.length; index++) {
            if (baseArray[index].rowIndex !== sortedArray[index].rowIndex) {
                reviewComments.push(
                    this._getSingleLineComment(
                        file,
                        keyword,
                        baseArray[index].rowIndex
                    )
                );
            }
        }

        return reviewComments;
    }

    _reviewLinesOrder(file, keyword, baseArray) {
        let reviewComments = [];

        const sortedArray = [...baseArray].sort(
            (a, b) => a.rowIndex - b.rowIndex
        );

        const firstElementOfSortedArray = sortedArray[0];

        let previousRowIndex = firstElementOfSortedArray.rowIndex;

        let group = [firstElementOfSortedArray];

        let isEndOfGroup = false;

        for (let index = 1; index < baseArray.length; index++) {
            const { rowIndex: currentRowIndex } = sortedArray[index];

            if (previousRowIndex + 1 === currentRowIndex) {
                group.push(sortedArray[index]);

                isEndOfGroup = index === baseArray.length - 1;
            } else {
                if (group.length > 1) {
                    isEndOfGroup = true;
                }
            }

            if (isEndOfGroup && group.length > 1) {
                const isKeywordGroupProperlyOrdered =
                    this._isKeywordGroupProperlyOrdered(keyword, group);

                if (!isKeywordGroupProperlyOrdered) {
                    reviewComments.push(
                        this._getMultiLineComment(file, keyword, group)
                    );
                }

                group = [sortedArray[index]];
            }

            previousRowIndex = currentRowIndex;
        }

        return reviewComments;
    }

    _sortArray(keyword, array) {
        return [...array].sort(
            ({ matchedContent: element1 }, { matchedContent: element2 }) =>
                keyword.order === 'ascending'
                    ? element1.length - element2.length
                    : element2.length - element1.length
        );
    }

    _isKeywordGroupProperlyOrdered(keyword, group) {
        let isProperlyOrdered = true;

        const sortedGroup = this._sortArray(keyword, group);

        for (let index = 0; index < group.length; index++) {
            if (group[index].rowIndex !== sortedGroup[index].rowIndex) {
                isProperlyOrdered = false;

                break;
            }
        }

        return isProperlyOrdered;
    }

    _getSingleLineComment(file, keyword, rowIndex) {
        const { split_patch: splitPatch } = file;

        const { modifiedFile } = getNearestHunkHeader(splitPatch, rowIndex);

        if (!modifiedFile) {
            return null;
        }

        const line = getLineNumber(modifiedFile.line, rowIndex);

        const reviewCommentBuilder = new ReviewCommentBuilder(file);

        const comment = reviewCommentBuilder.buildSingleLineComment({
            body: this._getCommentBody(keyword, line),
            line,
            side: 'RIGHT',
        });

        return comment;
    }

    _getMultiLineComment(file, keyword, group) {
        const firstRowIndex = group[0].rowIndex;
        const lastRowIndex = group.pop().rowIndex;

        const { split_patch: splitPatch } = file;

        const { modifiedFile } = getNearestHunkHeader(
            splitPatch,
            firstRowIndex
        );

        if (!modifiedFile) {
            return null;
        }

        const start_line = getLineNumber(modifiedFile.line, firstRowIndex);

        const position = getLineNumber(modifiedFile.line, lastRowIndex);

        const reviewCommentBuilder = new ReviewCommentBuilder(file);

        const comment = reviewCommentBuilder.buildMultiLineComment({
            body: this._getCommentBody(
                keyword,
                start_line,
                start_line + position - 1
            ),
            start_line,
            start_side: 'RIGHT',
            position,
        });

        return comment;
    }

    _getCommentBody(keyword, start, end = 0) {
        const commentBody = `Keep \`${keyword.order}\` order for keyword: \`${
            keyword.name
        }\` (${end ? `lines: ${start}-${end}` : `line: ${start}`})`;

        return dedent(commentBody);
    }
}

module.exports = KeywordsOrderedByLengthRule;
