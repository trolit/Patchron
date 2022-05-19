/// <reference path="../../config/type-definitions/rules/KeywordsOrderedByLength.js" />

const BaseRule = require('../Base');
const dedent = require('dedent-js');

class KeywordsOrderedByLengthRule extends BaseRule {
    /**
     * @param {PepegaContext} pepegaContext
     * @param {Config} config
     * @param {Patch} file
     */
    constructor(pepegaContext, config, file) {
        super(pepegaContext, file);

        const { keywords } = config;

        this.keywords = keywords;
    }

    invoke() {
        const keywords = this.keywords;

        if (!keywords.length) {
            this.log.warning(__filename, 'No keywords defined.', this.file);

            return [];
        }

        const reviewComments = [];

        const data = this.setupData(this.file.splitPatch);

        for (const keyword of keywords) {
            const { matchedRows, unchangedRows } = this._matchKeywordData(
                data,
                keyword
            );

            if (matchedRows.length <= 1) {
                continue;
            }

            if (keyword.ignoreNewline) {
                reviewComments.push(
                    ...this._reviewLinesOrderIgnoringNewline({
                        keyword,
                        matchedRows
                    })
                );
            } else {
                reviewComments.push(
                    ...this._reviewLinesOrder({
                        keyword,
                        matchedRows,
                        unchangedRows
                    })
                );
            }
        }

        return reviewComments;
    }

    _matchKeywordData(data, keyword) {
        let matchedRows = [];
        let unchangedRows = [];
        const dataLength = data.length;

        for (let index = 0; index < dataLength; index++) {
            const { trimmedContent } = data[index];

            if (this.CUSTOM_LINES.includes(trimmedContent)) {
                matchedRows.push({
                    index,
                    trimmedContent
                });

                continue;
            }

            const matchResult = trimmedContent.match(keyword.regex);

            if (!matchResult) {
                continue;
            }

            const matchResultTrimmedContent = matchResult[0].trim();

            if (
                keyword?.multilineOptions &&
                this.isPartOfMultiLine(keyword, matchResultTrimmedContent)
            ) {
                const multilineEndIndex = this.getMultiLineEndIndex(
                    data,
                    keyword,
                    index
                );

                const { trimmedContent: endRowTrimmedContent } =
                    data[multilineEndIndex];

                matchedRows.push({
                    index,
                    trimmedContent: endRowTrimmedContent,
                    length: multilineEndIndex - index
                });

                index = multilineEndIndex;

                continue;
            }

            matchedRows.push({
                index,
                trimmedContent: matchResultTrimmedContent
            });
        }

        return {
            matchedRows,
            unchangedRows
        };
    }

    /**
     * @param {{ file: object, keyword: object, matchedRows: Array<object> }} data
     */
    _reviewLinesOrderIgnoringNewline(data) {
        const { matchedRows, keyword } = data;
        const reviewComments = [];

        const baseArray = this._removeCustomLinesFromArray(matchedRows);
        const baseArrayLength = baseArray.length;

        const expectedArray = this._sortArray(baseArray, keyword);

        for (let index = 0; index < baseArrayLength; index++) {
            const baseRow = baseArray[index];
            const expectedRow = expectedArray[index];

            if (baseRow.trimmedContent !== expectedRow.trimmedContent) {
                reviewComments.push(
                    this.getSingleLineComment({
                        body: this._getCommentBody(keyword),
                        index: baseRow.index
                    })
                );
            }
        }

        return reviewComments;
    }

    /**
     * @param {{ file: object, keyword: object, matchedRows: Array<object>, unchangedRows: Array<object> }} data
     */
    _reviewLinesOrder(data) {
        const { matchedRows, keyword } = data;

        const splitMatchedRows = this._splitRowsIntoGroups(
            matchedRows,
            keyword
        );
        const splitMatchedRowsLength = splitMatchedRows.length;

        const splitSortedMatchedRows = this._splitRowsIntoGroups(
            matchedRows,
            keyword,
            true
        );

        const reviewComments = [];

        for (
            let groupIndex = 0;
            groupIndex < splitMatchedRowsLength;
            groupIndex++
        ) {
            const group = splitMatchedRows[groupIndex];
            const sortedGroup = splitSortedMatchedRows[groupIndex];
            const sortedGroupLength = sortedGroup.length;

            for (
                let elementIndex = 0;
                elementIndex < sortedGroupLength;
                elementIndex++
            ) {
                const groupElement = group[elementIndex];
                const sortedGroupElement = sortedGroup[elementIndex];

                if (sortedGroupElement.index !== groupElement.index) {
                    const rowsWithCode = group.filter(
                        ({ trimmedContent }) => trimmedContent !== this.MERGE
                    );

                    const { index: firstElementIndex } = rowsWithCode[0];
                    const { index: lastElementIndex } = rowsWithCode.pop();

                    reviewComments.push(
                        this.getMultiLineComment({
                            body: this._getCommentBody(keyword),
                            from: firstElementIndex,
                            to: lastElementIndex
                        })
                    );

                    break;
                }
            }
        }

        return reviewComments;
    }

    _removeCustomLinesFromArray(array) {
        return array.filter(
            ({ trimmedContent }) => !this.CUSTOM_LINES.includes(trimmedContent)
        );
    }

    _sortArray(array, keyword) {
        const { order } = keyword;
        const customLines = this.CUSTOM_LINES;

        return [...array].sort((firstRow, secondRow) => {
            const { trimmedContent: firstRowTrimmedContent } = firstRow;
            const { trimmedContent: secondRowTrimmedContent } = secondRow;

            if (
                customLines.includes(firstRowTrimmedContent) ||
                customLines.includes(secondRowTrimmedContent) ||
                firstRowTrimmedContent === secondRowTrimmedContent
            ) {
                return 0;
            }

            switch (order) {
                case 'ascending':
                    return firstRowTrimmedContent.length <
                        secondRowTrimmedContent.length
                        ? -1
                        : 1;

                case 'descending':
                    return firstRowTrimmedContent.length >
                        secondRowTrimmedContent.length
                        ? -1
                        : 1;

                default:
                    return 0;
            }
        });
    }

    _splitRowsIntoGroups(matchedRows, keyword, withSort = false) {
        let index = 0;
        let result = [];
        const matchedRowsLength = matchedRows.length;

        while (index < matchedRowsLength) {
            let group = [];

            for (; index < matchedRowsLength; index++) {
                const matchedRow = matchedRows[index];

                if (matchedRow.trimmedContent.includes(this.NEWLINE)) {
                    index++;

                    break;
                }

                group.push(matchedRow);
            }

            if (this._isInvalidGroup(group)) {
                continue;
            }

            result.push(withSort ? this._sortArray(group, keyword) : group);
        }

        return result;
    }

    _isInvalidGroup(group) {
        const hasNotEnoughRowsWithCode =
            group.filter(({ trimmedContent }) => trimmedContent !== this.MERGE)
                .length <= 1;

        return group === [] || hasNotEnoughRowsWithCode;
    }

    _getCommentBody(keyword) {
        const { order, name } = keyword;

        const commentBody = `Keep \`${order}\` order for keyword: \`${name}\``;

        return dedent(commentBody);
    }
}

module.exports = KeywordsOrderedByLengthRule;
