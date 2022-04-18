const BaseRule = require('../Base');
const dedent = require('dedent-js');

class KeywordsOrderedByLengthRule extends BaseRule {
    /**
     * @param {object} config
     * @param {Array<{name: string, regex: object, order: 'ascending'|'descending', ignoreNewline: boolean }>} config.keywords
     * @param {string} config.keywords[].name - readable name
     * @param {object} config.keywords[].regex - regular expression to match line with keyword
     * @param {string} config.keywords[].order - ascending/descending
     * @param {string} config.keywords[].ignoreNewline - when set to 'true' **(not recommended)**, rule is tested against all keywords
     * matched in given data and when 'false' **(recommended)**, only adjacent ones.
     *
     * e.g. when keywords are at lines: 0, 1, 2, 5, 6, 10, 'false' makes that rule apply only across group:
     * [0, 1, 2] and [5, 6].
     */
    constructor(config) {
        super();

        const { keywords } = config;

        this.keywords = keywords;
    }

    invoke(file) {
        const keywords = this.keywords;

        if (!keywords.length) {
            this.logError(__filename, 'No keywords defined.', file);

            return [];
        }

        const { split_patch: splitPatch } = file;

        let reviewComments = [];

        for (const keyword of keywords) {
            const { matchedRows, unchangedRows } =
                this.initializeRegexBasedData(splitPatch, keyword);

            if (matchedRows.length <= 1) {
                continue;
            }

            if (keyword.ignoreNewline) {
                reviewComments.push(
                    ...this._reviewLinesOrderIgnoringNewline({
                        file,
                        keyword,
                        matchedRows,
                    })
                );
            } else {
                reviewComments.push(
                    ...this._reviewLinesOrder({
                        file,
                        keyword,
                        matchedRows,
                        unchangedRows,
                    })
                );
            }
        }

        return reviewComments;
    }

    /**
     * @param {{ file: object, keyword: object, matchedRows: Array<object> }} data
     */
    _reviewLinesOrderIgnoringNewline(data) {
        const { matchedRows, keyword } = data;
        let reviewComments = [];

        const baseArray = this._removeCustomLinesFromArray(matchedRows);

        const expectedArray = this._sortArray(baseArray, keyword);

        for (let index = 0; index < baseArray.length; index++) {
            const baseRow = baseArray[index];
            const expectedRow = expectedArray[index];

            if (baseRow.content !== expectedRow.content) {
                reviewComments.push(
                    this.getSingleLineComment({
                        ...data,
                        body: this._getCommentBody(keyword),
                        index: baseRow.index,
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

        const splitSortedMatchedRows = this._splitRowsIntoGroups(
            matchedRows,
            keyword,
            true
        );

        let reviewComments = [];

        for (
            let groupIndex = 0;
            groupIndex < splitMatchedRows.length;
            groupIndex++
        ) {
            const group = splitMatchedRows[groupIndex];
            const sortedGroup = splitSortedMatchedRows[groupIndex];

            for (
                let elementIndex = 0;
                elementIndex < sortedGroup.length;
                elementIndex++
            ) {
                const groupElement = group[elementIndex];
                const sortedGroupElement = sortedGroup[elementIndex];

                if (sortedGroupElement.index !== groupElement.index) {
                    const rowsWithCode = group.filter(
                        ({ content }) => content !== this.MERGE
                    );

                    const { index: firstElementIndex } = rowsWithCode[0];
                    const { index: lastElementIndex } = rowsWithCode.pop();

                    reviewComments.push(
                        this.getMultiLineComment({
                            ...data,
                            body: this._getCommentBody(keyword),
                            from: firstElementIndex,
                            to: lastElementIndex,
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
            ({ content }) => !this.CUSTOM_LINES.includes(content)
        );
    }

    _sortArray(array, keyword) {
        const { order } = keyword;
        const customLines = this.CUSTOM_LINES;

        return [...array].sort((firstRow, secondRow) => {
            const { content: firstRowContent } = firstRow;
            const { content: secondRowContent } = secondRow;

            if (
                customLines.includes(firstRowContent) ||
                customLines.includes(secondRowContent) ||
                firstRowContent === secondRowContent
            ) {
                return 0;
            }

            switch (order) {
                case 'ascending':
                    return firstRowContent.length < secondRowContent.length
                        ? -1
                        : 1;

                case 'descending':
                    return firstRowContent.length > secondRowContent.length
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

        while (index < matchedRows.length) {
            let group = [];

            for (; index < matchedRows.length; index++) {
                const matchedRow = matchedRows[index];

                if (matchedRow.content.includes(this.NEWLINE)) {
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
            group.filter(({ content }) => content !== this.MERGE).length <= 1;

        return group === [] || hasNotEnoughRowsWithCode;
    }

    _getCommentBody(keyword) {
        const { order, name } = keyword;

        const commentBody = `Keep \`${order}\` order for keyword: \`${name}\``;

        return dedent(commentBody);
    }
}

module.exports = KeywordsOrderedByLengthRule;
